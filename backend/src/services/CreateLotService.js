/**
 * CreateLotService.js
 * 
 * Service for creating new lots in the system.
 * Works with PreCreateLotService for lot ID processing.
 */

import sequelize from '../config/databases.js'
import { QueryTypes } from 'sequelize'
import { preCreateLot, saveSetting, getSetting } from './PreCreateLotService.js'

/**
 * Lot creation result
 * @typedef {Object} CreateLotResult
 * @property {boolean} success
 * @property {string} lotId
 * @property {string} [message]
 * @property {Object} [lot]
 */

/**
 * Generate a new lot ID based on current date and sequence
 * Format: MMDDHH-XX where XX is sequence number
 * 
 * @param {string} productChar - Product character code (2 chars)
 * @returns {string} Generated lot ID
 */
function generateLotId(productChar = 'AA') {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  
  // Get last count from settings
  const lastDate = getSetting('NextCap', 'Lot', 'LastDate', '')
  const currentDate = mm + dd
  
  let count = 1
  if (lastDate === currentDate) {
    // Same date, increment count
    const lastCount = parseInt(getSetting('NextCap', 'Lot', 'Count', '0'), 10)
    count = (lastCount + 1) % 100 // Roll over at 99
  }
  
  const countStr = String(count).padStart(2, '0')
  return `${currentDate}${productChar}${hh}${countStr}`
}

/**
 * Validate lot ID format
 * @param {string} lotId 
 * @returns {{valid: boolean, message?: string}}
 */
function validateLotId(lotId) {
  if (!lotId || typeof lotId !== 'string') {
    return { valid: false, message: 'Lot ID is required' }
  }
  
  if (lotId.length < 8 || lotId.length > 12) {
    return { valid: false, message: 'Lot ID must be between 8 and 12 characters' }
  }
  
  // Check first 4 chars are date (MMDD)
  const dateStr = lotId.slice(0, 4)
  const mm = parseInt(dateStr.slice(0, 2), 10)
  const dd = parseInt(dateStr.slice(2, 4), 10)
  
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return { valid: false, message: 'Invalid date format in Lot ID' }
  }
  
  return { valid: true }
}

/**
 * Check if lot ID already exists in database
 * @param {string} lotId 
 * @returns {Promise<boolean>}
 */
async function lotExists(lotId) {
  try {
    const result = await sequelize.query(
      `SELECT COUNT(*) as count FROM Lots WHERE LotID = :lotId`,
      {
        replacements: { lotId },
        type: QueryTypes.SELECT
      }
    )
    return result && result[0] && result[0].count > 0
  } catch (e) {
    console.error('[CreateLotService] lotExists error:', e.message)
    return false
  }
}

/**
 * Create a new lot
 * 
 * @param {Object} options
 * @param {string} [options.lotId] - Custom lot ID (optional, will generate if not provided)
 * @param {string} options.productChar - Product character code
 * @param {string} options.lineType - Line type
 * @param {number} options.lineNumber - Line number
 * @param {string} [options.source] - Source
 * @param {string} [options.userId] - User creating the lot
 * @returns {Promise<CreateLotResult>}
 */
