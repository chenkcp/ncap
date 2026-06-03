/**
 * Data Sync & Action Log Utilities
 * 
 * 1. Action Log: Writes operation logs to action.log (client info + table + operation + fields)
 * 2. Sync Files: Maintains new.json, update.json, delete.json with smart deduplication:
 *    - New record → add to new.json
 *    - Update a record already in new.json → update it in new.json (no need for separate update)
 *    - Update a record NOT in new.json → add/update in update.json
 *    - Delete a record → remove from new.json AND update.json, then add to delete.json
 *      (but only add to delete.json if it was NOT originally new, i.e. not found in new.json)
 * 
 * File format: [{ tableName: string, data: [...records] }]
 */

// NOTE: We use a store reference to avoid circular dependency
// (globalStore.js imports from dataSyncUtils.js)
let _storeRef = null

/**
 * Set the store reference (called once from globalStore.js after store creation)
 */
export function setStoreRef(store) {
  _storeRef = store
}

// ============================================================
// Tracking flag
// ============================================================
let _trackingEnabled = false

export function enableDataTracking() {
  _trackingEnabled = true
  console.log('✅ [DataSync] Data tracking enabled')
}

export function disableDataTracking() {
  _trackingEnabled = false
  console.log('⏸️ [DataSync] Data tracking disabled')
}

// ============================================================
// Configuration
// ============================================================
const TRACKED_TABLES = ['lots', 'lotComments', 'lotDefectCounts', 'pens', 'penDefects']

const PRIMARY_KEYS = {
  lots: ['lineType', 'lineNumber', 'source', 'lotId', 'birthday'],
  lotComments: ['lineType', 'lineNumber', 'source', 'lotId', 'birthday', 'commentId'],
  lotDefectCounts: ['lineType', 'lineNumber', 'source', 'lotId', 'birthday', 'className'],
  pens: ['lineType', 'lineNumber', 'source', 'lotId', 'birthday', 'penId', 'inspectionDate'],
  penDefects: ['lineType', 'lineNumber', 'source', 'lotId', 'birthday', 'penId', 'inspectionDate', 'code1', 'code2']
}

/**
 * Complete schema for each tracked table.
 * Every field from the DB model is listed with its default value.
 * Records written to new.json / update.json will be padded with these defaults
 * so the sync API always receives ALL columns.
 */
const TABLE_SCHEMAS = {
  lots: {
    lineType: '', lineNumber: 0, source: '', lotId: '', birthday: null,
    closeday: null, suspendDay: null,
    qualityStatus: '', materialStatus: '',
    pensShipped: 0, pensInLot: 0, audit100Percent: 0,
    startTime: null, endTime: null,
    operator: '', shift: '',
  },
  lotComments: {
    lineType: '', lineNumber: 0, source: '', lotId: '', birthday: null,
    commentDate: null, user: '', lotComment: '',
  },
  lotDefectCounts: {
    lineType: '', lineNumber: 0, source: '', lotId: '', birthday: null,
    itemType: '', className: '', count: 0,
  },
  pens: {
    lineType: '', lineNumber: 0, source: '', lotId: '', birthday: null,
    penId: '', inspectionDate: null,
    numberOfPens: 1, userName: '', shift: '', disposition: '',
    testbed: '', penNotShipped: 0, recoveryStep: '',
    runType: '', experimentId: '', productName: '', productNumber: '', productType: '',
    thinFilmLotId: '',
  },
  penDefects: {
    lineType: '', lineNumber: 0, source: '', lotId: '', birthday: null,
    penId: '', inspectionDate: null, defectNumber: 0,
    className: '', primaryDefect: 0, defectComment: '', numericComment: '',
    code1: '', code2: '', cause1: '', cause2: '',
  },
}

/**
 * Pad a record with all schema fields for its table.
 * Existing values on the record are preserved; missing fields get defaults.
 */
function padRecord(tableName, record) {
  const schema = TABLE_SCHEMAS[tableName]
  if (!schema) return record
  return { ...schema, ...record }
}

// ============================================================
// Utility: record key generation
// ============================================================
function getRecordKey(tableName, record) {
  const keys = PRIMARY_KEYS[tableName] || ['id']
  return keys.map(k => record[k] ?? '').join('|')
}

// ============================================================
// Utility: detect changes between old and new arrays
// ============================================================
export function detectChanges(tableName, oldData, newData) {
  const oldMap = new Map()
  const newMap = new Map()

  oldData.forEach(record => {
    oldMap.set(getRecordKey(tableName, record), record)
  })

  newData.forEach(record => {
    newMap.set(getRecordKey(tableName, record), record)
  })

  const newRecords = []
  const updatedRecords = []
  const deletedRecords = []

  // Find new and updated records
  newData.forEach(record => {
    const key = getRecordKey(tableName, record)
    const oldRecord = oldMap.get(key)
    if (!oldRecord) {
      newRecords.push({ ...padRecord(tableName, record), sync: false })
    } else {
      if (JSON.stringify(oldRecord) !== JSON.stringify(record)) {
        updatedRecords.push({ ...padRecord(tableName, record), sync: false })
      }
    }
  })

  // Find deleted records
  oldData.forEach(record => {
    const key = getRecordKey(tableName, record)
    if (!newMap.has(key)) {
      deletedRecords.push({ ...padRecord(tableName, record), sync: false })
    }
  })

  return { newRecords, updatedRecords, deletedRecords }
}

