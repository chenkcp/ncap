/**
 * VerifyPIDService.js
 * 
 * Node.js translation of VB6: Function VerifyId(ID) As Boolean
 * 
 * What this does (same logic as VB):
 * 1) Validate PID length = 16
 * 2) If RunType === "Production": check local DB PENS table to see if PID already exists
 *    (excluding SyncState REMOVE/DELETE). If exists, fail and include the lotId in message.
 * 3) Query DB (product_ref_llk) by PartNumber to get expected rules:
 *    - mid_cd, lotid_cd, pica_cd, prod_gen_cd
 * 4) Check first 4 chars of PID is included in mid_cd
 * 5) Check lot product char (saved setting "Nextcap\\Lot\\ProductChar") matches expected lotid_cd
 *    unless RunType === "Engineering"
 */

import sequelize from '../config/databases.js'
import { QueryTypes } from 'sequelize'

// In-memory settings cache
const settingsCache = new Map()

/**
 * Get setting from cache
 * @param {string} app 
 * @param {string} section 
 * @param {string} key 
 * @returns {string|null}
 */
function getSetting(app, section, key) {
  const cacheKey = `${app}|${section}|${key}`
  return settingsCache.get(cacheKey) ?? null
}

/**
 * Save setting to cache
 * @param {string} app 
 * @param {string} section 
 * @param {string} key 
 * @param {string} value 
 */
function saveSetting(app, section, key, value) {
  const cacheKey = `${app}|${section}|${key}`
  settingsCache.set(cacheKey, value)
}

/**
 * Result codes for verification
 */
const VerifyResultCode = {
  SUCCESS: 'SUCCESS',
  INVALID_LENGTH: 'INVALID_LENGTH',
  ALREADY_IN_LOT: 'ALREADY_IN_LOT',
  UNKNOWN_PRODUCT: 'UNKNOWN_PRODUCT',
  MID_MISMATCH: 'MID_MISMATCH',
  LOTID_FORMAT_MISMATCH: 'LOTID_FORMAT_MISMATCH',
  ERROR: 'ERROR'
}

/**
 * Verify a Pen ID
 * 
 * @param {string} penId - The pen ID to verify
 * @param {Object} options - Verification options
 * @param {string} options.runType - 'Production' or 'Engineering'
 * @param {string} options.partNumber - The part number to validate against
 * @returns {Promise<{ok: boolean, code?: string, message?: string, details?: any}>}
 */
async function verifyId(penId, options = {}) {
  const { runType = 'Production', partNumber = '' } = options

  try {
    const id = String(penId ?? '')

    // 1) Length check - must be exactly 16 characters
    if (id.length !== 16) {
      return {
        ok: false,
        code: VerifyResultCode.INVALID_LENGTH,
        message: 'Invalid pen id length! Please rescan the pen.'
      }
    }

    // 2) If Production: check existing pen in local DB
    if (runType === 'Production') {
      try {
        const existingPens = await sequelize.query(
          `SELECT LotID FROM PENS 
           WHERE PenID = :penId 
           AND SyncState <> 'REMOVE' 
           AND SyncState <> 'DELETE'`,
          {
            replacements: { penId: id },
            type: QueryTypes.SELECT
          }
        )

        if (existingPens && existingPens.length > 0) {
          const lotId = existingPens[0].LotID ?? existingPens[0].lotId
          return {
            ok: false,
            code: VerifyResultCode.ALREADY_IN_LOT,
            message: `Warning - Pen ${id} has already been entered into lot ${lotId}.\n\nTo edit this pen, enter the PID again and press the edit button.`,
            details: { lotId }
          }
        }
      } catch (dbErr) {
        console.error('[VerifyPIDService] Local DB query failed:', dbErr.message)
        // Continue with validation even if local DB check fails
      }
    }

    // 3) Query MFG DB for product rules
    let prodRows = []
    try {
      prodRows = await sequelize.query(
        `SELECT mid_cd, lotid_cd, pica_cd, prod_gen_cd 
         FROM product_ref_llk 
         WHERE inv_item_lk_nr = :partNumber`,
        {
          replacements: { partNumber },
          type: QueryTypes.SELECT
        }
      )
    } catch (dbErr) {
      console.error('[VerifyPIDService] MFG DB query failed:', dbErr.message)
      prodRows = []
    }

    if (!prodRows || prodRows.length === 0) {
      return {
        ok: false,
        code: VerifyResultCode.UNKNOWN_PRODUCT,
        message: 'The product type is not recognised!. Contact Support.'
      }
    }

    const rule = prodRows[0]
    const sCorrectMIDCode = String(rule.mid_cd ?? '')
    const sCorrectLotIDCode = String(rule.lotid_cd ?? '')
    const sCorrectVentLabelChar = String(rule.pica_cd ?? '')
    const sProductGeneration = String(rule.prod_gen_cd ?? '')

    // 4) MID check: first 4 chars of PID must be in mid_cd
    const sId = id.slice(0, 4)
    if (!sCorrectMIDCode.includes(sId)) {
      return {
        ok: false,
        code: VerifyResultCode.MID_MISMATCH,
        message: 'The product type is not set correctly for this pen!!! Use the Context menu to change the part type.',
        details: { expectedMidCd: sCorrectMIDCode, penPrefix: sId }
      }
    }

    // 5) Lot product char check (unless Engineering)
    const lotProductChar = getSetting('Nextcap', 'Lot', 'ProductChar') ?? ''
    if (
      runType !== 'Engineering' &&
      String(lotProductChar).toUpperCase() !== String(sCorrectLotIDCode).toUpperCase()
    ) {
      return {
        ok: false,
        code: VerifyResultCode.LOTID_FORMAT_MISMATCH,
        message: 'You have the Incorrect LotID format for this product. Use the Undo button to delete the lot and create a new one with the correct product identifier.',
        details: { lotProductChar, expectedLotIdCd: sCorrectLotIDCode }
      }
    }

    // Success
    return {
      ok: true,
      code: VerifyResultCode.SUCCESS,
      details: {
        mid_cd: sCorrectMIDCode,
        lotid_cd: sCorrectLotIDCode,
        pica_cd: sCorrectVentLabelChar,
        prod_gen_cd: sProductGeneration
      }
    }
  } catch (err) {
    console.error('[VerifyPIDService] Error:', err)
    return {
      ok: false,
      code: VerifyResultCode.ERROR,
      message: err?.message ?? 'Contact Support',
      details: { error: String(err) }
    }
  }
}

/**
 * Set the lot product character (used for validation)
 * @param {string} productChar 
 */
function setLotProductChar(productChar) {
  saveSetting('Nextcap', 'Lot', 'ProductChar', productChar)
}

/**
 * Get the current lot product character
 * @returns {string|null}
 */
function getLotProductChar() {
  return getSetting('Nextcap', 'Lot', 'ProductChar')
}

export {
  verifyId,
  setLotProductChar,
  getLotProductChar,
  VerifyResultCode,
  getSetting,
  saveSetting
}

export default {
  verifyId,
  setLotProductChar,
  getLotProductChar,
  VerifyResultCode
}