async function createLot(options = {}) {
  const {
    productChar = 'AA',
    lineType = '',
    lineNumber = 0,
    source = '',
    userId = 'SYSTEM'
  } = options

  let { lotId } = options

  try {
    // Generate lot ID if not provided
    if (!lotId) {
      lotId = generateLotId(productChar)
    }

    // Validate lot ID
    const validation = validateLotId(lotId)
    if (!validation.valid) {
      return {
        success: false,
        lotId: '',
        message: validation.message
      }
    }

    // Check if lot already exists
    if (await lotExists(lotId)) {
      return {
        success: false,
        lotId,
        message: `Lot ${lotId} already exists`
      }
    }

    // Process lot ID (extract and store metadata)
    await preCreateLot(lotId)

    // Store product char
    saveSetting('NextCap', 'Lot', 'ProductChar', productChar.toUpperCase())

    // Create lot in database
    const birthday = new Date()
    await sequelize.query(
      `INSERT INTO Lots (LotID, Birthday, MaterialStatus, QualityStatus, LineType, LineNumber, Source, CreatedBy, CreatedAt)
       VALUES (:lotId, :birthday, 'OPEN', 'Yellow', :lineType, :lineNumber, :source, :userId, :createdAt)`,
      {
        replacements: {
          lotId,
          birthday,
          lineType,
          lineNumber,
          source,
          userId,
          createdAt: new Date()
        },
        type: QueryTypes.INSERT
      }
    )

    // Return created lot info
    return {
      success: true,
      lotId,
      message: 'Lot created successfully',
      lot: {
        lotId,
        birthday,
        materialStatus: 'OPEN',
        qualityStatus: 'Yellow',
        lineType,
        lineNumber,
        source,
        createdBy: userId
      }
    }

  } catch (err) {
    console.error('[CreateLotService] createLot error:', err)
    return {
      success: false,
      lotId: lotId || '',
      message: err?.message || 'Failed to create lot'
    }
  }
}

/**
 * Close a lot
 * @param {string} lotId 
 * @param {string} [userId] 
 * @returns {Promise<{success: boolean, message?: string}>}
 */
async function closeLot(lotId, userId = 'SYSTEM') {
  try {
    await sequelize.query(
      `UPDATE Lots SET MaterialStatus = 'CLOSED', ClosedBy = :userId, ClosedAt = :closedAt 
       WHERE LotID = :lotId`,
      {
        replacements: { lotId, userId, closedAt: new Date() },
        type: QueryTypes.UPDATE
      }
    )
    return { success: true, message: 'Lot closed successfully' }
  } catch (err) {
    console.error('[CreateLotService] closeLot error:', err)
    return { success: false, message: err?.message || 'Failed to close lot' }
  }
}

/**
 * Reopen a lot
 * @param {string} lotId 
 * @param {string} [userId] 
 * @returns {Promise<{success: boolean, message?: string}>}
 */
async function reopenLot(lotId, userId = 'SYSTEM') {
  try {
    await sequelize.query(
      `UPDATE Lots SET MaterialStatus = 'OPEN', ReopenedBy = :userId, ReopenedAt = :reopenedAt 
       WHERE LotID = :lotId`,
      {
        replacements: { lotId, userId, reopenedAt: new Date() },
        type: QueryTypes.UPDATE
      }
    )
    
    // Re-extract product char from lot ID
    const productChar = lotId.slice(4, 6).toUpperCase()
    saveSetting('NextCap', 'Lot', 'ProductChar', productChar)
    
    return { success: true, message: 'Lot reopened successfully' }
  } catch (err) {
    console.error('[CreateLotService] reopenLot error:', err)
    return { success: false, message: err?.message || 'Failed to reopen lot' }
  }
}

/**
 * Suspend a lot
 * @param {string} lotId 
 * @param {string} [userId] 
 * @returns {Promise<{success: boolean, message?: string}>}
 */
async function suspendLot(lotId, userId = 'SYSTEM') {
  try {
    await sequelize.query(
      `UPDATE Lots SET MaterialStatus = 'SUSPENDED', SuspendedBy = :userId, SuspendedAt = :suspendedAt 
       WHERE LotID = :lotId`,
      {
        replacements: { lotId, userId, suspendedAt: new Date() },
        type: QueryTypes.UPDATE
      }
    )
    return { success: true, message: 'Lot suspended successfully' }
  } catch (err) {
    console.error('[CreateLotService] suspendLot error:', err)
    return { success: false, message: err?.message || 'Failed to suspend lot' }
  }
}

export {
  createLot,
  closeLot,
  reopenLot,
  suspendLot,
  generateLotId,
  validateLotId,
  lotExists
}

export default {
  createLot,
  closeLot,
  reopenLot,
  suspendLot,
  generateLotId,
  validateLotId,
  lotExists
}