/**
 * Get the changed fields between two records
 * @returns {string[]} list of changed field names
 */
function getChangedFields(oldRecord, newRecord) {
  const allKeys = new Set([...Object.keys(oldRecord || {}), ...Object.keys(newRecord || {})])
  const changed = []
  for (const key of allKeys) {
    if (JSON.stringify(oldRecord?.[key]) !== JSON.stringify(newRecord?.[key])) {
      changed.push(key)
    }
  }
  return changed
}

// ============================================================
// File I/O helpers (via Electron IPC)
// ============================================================
async function readJsonFile(filename) {
  try {
    if (typeof window === 'undefined' || !window.electronAPI?.loadFile) {
      return []
    }
    const content = await window.electronAPI.loadFile(filename)
    if (content) {
      return JSON.parse(content)
    }
    return []
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return []
  }
}

async function writeJsonFile(filename, data) {
  try {
    if (typeof window === 'undefined' || !window.electronAPI?.saveFile) {
      return false
    }
    const content = JSON.stringify(data, null, 2)
    return await window.electronAPI.saveFile(filename, content)
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    return false
  }
}

/**
 * Append a log line to action.log
 */
async function appendActionLog(logLine) {
  try {
    if (typeof window === 'undefined' || !window.electronAPI?.appendFile) {
      return
    }
    await window.electronAPI.appendFile('action.log', logLine + '\n')
  } catch (error) {
    console.error('Error writing action.log:', error)
  }
}

// ============================================================
// Action Log
// ============================================================

/**
 * Write an action log entry
 * @param {'INSERT'|'UPDATE'|'DELETE'} operation
 * @param {string} tableName
 * @param {object} record - the record being operated on
 * @param {string[]} changedFields - list of changed field names (for UPDATE)
 */
function writeActionLog(operation, tableName, record, changedFields = []) {
  // Get client info from store via stored reference
  let clientInfoStr = ''
  try {
    const state = _storeRef?.getState?.() || {}
    const ci = state.clientInfo || {}
    clientInfoStr = `${ci.clientName || ''}|${ci.lineType || ''}|${ci.lineNumber || ''}|${ci.source || ''}`
  } catch {
    clientInfoStr = 'unknown'
  }

  const timestamp = new Date().toISOString()
  const recordKey = getRecordKey(tableName, record)
  const fieldsStr = changedFields.length > 0 ? changedFields.join(',') : Object.keys(record).join(',')

  const logLine = `[${timestamp}] [${clientInfoStr}] [${operation}] [${tableName}] key=${recordKey} fields=${fieldsStr}`
  console.log(`📋 [ActionLog] ${logLine}`)
  appendActionLog(logLine)
}

// ============================================================
// Sync File Operations (with cross-file deduplication)
// ============================================================

/**
 * Find and remove a record from a sync file by table and key
 * @returns {Promise<boolean>} true if the record was found and removed
 */
async function removeFromSyncFile(filename, tableName, recordKey) {
  const fileData = await readJsonFile(filename)
  const tableEntry = fileData.find(e => e.tableName === tableName)
  if (!tableEntry || !tableEntry.data) return false

  const idx = tableEntry.data.findIndex(r => getRecordKey(tableName, r) === recordKey)
  if (idx < 0) return false

  tableEntry.data.splice(idx, 1)
  // Remove table entry if empty
  if (tableEntry.data.length === 0) {
    const ti = fileData.indexOf(tableEntry)
    fileData.splice(ti, 1)
  }
  await writeJsonFile(filename, fileData)
  return true
}

/**
 * Upsert a record into a sync file (add or update existing by key)
 */
async function upsertToSyncFile(filename, tableName, record) {
  const fileData = await readJsonFile(filename)
  const key = getRecordKey(tableName, record)
  const paddedRecord = padRecord(tableName, record)

  let tableEntry = fileData.find(e => e.tableName === tableName)
  if (!tableEntry) {
    tableEntry = { tableName, data: [] }
    fileData.push(tableEntry)
  }

  const idx = tableEntry.data.findIndex(r => getRecordKey(tableName, r) === key)
  if (idx >= 0) {
    // Update existing record in-place (merge so no fields are lost)
    tableEntry.data[idx] = { ...tableEntry.data[idx], ...paddedRecord, sync: false }
  } else {
    // Add new record
    tableEntry.data.push({ ...paddedRecord, sync: false })
  }

  await writeJsonFile(filename, fileData)
}

