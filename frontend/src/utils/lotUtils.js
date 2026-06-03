/**
 * Lot utilities - ThisLot singleton, CreateLotID, VerifyPenId, ProductMonitor
 */

import { useGlobalStore } from '../store'
import { formatDate, updateLotStatus } from '../services/utils'

// ============================================
// ThisLot Singleton Class
// ============================================

let thisLotInstance = null

class ThisLot {
  constructor() {
    this.lastPen = null
    this._lot = null
  }

  /**
   * Set the current lot from open lots in store
   * @param {object} lot - The lot object
   */
  setLot(lot) {
    this._lot = lot
  }

  /**
   * Set the last pen ID
   * @param {string} penId - Pen ID
   */
  setLastPenId(penId) {
    this.lastPen = penId
  }

  /**
   * Get the last pen ID
   */
  get LastPen() {
    return this.lastPen
  }

  /**
   * Get lot ID
   */
  get LotID() {
    return this._lot?.lotId || ''
  }

  /**
   * Get quality status
   */
  get QualityStatus() {
    return this._lot?.qualityStatus || ''
  }

  /**
   * Get audit phase
   */
  get auditPhase() {
    return this._lot?.auditPhase || ''
  }

  /**
   * Set quality status
   * @param {string} qualityStatus - Quality status (UNKKNOWN, PASS, FAIL, REPULL, 100-Percent)
   * @param {string} auditPhase - Audit phase (INITIAL, REPULL)
   */
  async setQualityStatusAndAuditPhase(qualityStatus, auditPhase = null) {
    if (this._lot) {
      let obj = { qualityStatus }
      this._lot.qualityStatus = qualityStatus
      if (auditPhase){
        this._lot.auditPhase = auditPhase
        obj = { qualityStatus, auditPhase }
      }

      // Todo: Call API to update lot quality status and audit phase in backend
      const requestObj = {
        "lotid": this._lot.lotId,
        "birthday": formatDate(this._lot.birthday),
        "auditPhase": auditPhase,
        "qualityStatus": qualityStatus
      }
      const result = await updateLotStatus(requestObj)
      if (result._resp === "success"){
        // Update store
        const { lots, setLots } = useGlobalStore.getState()
        const updatedLots = lots.map(lot => 
          lot.lotId === this._lot.lotId ? { ...lot, ...obj } : lot
        )
        setLots(updatedLots)
      }
    }
  }

  /**
   * Get the current open lot from store
   */
  Lot() {
    const { lots } = useGlobalStore.getState()
    const openLot = lots.find(lot => lot.materialStatus === 'OPEN')
    return openLot || this._lot
  }

  /**
   * Get defect counts filtered by current lot and clientInfo
   */
  DefectCounts() {
    const { lotDefectCounts, clientInfo } = useGlobalStore.getState()
    const lot = this.Lot()
    if (!lot) return []

    return lotDefectCounts.filter(dc =>
      dc.lotId === lot.lotId &&
      dc.lineType === clientInfo.lineType &&
      dc.lineNumber === parseInt(clientInfo.lineNumber) &&
      dc.source === clientInfo.source
    )
  }

  /**
   * Count defects matching code1 and optional code2 (% for wildcard)
   * Implements the SQL logic from change.txt requirement 8
   * @param {string} code1 - Primary defect code
   * @param {string} code2 - Secondary code (% for any)
   * @returns {number} - Total pen count
   */
  DefectCount(code1, code2) {
    const { pens, penDefects, clientInfo } = useGlobalStore.getState()
    const lot = this.Lot()
    if (!lot) return 0

    // Filter pens by lot and clientInfo
    const filteredPens = pens.filter(pen =>
      pen.lotId === lot.lotId &&
      pen.lineType === clientInfo.lineType &&
      pen.lineNumber === parseInt(clientInfo.lineNumber) &&
      pen.source === clientInfo.source &&
      pen.penNotShipped === 0
    )

    let totalPens = 0

    for (const pen of filteredPens) {
      // Find matching defects for this pen
      const matchingDefects = penDefects.filter(defect => {
        const basicMatch =
          defect.lotId === pen.lotId &&
          defect.lineType === pen.lineType &&
          defect.lineNumber === pen.lineNumber &&
          defect.source === pen.source &&
          defect.penId === pen.penId &&
          defect.birthday === pen.birthday &&
          defect.inspectionDate === pen.inspectionDate &&
          defect.code1 === code1 &&
          defect.primaryDefect === -1

        // code2 matching: % means any, otherwise exact match
        if (code2 === '%') {
          return basicMatch
        }
        return basicMatch && defect.code2 === code2
      })

      if (matchingDefects.length > 0) {
        totalPens += pen.numberOfPens || 1
      }
    }

    return totalPens
  }

