/**
 * ProductMonitorService.js
 * 
 * Node.js translation of VB6: T2X_Gen1LPQQA(ThisLot, strAction, intN)
 * 
 * This service monitors lot quality and determines the appropriate status:
 * - FOW (100-Percent): Fail On Weight - lot has weight issues
 * - RED: Lot has critical defects or too many functional defects
 * - YELLOW (In Process): Lot is still being processed
 * - GREEN (Pass): Lot passed quality checks
 * - BLUE: Error state
 * 
 * Actions supported:
 * - LotCreated: New lot created
 * - LotReopened: Lot reopened for editing
 * - LotClosed: Lot closed/completed
 * - PenAdded: New pen added to lot
 * - PenDeleted: Pen removed from lot
 * - PenUpdated: Pen information updated
 */

import sequelize from '../config/databases.js'
import { QueryTypes } from 'sequelize'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// In-memory settings cache (simulates registry)
const settingsCache = new Map()

// In-memory runtime values cache
const runtimeCache = new Map()

/**
 * Quality status constants
 */
const QualityStatus = {
  GREEN: 'Green',
  YELLOW: 'Yellow',
  RED: 'Red',
  BLUE: 'Blue',
  FOW: '100-Percent',
  PASS: 'Pass'
}

/**
 * Action types
 */
const ActionType = {
  LOT_CREATED: 'LotCreated',
  LOT_REOPENED: 'LotReopened',
  LOT_CLOSED: 'LotClosed',
  PEN_ADDED: 'PenAdded',
  PEN_DELETED: 'PenDeleted',
  PEN_UPDATED: 'PenUpdated'
}

// Settings helpers
function getSetting(app, section, key, defaultValue = '') {
  const cacheKey = `${app}|${section}|${key}`
  return settingsCache.get(cacheKey) ?? defaultValue
}

function saveSetting(app, section, key, value) {
  const cacheKey = `${app}|${section}|${key}`
  settingsCache.set(cacheKey, value)
}

// Runtime helpers
function getRuntimeValue(key) {
  return runtimeCache.get(key) ?? 'Undefined'
}

function setRuntimeValue(key, value) {
  runtimeCache.set(key, value)
}

/**
 * Lot interface expected by ProductMonitor
 * @typedef {Object} LotObject
 * @property {string} lotId
 * @property {Date|string} birthday
 * @property {string} qualityStatus
 * @property {Object} items - Map of category to {count: number}
 * @property {Function} defectCount - (code, subcode) => number
 * @property {Object} lotManager - {lineType, lineNumber, addComment}
 */

/**
 * Server message callback type
 * @typedef {Function} ServerMessageCallback
 * @param {string} message
 */

/**
 * ProductMonitor Service
 */
class ProductMonitorService {
  constructor(options = {}) {
    this.toolsDir = options.toolsDir || 'c:\\program files\\nextcap\\tools'
    this.serverMessageCallback = options.onServerMessage || console.log
    this.cltEnabled = options.cltEnabled || false
    this.cltSendCallback = options.onCltSend || null
  }

  /**
   * Get item count from lot
   * @param {LotObject} lot 
   * @param {string} category 
   * @returns {number}
   */
  getLotItemCount(lot, category) {
    if (lot.items && lot.items[category]) {
      return lot.items[category].count || 0
    }
    if (typeof lot.item === 'function') {
      const item = lot.item(category)
      return item?.count || 0
    }
    return 0
  }

  /**
   * Get defect count from lot
   * @param {LotObject} lot 
   * @param {string} code 
   * @param {string} subcode 
   * @returns {number}
   */
  getLotDefectCount(lot, code, subcode) {
    if (typeof lot.defectCount === 'function') {
      return lot.defectCount(code, subcode) || 0
    }
    return 0
  }

  /**
   * Compute critical count (VB6 logic)
   * @param {LotObject} lot 
   * @returns {number}
   */
  computeCriticalCount(lot) {
    return (
      this.getLotDefectCount(lot, 'FIT', '%') +
      this.getLotDefectCount(lot, 'FWT', '%') +
      this.getLotDefectCount(lot, 'FPQ', 'FDL') +
      this.getLotDefectCount(lot, 'FVL', 'FVD') +
      this.getLotDefectCount(lot, 'FVL', 'FVL') +
      this.getLotDefectCount(lot, 'FVL', 'FVM') +
      this.getLotDefectCount(lot, 'FVL', 'FVT')
    )
  }