/**
 * Check if a record exists in a sync file
 */
async function existsInSyncFile(filename, tableName, recordKey) {
  const fileData = await readJsonFile(filename)
  const tableEntry = fileData.find(e => e.tableName === tableName)
  if (!tableEntry || !tableEntry.data) return false
  return tableEntry.data.some(r => getRecordKey(tableName, r) === recordKey)
}

// ============================================================
// Main processing logic
// ============================================================

/**
 * Process a single NEW record:
 *   → add to new.json
 */
async function processNewRecord(tableName, record) {
  writeActionLog('INSERT', tableName, record)
  await upsertToSyncFile('new.json', tableName, record)
  console.log(`✅ [DataSync] INSERT → new.json [${tableName}]`)
}

/**
 * Process a single UPDATED record:
 *   1. If it exists in new.json → update in new.json (still a "new" record for the DB)
 *   2. Otherwise → add/update in update.json
 */
async function processUpdatedRecord(tableName, record, changedFields) {
  writeActionLog('UPDATE', tableName, record, changedFields)

  const key = getRecordKey(tableName, record)
  const inNew = await existsInSyncFile('new.json', tableName, key)

  if (inNew) {
    // Record was added in this session → update in new.json
    await upsertToSyncFile('new.json', tableName, record)
    console.log(`✅ [DataSync] UPDATE → new.json (was new) [${tableName}]`)
  } else {
    // Record existed before → update in update.json
    await upsertToSyncFile('update.json', tableName, record)
    console.log(`✅ [DataSync] UPDATE → update.json [${tableName}]`)
  }
}

/**
 * Process a single DELETED record:
 *   1. Remove from new.json (if was new → no need to delete from DB, done)
 *   2. Remove from update.json (cleanup pending updates)
 *   3. If was NOT in new.json → add to delete.json (DB needs to know)
 */
async function processDeletedRecord(tableName, record) {
  writeActionLog('DELETE', tableName, record)

  const key = getRecordKey(tableName, record)

  // Check if it was a new record (added in this session)
  const wasNew = await removeFromSyncFile('new.json', tableName, key)

  // Always remove from update.json if present
  await removeFromSyncFile('update.json', tableName, key)

  if (!wasNew) {
    // Record existed in DB before this session → add to delete.json
    await upsertToSyncFile('delete.json', tableName, record)
    console.log(`✅ [DataSync] DELETE → delete.json [${tableName}]`)
  } else {
    // Was a new record → just removed from new.json, nothing to sync to DB
    console.log(`✅ [DataSync] DELETE → removed from new.json (no DB sync needed) [${tableName}]`)
  }
}

/**
 * Process data changes: detect diffs and write to sync files + action log
 * @param {string} tableName - Table name
 * @param {Array} oldData - Previous data array
 * @param {Array} newData - New data array
 */
export async function processDataChanges(tableName, oldData, newData) {
  if (!TRACKED_TABLES.includes(tableName)) return
  if (!_trackingEnabled) {
    console.log(`⏸️ [DataSync] Skipping ${tableName} changes - tracking not enabled yet`)
    return
  }

  console.log(`📝 [DataSync] Processing changes for ${tableName}: old=${oldData.length}, new=${newData.length}`)

  const { newRecords, updatedRecords, deletedRecords } = detectChanges(tableName, oldData, newData)

  if (newRecords.length === 0 && updatedRecords.length === 0 && deletedRecords.length === 0) {
    return
  }

  console.log(`📝 [DataSync] ${tableName} changes: new=${newRecords.length}, updated=${updatedRecords.length}, deleted=${deletedRecords.length}`)

  // Build oldData map for change detection
  const oldMap = new Map()
  oldData.forEach(record => {
    oldMap.set(getRecordKey(tableName, record), record)
  })

  // Process each type of change
  for (const record of newRecords) {
    await processNewRecord(tableName, record)
  }

  for (const record of updatedRecords) {
    const oldRecord = oldMap.get(getRecordKey(tableName, record))
    const changedFields = getChangedFields(oldRecord, record)
    await processUpdatedRecord(tableName, record, changedFields)
  }

  for (const record of deletedRecords) {
    await processDeletedRecord(tableName, record)
  }
}

// ============================================================
// Legacy exports (for backward compatibility)
// ============================================================

export function createTrackedSetter(setState, getState, tableName) {
  return async (newData) => {
    const oldData = getState()[tableName] || []
    setState({ [tableName]: newData })
    await processDataChanges(tableName, oldData, newData)
  }
}

export function isElectronAPIAvailable() {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

export default {
  detectChanges,
  processDataChanges,
  createTrackedSetter,
  isElectronAPIAvailable,
  enableDataTracking,
  disableDataTracking,
  setStoreRef,
  TRACKED_TABLES
}
