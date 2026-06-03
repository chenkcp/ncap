/**
 * PreCreateLotService.js
 * 
 * Node.js translation of VB6: Function PreCreateLot(LotId As String) As String
 * 
 * VB behavior:
 * - If LotId length is 10 or 11:
 *   - Extract trailing count: Right(LotId, 4) or Right(LotId, 5)
 *   - If first 2 chars of that are numeric: save Count = those 2 chars
 *   - Extract build date: Left(LotId, 4) and save LastDate
 * - Always returns LotId
 */

// In-memory settings cache (simulates registry/config storage)
const settingsCache = new Map()

/**
 * Get setting from cache
 * @param {string} app 
 * @param {string} section 
 * @param {string} key 
 * @param {string} defaultValue 
 * @returns {string}
 */
function getSetting(app, section, key, defaultValue = '') {
  const cacheKey = `${app}|${section}|${key}`
  return settingsCache.get(cacheKey) ?? defaultValue
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
  console.log(`[PreCreateLotService] Setting saved: ${cacheKey} = ${value}`)
}

/**
 * Clear all settings (useful for testing)
 */
function clearSettings() {
  settingsCache.clear()
}

/**
 * Get all settings (useful for debugging)
 * @returns {Object}
 */
function getAllSettings() {
  const result = {}
  settingsCache.forEach((value, key) => {
    result[key] = value
  })
  return result
}

/**
 * Pre-create lot processing
 * Extracts and stores lot count and date information from lot ID
 * 
 * @param {string} lotId - The lot ID to process
 * @returns {Promise<string>} - The original lot ID
 */
async function preCreateLot(lotId) {
  const CS_APP = 'NextCap'
  const CS_SECTION = 'Lot'

  const id = String(lotId ?? '')

  // VB: If Len(LotId) = 10 Or Len(LotId) = 11 Then
  if (id.length === 10 || id.length === 11) {
    // VB: sLotCount = Right(LotId, 5) or Right(LotId, 4)
    const sLotCountRaw = id.slice(-(id.length === 11 ? 5 : 4))

    // VB: If IsNumeric(Left(sLotCount, 2)) Then ...
    const first2 = sLotCountRaw.slice(0, 2)
    if (/^\d{2}$/.test(first2)) {
      // VB saved only the first 2 digits
      saveSetting(CS_APP, CS_SECTION, 'Count', first2)
    }

    // VB: sCurrentDate = Left(LotId, 4)
    const sCurrentDate = id.slice(0, 4)
    saveSetting(CS_APP, CS_SECTION, 'LastDate', sCurrentDate)
  }

  // VB: PreCreateLot = LotId
  return id
}

/**
 * Get the last stored lot count
 * @returns {string}
 */
function getLastLotCount() {
  return getSetting('NextCap', 'Lot', 'Count', '')
}

/**
 * Get the last stored lot date
 * @returns {string}
 */
function getLastLotDate() {
  return getSetting('NextCap', 'Lot', 'LastDate', '')
}

export {
  preCreateLot,
  getSetting,
  saveSetting,
  clearSettings,
  getAllSettings,
  getLastLotCount,
  getLastLotDate
}

export default {
  preCreateLot,
  getSetting,
  saveSetting,
  clearSettings,
  getAllSettings,
  getLastLotCount,
  getLastLotDate
}
