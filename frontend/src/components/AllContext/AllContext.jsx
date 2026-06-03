import { useCallback, useEffect, useMemo, useState } from 'react'
import { useGlobalStore } from '../../store'
import { saveUserConfig } from '../../services/utils'
import { useRefreshData } from '../../hooks/useAppInit'
import ConfirmModal from '../ConfirmModal'
import './AllContext.css'

function AllContext({ onOk, onHelp, onAbort }) {
  const { 
    context,
    updateContext,
    clientInfo,
    setClientInfo,
    stationUsers, 
    clientCustomers,
    shifts, 
    runTypes, 
    lineTypes, 
    physicalLines,
    stations,
    accumulators,
    productRefLlks,
  } = useGlobalStore()

  const { refreshData } = useRefreshData()

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingChange, setPendingChange] = useState(null)

  // ─── Part Number / Part Name linked dropdown lists ───────────────────────
  // All options derived from productRefLlks
  const allPartNumbers = useMemo(
    () => productRefLlks.map(r => r.invItemLkNr),
    [productRefLlks]
  )
  const allPartNames = useMemo(
    () => productRefLlks.map(r => r.productNm),
    [productRefLlks]
  )

  // Visible options for each dropdown (may be narrowed to 1 item when the
  // other side has a selection)
  const [partNumberOptions, setPartNumberOptions] = useState(allPartNumbers)
  const [partNameOptions, setPartNameOptions] = useState(allPartNames)

  // ─── Initialise linked selections on mount / when productRefLlks loads ──
  useEffect(() => {
    if (productRefLlks.length === 0) return

    const currentPartNumber = context.partNumber || ''
    const currentPartName   = context.partName   || ''

    if (currentPartNumber) {
      // Try to match by partNumber
      const ref = productRefLlks.find(r => r.invItemLkNr === currentPartNumber)
      if (ref) {
        // Lock Part Name to the matched record
        setPartNumberOptions(allPartNumbers)
        setPartNameOptions([ref.productNm])
        // Sync partName in store if it differs
        if (context.partName !== ref.productNm) {
          updateContext({ partName: ref.productNm })
        }
        return
      }
    }

    if (currentPartName) {
      // Fall back: try to match by partName
      const ref = productRefLlks.find(r => r.productNm === currentPartName)
      if (ref) {
        // Lock Part Number to the matched record
        setPartNameOptions(allPartNames)
        setPartNumberOptions([ref.invItemLkNr])
        // Sync partNumber in store if it differs
        if (context.partNumber !== ref.invItemLkNr) {
          updateContext({ partNumber: ref.invItemLkNr })
        }
        return
      }
    }

    // Nothing matched – show full lists
    setPartNumberOptions(allPartNumbers)
    setPartNameOptions(allPartNames)
  }, [productRefLlks]) // intentionally run only when productRefLlks changes

  // ─── Other dropdown options ───────────────────────────────────────────────
  const operatorOptions  = stationUsers.map(obj => obj.userName)
  const shiftOptions     = shifts.map(obj => obj.shift)
  const runTypeOptions   = runTypes.map(obj => obj.runType)
  const lineTypeOptions  = [...new Set(clientCustomers.map(obj => obj.lineType))]
  const lineIdOptions    = [...new Set(clientCustomers.map(obj => String(obj.lineNumber)))]
  const sourceOptions    = [...new Set(clientCustomers.map(obj => obj.source))]
  const accumulatorOptions = accumulators.map(obj => obj.accumulator)

  // ─── Config save helper ───────────────────────────────────────────────────
  const saveConfig = useCallback(async (newClientInfo, newContext) => {
    const config = {
      ...newContext,
      clientName: newClientInfo.clientName,
      lineType:   newClientInfo.lineType,
      lineNumber: newClientInfo.lineNumber,
      source:     newClientInfo.source,
    }
    const result = await saveUserConfig(config)
    if (!result.success) {
      console.error('Failed to save user config:', result.error)
    }
  }, [])

  // ─── Generic context field change ────────────────────────────────────────
  const handleContextChange = useCallback(async (field, value) => {
    const updates = { [field]: value }
    updateContext(updates)
    const newContext = { ...context, ...updates }
    await saveConfig(clientInfo, newContext)
  }, [context, clientInfo, updateContext, saveConfig])

  // ─── Part Number selection ────────────────────────────────────────────────
  const handlePartNumberChange = useCallback(async (value) => {
    if (!value) {
      // "--Select--" chosen: restore full Part Name list, clear Part Number
      setPartNameOptions(allPartNames)
      const updates = { partNumber: '', partName: '' }
      updateContext(updates)
      await saveConfig(clientInfo, { ...context, ...updates })
      return
    }

    // Find the linked record
    const ref = productRefLlks.find(r => r.invItemLkNr === value)
    const linkedName = ref ? ref.productNm : ''

    // Narrow Part Name list to the single linked name
    setPartNameOptions(linkedName ? [linkedName] : allPartNames)

    const updates = { partNumber: value, partName: linkedName }
    updateContext(updates)
    await saveConfig(clientInfo, { ...context, ...updates })
  }, [productRefLlks, allPartNames, context, clientInfo, updateContext, saveConfig])

  // ─── Part Name selection ──────────────────────────────────────────────────
  const handlePartNameChange = useCallback(async (value) => {
    if (!value) {
      // "--Select--" chosen: restore full Part Number list, clear Part Name
      setPartNumberOptions(allPartNumbers)
      const updates = { partName: '', partNumber: '' }
      updateContext(updates)
      await saveConfig(clientInfo, { ...context, ...updates })
      return
    }

    // Find the linked record
    const ref = productRefLlks.find(r => r.productNm === value)
    const linkedNumber = ref ? ref.invItemLkNr : ''

    // Narrow Part Number list to the single linked number
    setPartNumberOptions(linkedNumber ? [linkedNumber] : allPartNumbers)

    const updates = { partName: value, partNumber: linkedNumber }
    updateContext(updates)
    await saveConfig(clientInfo, { ...context, ...updates })
  }, [productRefLlks, allPartNumbers, context, clientInfo, updateContext, saveConfig])

  // ─── clientInfo field change (Physical Line tab) ──────────────────────────
  const handleClientInfoChange = useCallback(async (field, value) => {
    if (['lineType', 'lineNumber', 'source'].includes(field)) {
      setPendingChange({ field, value })
      setConfirmOpen(true)
      return
    }
    const newClientInfo = { ...clientInfo, [field]: value }
    setClientInfo(newClientInfo)
    await saveConfig(newClientInfo, context)
  }, [clientInfo, context, setClientInfo, saveConfig])

  const handleConfirmLineChange = useCallback(async () => {
    if (!pendingChange) return
    const { field, value } = pendingChange
    const newClientInfo = { ...clientInfo, [field]: value }
    setClientInfo(newClientInfo)
    if (newClientInfo.lineType && newClientInfo.lineNumber && newClientInfo.source) {
      await refreshData(newClientInfo)
    } else {
      await saveConfig(newClientInfo, context)
    }
    setConfirmOpen(false)
    setPendingChange(null)
  }, [pendingChange, clientInfo, context, setClientInfo, saveConfig, refreshData])

  const handleCancelLineChange = useCallback(() => {
    setConfirmOpen(false)
    setPendingChange(null)
  }, [])

  const activeTab = context.activeTab || 'user'
  const setActiveTab = (tab) => handleContextChange('activeTab', tab)

  return (
    <div className="all-context">
      {/* Tab 标签 */}
      <div className="context-tabs">
        <button
          className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          User
        </button>
        <button
          className={`tab-btn ${activeTab === 'material' ? 'active' : ''}`}
          onClick={() => setActiveTab('material')}
        >
          Material
        </button>
        <button
          className={`tab-btn ${activeTab === 'physicalLine' ? 'active' : ''}`}
          onClick={() => setActiveTab('physicalLine')}
        >
          Physical Line
        </button>
      </div>

      {/* Tab 内容 */}
      <div className="context-content">
        {/* User Tab */}
        {activeTab === 'user' && (
          <div className="tab-panel">
            <div className="form-group">
              <label>Operator</label>
              <select 
                value={context.operator || ''} 
                onChange={(e) => handleContextChange('operator', e.target.value)}
              >
                <option value="">-- Select --</option>
                {operatorOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Shift</label>
              <select 
                value={context.shift || ''} 
                onChange={(e) => handleContextChange('shift', e.target.value)}
              >
                <option value="">-- Select --</option>
                {shiftOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Material Tab */}
        {activeTab === 'material' && (
          <div className="tab-panel">
            <div className="form-group">
              <label>Run Type</label>
              <select 
                value={context.runType || ''} 
                onChange={(e) => handleContextChange('runType', e.target.value)}
              >
                <option value="">-- Select --</option>
                {runTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Experiment ID</label>
              <input
                type="text"
                value={context.experimentId || ''}
                onChange={(e) => handleContextChange('experimentId', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Part Number</label>
              <select
                value={context.partNumber || ''}
                onChange={(e) => handlePartNumberChange(e.target.value)}
              >
                <option value="">-- Select --</option>
                {partNumberOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Part Name</label>
              <select
                value={context.partName || ''}
                onChange={(e) => handlePartNameChange(e.target.value)}
              >
                <option value="">-- Select --</option>
                {partNameOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Thin Film Lot</label>
              <input
                type="text"
                value={context.thinFilmLot || ''}
                onChange={(e) => handleContextChange('thinFilmLot', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Physical Line Tab - 绑定 clientInfo */}
        {activeTab === 'physicalLine' && (
          <div className="tab-panel">
            <div className="form-group">
              <label>Line Type</label>
              <select 
                value={clientInfo.lineType || ''} 
                onChange={(e) => handleClientInfoChange('lineType', e.target.value)}
              >
                <option value="">-- Select --</option>
                {lineTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Line ID</label>
              <select 
                value={clientInfo.lineNumber || ''} 
                onChange={(e) => handleClientInfoChange('lineNumber', e.target.value)}
              >
                <option value="">-- Select --</option>
                {lineIdOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Source</label>
              <select 
                value={clientInfo.source || ''} 
                onChange={(e) => handleClientInfoChange('source', e.target.value)}
              >
                <option value="">-- Select --</option>
                {sourceOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Accumulator</label>
              <select 
                value={context.accumulator || ''} 
                onChange={(e) => handleContextChange('accumulator', e.target.value)}
              >
                <option value="">-- Select --</option>
                {accumulatorOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Production Date</label>
              <input
                type="text"
                value={context.productionDate || ''}
                onChange={(e) => handleContextChange('productionDate', e.target.value)}
                disabled
                className="disabled-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="context-buttons">
        <button className="btn" onClick={onOk}>OK</button>
        <button className="btn" onClick={onHelp}>Help</button>
        <button className="btn" onClick={onAbort}>Abort</button>
      </div>

      {/* Line change confirmation modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Change"
        content="Changing the Line state will refresh current data. Are you sure you want to continue?"
        onOk={handleConfirmLineChange}
        onCancel={handleCancelLineChange}
      />
    </div>
  )
}

export default AllContext