  /**
   * Get count by defect class name (Functional, Risk, Cosmetic, Good)
   * @param {string} className - Defect class name
   * @returns {{ Count: number }} - Object with Count property
   */
  Item(className) {
    const defectCounts = this.DefectCounts()
    const matching = defectCounts.filter(dc => 
      dc.className?.toLowerCase() === className.toLowerCase()
    )
    const count = matching.reduce((sum, dc) => sum + (dc.count || 0), 0)
    return { Count: count }
  }
}

/**
 * Get or create ThisLot singleton instance
 * @returns {ThisLot}
 */
export function getThisLot() {
  if (!thisLotInstance) {
    thisLotInstance = new ThisLot()
    // Initialize with open lot from store
    const { lots } = useGlobalStore.getState()
    const openLot = lots.find(lot => lot.materialStatus === 'OPEN')
    if (openLot) {
      thisLotInstance.setLot(openLot)
    }
  }
  return thisLotInstance
}

/**
 * Reset ThisLot instance (for testing or re-initialization)
 */
export function resetThisLot() {
  thisLotInstance = null
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get current product reference by part number
 * @returns {object|null} - ProductRefLlk record or null
 */
export function getCurrentProductRef() {
  const { context, productRefLlks } = useGlobalStore.getState()
  const partNumber = context.partNumber
  if (!partNumber) return null
  
  return productRefLlks.find(ref => ref.invItemLkNr === partNumber) || null
}

/**
 * Get runtime values filtered by current client name
 * @returns {Array} - Filtered runtime values
 */
export function getCurrentRuntimeValues() {
  const { runtimeValues, clientInfo } = useGlobalStore.getState()
  return runtimeValues.filter(rv => rv.serverName === clientInfo.clientName)
}

/**
 * Get MaxVisibleGroups for chart display
 * @returns {number} - Number of lots to display
 */
export function getMaxVisibleGroups() {
  const runtimeValues = getCurrentRuntimeValues()
  const maxVisibleRecord = runtimeValues.find(rv => rv.parameter === 'MaxVisibleGroups')
  return maxVisibleRecord ? parseInt(maxVisibleRecord.value) || 10 : 10
}

/**
 * Get MaterialMode from runtime values
 * @returns {string} - MaterialMode value ('Lot' or 'Continuous')
 */
export function getMaterialMode() {
  const runtimeValues = getCurrentRuntimeValues()
  const record = runtimeValues.find(rv => rv.parameter === 'MaterialMode')
  return record?.value || 'Lot'
}

// ============================================
// CreateLotID Function
// ============================================

/**
 * Create a new Lot ID based on INI config format
 * @returns {{ success: boolean, lotId?: string, error?: string }}
 */
export function CreateLotID() {
  const { INIConfig, clientInfo, context } = useGlobalStore.getState()
  
  if (!INIConfig || !INIConfig.LotId) {
    return { success: false, error: 'INI config not loaded' }
  }

  const lotIdConfig = INIConfig.LotId
  const format = lotIdConfig.Format || 'Option1'
  
  // Get product reference
  const productRef = getCurrentProductRef()
  if (!productRef) {
    return { success: false, error: 'Product reference not found for current part number' }
  }
  
  const lotidCd = productRef.lotidCd
  if (!lotidCd || lotidCd.length < 2) {
    return { success: false, error: 'Invalid lotidCd in product reference' }
  }
  const productCode = lotidCd.substring(0, 2)
  
  // Get YMDD (Year-Month-Day-Day)
  const now = new Date()
  const year = now.getFullYear() % 10 // Last digit of year
  const month = now.getMonth() + 1
  let monthChar
  if (month <= 9) {
    monthChar = String(month)
  } else if (month === 10) {
    monthChar = 'X'
  } else if (month === 11) {
    monthChar = 'Y'
  } else {
    monthChar = 'Z'
  }
  const day = String(now.getDate()).padStart(2, '0')
  const YMDD = `${year}${monthChar}${day}`
  
  // Get running number
  let countStartValue = lotIdConfig.CountStartValue || '01'
  if (typeof countStartValue === 'number') {
    countStartValue = String(countStartValue).padStart(2, '0')
  }
  const runningNumber = String(countStartValue).padStart(2, '0')
  
  // Get line number
  const lineNumber = String(clientInfo.lineNumber || '01').padStart(2, '0')
  
  // Get run type - first try INI config, then context
  const runType = lotIdConfig.RunType || context.runType || ''
  if (!runType) {
    return { success: false, error: 'Run type not configured' }
  }
  
  // Build Lot ID based on format
  let lotId
  if (format === 'Option1') {
    // Option1: [YMDD][2product_code][2digit_running][2digit_line_number][RunType]
    lotId = `${YMDD}${productCode}${runningNumber}${lineNumber}${runType}`
  } else {
    // Option2: [2product_code][YMDD][2digit_running][2digit_line_number][RunType]
    lotId = `${productCode}${YMDD}${runningNumber}${lineNumber}${runType}`
  }
  
  return { success: true, lotId }
}

/**
 * Update CountStartValue in INIConfig after lot creation
 */
export function incrementCountStartValue() {
  const { INIConfig, setINIConfig } = useGlobalStore.getState()
  
  if (INIConfig && INIConfig.LotId) {
    let current = INIConfig.LotId.CountStartValue || '01'
    if (typeof current === 'string') {
      current = parseInt(current, 10)
    }
    const next = String((current + 1) % 100).padStart(2, '0')
    
    const newConfig = {
      ...INIConfig,
      LotId: {
        ...INIConfig.LotId,
        CountStartValue: next
      }
    }
    setINIConfig(newConfig)
  }
}

// ============================================
// VerifyPenId Function
// ============================================

/**
 * Verify Pen ID against INI config and product rules
 * @param {string} penId - Pen ID to verify
 * @returns {{ success: boolean, error?: string }}
 */
export function VerifyPenId(penId) {
  if (!penId) {
    return { success: false, error: 'Pen ID is required' }
  }

  const { INIConfig } = useGlobalStore.getState()
  
  if (!INIConfig || !INIConfig.PenId) {
    return { success: false, error: 'INI config not loaded' }
  }

  const penIdConfig = INIConfig.PenId
  const maxLen = parseInt(penIdConfig.maxLen) || 11
  const minLen = parseInt(penIdConfig.minLen) || 9

  // Validate length
  if (penId.length < minLen) {
    return { success: false, error: `Pen ID length must be at least ${minLen} characters` }
  }
  if (penId.length > maxLen) {
    return { success: false, error: `Pen ID length must not exceed ${maxLen} characters` }
  }

  // Get product reference
  const productRef = getCurrentProductRef()
  if (!productRef) {
    return { success: false, error: 'Product reference not found for current part number' }
  }

  const { lotidCd, midCd } = productRef

  // Verify first 4 characters match midCd
  if (midCd && penId.substring(0, 4) !== midCd.toString()) {
    return { success: false, error: `Pen ID prefix does not match midCd (${midCd})` }
  }

  // Verify lotidCd from current lot
  const thisLot = getThisLot()
  const lot = thisLot.Lot()
  if (lot && lot.lotId && lotidCd) {
    const format = INIConfig.LotId?.Format || 'Option1'
    let lotIdFromLot
    if (format === 'Option1') {
      // Format: [YMDD][2product_code][2digit_running][2digit_line_number][RunType]
      // lotidCd is at position 4-6 (2 chars)
      // lotIdFromLot = lot.lotId.substring(4, 6)
      lotIdFromLot = penId.substring(4, 6)
    } else {
      // Format: [2product_code][YMDD][2digit_running][2digit_line_number][RunType]
      // lotidCd is at position 0-2 (2 chars)
      // lotIdFromLot = lot.lotId.substring(0, 2)
      lotIdFromLot = penId.substring(0, 2)
    }
    if (lotIdFromLot !== lotidCd.substring(0, 2)) {
      return { success: false, error: `Lot ID code does not match lotidCd (${lotidCd})` }
    }
  }

  // Update lastPen in ThisLot
  thisLot.setLastPenId(penId)

  return { success: true }
}

// ============================================
// ProductMonitor Function
// ============================================

/**
 * Product quality monitoring based on VBS script logic
 * @param {string} actionType - Action type: LotCreated, LotClosed, PenAdded, PenDeleted, LotReopened, PenUpdated
 * @param {string} penId - Pen ID (optional, used for PenAdded)
 * @returns {{ success: boolean, status?: string, message?: string }}
 */
export async function ProductMonitor(actionType, penId = null) {
  const { context, productRefLlks, penParametrics, INIConfig, penDefects, clientInfo, pens } = useGlobalStore.getState()
  const thisLot = getThisLot()

  const lot = thisLot.Lot()
  if (!lot) return false

  console.log("11111111111111, this log", thisLot)

  const auditPhase = lot.auditPhase
  const lotDefectCounts = thisLot.DefectCounts()

  console.log("22222222222222, auditPhase, defect counts", auditPhase, lotDefectCounts)

  const FunctionalCounts = lotDefectCounts.filter(dc => dc.className === 'Functional')[0].count
  const RiskCounts = lotDefectCounts.filter(dc => dc.className === 'Risk')[0].count
  const CosmeticCounts = lotDefectCounts.filter(dc => dc.className === 'Cosmetic')[0].count

  console.log("33333333333333, FunctionalCounts, RiskCounts, CosmeticCounts", FunctionalCounts, RiskCounts, CosmeticCounts)

  const QualityMonitorConfig = INIConfig.QualityMonitor.find(obj => obj.source === clientInfo.source)

  console.log("44444444444444, QualityMonitorConfig", QualityMonitorConfig)
  if (!QualityMonitorConfig) return  { success: false, message: 'Quality monitor config not found' }
  const QualityMonitorCheckConfig = QualityMonitorConfig.check
  console.log("55555555555555, QualityMonitorCheckConfig", QualityMonitorCheckConfig)
  // Perform initial quality checks
  let _qualityStatus = null
  let _audit_phase = null
  let overLimit1 = false
  let overLimit2 = false
  let overLimit3 = false
  if (auditPhase === 'INITIAL' && QualityMonitorCheckConfig.criteria.initial) {
    overLimit1 = QualityMonitorCheckConfig.criteria.initial.functional_codepair && FunctionalCounts > QualityMonitorCheckConfig.criteria.initial.Functional
    overLimit2 = QualityMonitorCheckConfig.criteria.initial.risk_codepair && RiskCounts > QualityMonitorCheckConfig.criteria.initial.Risk
    overLimit3 = QualityMonitorCheckConfig.criteria.initial.cosmetic_codepair && CosmeticCounts > QualityMonitorCheckConfig.criteria.initial.Cosmetic

    console.log("66666666666666, Initial Check - overLimit1, overLimit2, overLimit3", overLimit1, overLimit2, overLimit3)
  }
  if (auditPhase === 'REPULL' && QualityMonitorCheckConfig.criteria.repull) {
    overLimit1 = QualityMonitorCheckConfig.criteria.repull.functional_codepair && FunctionalCounts > QualityMonitorCheckConfig.criteria.repull.Functional
    overLimit2 = QualityMonitorCheckConfig.criteria.repull.risk_codepair && RiskCounts > QualityMonitorCheckConfig.criteria.repull.Risk
    overLimit3 = QualityMonitorCheckConfig.criteria.repull.cosmetic_codepair && CosmeticCounts > QualityMonitorCheckConfig.criteria.repull.Cosmetic
    console.log("66666666666666, Repull Check - overLimit1, overLimit2, overLimit3", overLimit1, overLimit2, overLimit3)
  }
  if (overLimit1 || overLimit2 || overLimit3) {
    if (auditPhase === 'INITIAL'){
      if (QualityMonitorCheckConfig.repullEnabled){
        _qualityStatus = 'PASS'
        _audit_phase = 'REPULL'
      } else {
        _qualityStatus = 'FAIL'
      }
    }
    if (auditPhase === 'REPULL') {
      if (QualityMonitorConfig.immediateFail){
        _qualityStatus = 'FAIL'
      } else {
        _qualityStatus = '100-PERCENT'
      }
    }
  }
  if (_qualityStatus || _audit_phase) {
    await thisLot.setQualityStatusAndAuditPhase(_qualityStatus, _audit_phase)
  }

  return { success: true }
}

/**
 * Parse nCriticalCount config from INI
 * Example: ("FIT", "%") , ("FWT", "%"),("FPQ", "FDL")...
 * @param {object} INIConfig
 * @returns {Array<[string, string]>}
 */
function parseCriticalCountConfig(INIConfig) {
  const pairs = []
  
  if (!INIConfig?.QualityMonitor?.nCriticalCount) {
    // Default critical pairs
    return [
      ['FIT', '%'],
      ['FWT', '%'],
      ['FPQ', 'FDL'],
      ['FVL', 'FVD'],
      ['FVL', 'FVL'],
      ['FVL', 'FVM'],
      ['FVL', 'FVT']
    ]
  }

  const configStr = INIConfig.QualityMonitor.nCriticalCount
  // Parse format: ("FIT", "%") , ("FWT", "%")
  const regex = /\("([^"]+)",\s*"([^"]+)"\)/g
  let match
  while ((match = regex.exec(configStr)) !== null) {
    pairs.push([match[1], match[2]])
  }

  return pairs.length > 0 ? pairs : [
    ['FIT', '%'],
    ['FWT', '%'],
    ['FPQ', 'FDL'],
    ['FVL', 'FVD'],
    ['FVL', 'FVL'],
    ['FVL', 'FVM'],
    ['FVL', 'FVT']
  ]
}

export default {
  getThisLot,
  resetThisLot,
  getCurrentProductRef,
  getCurrentRuntimeValues,
  getMaxVisibleGroups,
  getMaterialMode,
  CreateLotID,
  incrementCountStartValue,
  VerifyPenId,
  ProductMonitor,
}