  /**
   * Compute helium leak count
   * @param {LotObject} lot 
   * @returns {number}
   */
  computeHeliumLeakCount(lot) {
    return this.getLotDefectCount(lot, 'RHL', '%')
  }

  /**
   * Compute total pen count
   * @param {LotObject} lot 
   * @returns {number}
   */
  computePenCount(lot) {
    return (
      this.getLotItemCount(lot, 'Functional') +
      this.getLotItemCount(lot, 'Risk') +
      this.getLotItemCount(lot, 'Cosmetic') +
      this.getLotItemCount(lot, 'Good')
    )
  }

  /**
   * Run updFailcode.exe (external tool)
   * @param {string} penId 
   * @param {string} cls 
   * @param {string} station 
   * @param {string} code 
   */
  async runUpdFailcode(penId, cls, station, code) {
    const exe = path.join(this.toolsDir, 'updFailcode.exe')
    try {
      await execAsync(`"${exe}" "${penId}" "${cls}" "${station}" "${code}"`)
    } catch (e) {
      this.serverMessageCallback(`updFailcode.exe failed for ${penId}: ${e.message}`)
    }
  }

  /**
   * Add system comment to lot
   * @param {LotObject} lot 
   * @param {string} reason 
   */
  addSystemComment(lot, reason) {
    if (!reason) return
    try {
      if (lot.lotManager && typeof lot.lotManager.addComment === 'function') {
        lot.lotManager.addComment(lot.lotId, lot.birthday, reason, 'SYSTEM')
      }
    } catch (e) {
      // Swallow error like VB6
    }
    this.serverMessageCallback(`Lot ${lot.lotId} Failed ${reason}`)
  }

  /**
   * Set lot quality status
   * @param {LotObject} lot 
   * @param {string} status 
   */
  setLotStatus(lot, status) {
    if (typeof lot.letQualityStatus === 'function') {
      lot.letQualityStatus(status)
    } else {
      lot.qualityStatus = status
    }
  }

  /**
   * Send CLT (Client) message if enabled
   * @param {LotObject} lot 
   * @param {string} action 
   * @param {string} runType 
   */
  async sendCLT(lot, action, runType) {
    if (!(action === ActionType.LOT_CLOSED || action === ActionType.PEN_ADDED)) {
      return
    }

    if (!runType) return

    const cltServerId = getRuntimeValue('CLTServerID')
    const cltReady = cltServerId && cltServerId !== 'Undefined' && cltServerId !== ''
    if (!cltReady || !this.cltEnabled) return

    const strGroupId = String(lot.lotId || '').trim()

    // Determine test status
    let strTestStatus = 'IN Process'
    if (action === ActionType.LOT_CLOSED) {
      const qs = lot.qualityStatus
      if (qs === QualityStatus.PASS || qs === QualityStatus.GREEN) {
        strTestStatus = 'PASS'
      } else if (qs === QualityStatus.YELLOW) {
        strTestStatus = 'IN Process'
      } else if (qs === QualityStatus.FOW || qs === QualityStatus.RED) {
        strTestStatus = 'FAIL'
      }
    }

    // Get line info
    let intLineNumber = 0
    let strPartialLineType = ''
    if (lot.lotManager) {
      intLineNumber = lot.lotManager.lineNumber ?? 0
      const lt = lot.lotManager.lineType ?? ''
      strPartialLineType = lt ? String(lt).substring(0, 1) : ''
    }

    const strStationId = `${intLineNumber}_Z3-CPM`

    // Send CLT message
    if (this.cltSendCallback) {
      await this.cltSendCallback({
        queueKey: 1,
        stationId: strStationId,
        groupId: strGroupId,
        testStatus: strTestStatus,
        reasonCode: 0,
        passCount: 0,
        userDef1: '',
        userDef2: ''
      })
    }
  }

  /**
   * Query pen weight from database
   * @param {string} penId 
   * @returns {Promise<number|null>}
   */
  async queryPenWeight(penId) {
    try {
      const result = await sequelize.query(
        `SELECT dbl_param_vl as weight FROM PEN_WEIGHTS WHERE PenID = :penId`,
        {
          replacements: { penId },
          type: QueryTypes.SELECT
        }
      )
      if (result && result.length > 0) {
        return result[0].weight
      }
      return null
    } catch (e) {
      console.error('[ProductMonitorService] queryPenWeight error:', e.message)
      return null
    }
  }

  /**
   * Main monitoring function
   * 
   * @param {LotObject} lot - The lot object
   * @param {string} action - The action type (LotCreated, PenAdded, etc.)
   * @param {number} intN - Not used (kept for VB6 signature parity)
   * @param {Object} options - Additional options
   * @param {string} options.runType - 'Production' or 'Engineering'
   * @returns {Promise<{status: string, reason?: string}>}
   */
  async monitor(lot, action, intN = 0, options = {}) {
    let sReason = ''
    let runType = options.runType || ''
    const lotId = String(lot.lotId || '')

    try {
      // Get RunType from context if available
      if (action === ActionType.LOT_CLOSED || action === ActionType.PEN_ADDED) {
        if (!runType) {
          runType = getRuntimeValue('RunType') || ''
        }
      }

      // Extract ProductChar from lot ID (chars 5-6, 0-indexed 4-6)
      const sProductChar = lotId.slice(4, 6).toUpperCase()

      // On LotReopened or LotCreated, store ProductChar
      if (action === ActionType.LOT_REOPENED || action === ActionType.LOT_CREATED) {
        saveSetting('NextCap', 'Lot', 'ProductChar', sProductChar)
      }

      // LotCreated: Set to In Process (Yellow)
      if (action === ActionType.LOT_CREATED) {
        this.setLotStatus(lot, QualityStatus.YELLOW)
        await this.sendCLT(lot, action, runType)
        return { status: QualityStatus.YELLOW }
      }

      // PenAdded: Special handling with weight check
      if (action === ActionType.PEN_ADDED) {
        const currentStatus = lot.qualityStatus

        // If already FOW, stay FOW
        if (currentStatus === QualityStatus.FOW) {
          await this.sendCLT(lot, action, runType)
          return { status: QualityStatus.FOW }
        }

        // Check ink weight for last pen
        const sPenId = getSetting('Nextcap', 'LastPen', 'PenID', '')
        const weightLow = Number(getSetting('Nextcap', 'LastPen', 'weight_lsl', ''))
        const weightUpp = Number(getSetting('Nextcap', 'LastPen', 'weight_usl', ''))

        const weight = await this.queryPenWeight(sPenId)

        if (weight != null && !Number.isNaN(Number(weight))) {
          const w = Number(weight)
          saveSetting('Nextcap', 'LastPen', 'InkWeight', String(w))

          // Check under weight
          if (!Number.isNaN(weightLow) && w < weightLow) {
            await this.runUpdFailcode(sPenId, 'Functional', 'FWT', 'FLW')
            sReason = `- Pen ${sPenId} is Under Weight!`
            this.addSystemComment(lot, sReason)
            this.setLotStatus(lot, QualityStatus.FOW)
            await this.sendCLT(lot, action, runType)
            return { status: QualityStatus.FOW, reason: sReason }
          }

          // Check over weight
          if (!Number.isNaN(weightUpp) && w > weightUpp) {
            await this.runUpdFailcode(sPenId, 'Functional', 'FWT', 'FOW')
            sReason = `- Pen ${sPenId} is Over Weight!`
            this.addSystemComment(lot, sReason)
            this.setLotStatus(lot, QualityStatus.FOW)
            await this.sendCLT(lot, action, runType)
            return { status: QualityStatus.FOW, reason: sReason }
          }

          // Weight OK, check functional/critical counts
          const nFunctionalCount = this.getLotItemCount(lot, 'Functional')
          const nCriticalCount = this.computeCriticalCount(lot)
          const nHeliumLeakCount = this.computeHeliumLeakCount(lot)

          if (nFunctionalCount >= 3 || nCriticalCount > 0 || nHeliumLeakCount > 0) {
            sReason = `Number Criticals:${nCriticalCount} Number Functionals: ${nFunctionalCount}`
            this.addSystemComment(lot, sReason)
            this.setLotStatus(lot, QualityStatus.RED)
            await this.sendCLT(lot, action, runType)
            return { status: QualityStatus.RED, reason: sReason }
          } else {
            this.setLotStatus(lot, QualityStatus.GREEN)
            await this.sendCLT(lot, action, runType)
            return { status: QualityStatus.GREEN }
          }
        } else {
          // No weight data, check without helium leak
          const nFunctionalCount = this.getLotItemCount(lot, 'Functional')
          const nCriticalCount = this.computeCriticalCount(lot)

          if (nFunctionalCount >= 3 || nCriticalCount > 0) {
            sReason = `Number Criticals:${nCriticalCount} Number Functionals: ${nFunctionalCount}`
            this.addSystemComment(lot, sReason)
            this.setLotStatus(lot, QualityStatus.RED)
            await this.sendCLT(lot, action, runType)
            return { status: QualityStatus.RED, reason: sReason }
          } else {
            this.setLotStatus(lot, QualityStatus.GREEN)
            await this.sendCLT(lot, action, runType)
            return { status: QualityStatus.GREEN }
          }
        }
      }

      // LotClosed with < 1 pen: Stay In Process
      if (action === ActionType.LOT_CLOSED) {
        const nPenCount = this.computePenCount(lot)
        if (nPenCount < 1) {
          this.setLotStatus(lot, QualityStatus.YELLOW)
          await this.sendCLT(lot, action, runType)
          return { status: QualityStatus.YELLOW }
        }
      }

      // Actions that recalculate lot status
      const recalcActions = new Set([
        ActionType.PEN_DELETED,
        ActionType.LOT_CLOSED,
        ActionType.LOT_REOPENED,
        ActionType.PEN_UPDATED
      ])

      if (recalcActions.has(action)) {
        const currentStatus = lot.qualityStatus

        // If FOW, stay FOW
        if (currentStatus === QualityStatus.FOW) {
          sReason = 'because it is an FOW/FLW Lot'
          this.addSystemComment(lot, sReason)
          await this.sendCLT(lot, action, runType)
          return { status: QualityStatus.FOW, reason: sReason }
        }

        const nFunctionalCount = this.getLotItemCount(lot, 'Functional')
        const nCriticalCount = this.computeCriticalCount(lot)

        if (nFunctionalCount >= 3 || nCriticalCount > 0) {
          sReason = `Number Criticals:${nCriticalCount} Number Functionals: ${nFunctionalCount}`
          this.addSystemComment(lot, sReason)
          this.setLotStatus(lot, QualityStatus.RED)
          await this.sendCLT(lot, action, runType)
          return { status: QualityStatus.RED, reason: sReason }
        } else {
          this.setLotStatus(lot, QualityStatus.GREEN)
          await this.sendCLT(lot, action, runType)
          return { status: QualityStatus.GREEN }
        }
      }

      // Default: no change
      return { status: lot.qualityStatus }

    } catch (err) {
      // Error handling like VB6
      const errorComment = `Quality Monitor CSB ${err?.code ?? ''} ${err?.message ?? String(err)}`.trim()
      try {
        if (lot.lotManager?.addComment) {
          lot.lotManager.addComment(lot.lotId, lot.birthday, errorComment, 'SYSTEM')
        }
      } catch (_) {}
      this.serverMessageCallback(errorComment)
      this.setLotStatus(lot, QualityStatus.BLUE)
      return { status: QualityStatus.BLUE, reason: errorComment }
    }
  }
}

// Create singleton instance
const productMonitorService = new ProductMonitorService()

/**
 * Convenience function to monitor a lot
 * @param {LotObject} lot 
 * @param {string} action 
 * @param {number} intN 
 * @param {Object} options 
 * @returns {Promise<{status: string, reason?: string}>}
 */
async function monitorLot(lot, action, intN = 0, options = {}) {
  return productMonitorService.monitor(lot, action, intN, options)
}

export {
  ProductMonitorService,
  productMonitorService,
  monitorLot,
  QualityStatus,
  ActionType,
  getSetting,
  saveSetting,
  getRuntimeValue,
  setRuntimeValue
}

export default productMonitorService
