import { useState, useMemo, useCallback, useEffect } from 'react'
import { useGlobalStore } from '../store'
import { 
  getMaterialMode, 
  CreateLotID, 
  incrementCountStartValue, 
  ProductMonitor, 
  getThisLot 
} from '../utils/lotUtils'
import { CreateLotModal, AlertModal } from '../components'
import { lotCreate, lotUpdateMaterialStatus } from '../services/utils'
import './pages.css'

// Generate Lot ID from current time: "25-12-22 05 PM"
const generateLotId = () => {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  let hours = now.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const hh = String(hours).padStart(2, '0')
  return `${yy}-${mm}-${dd} ${hh} ${ampm}`
}

function FrmLotManager() {
  const { lots, setLots, setOpenLot, setLotComments, setLotDefectCounts, clientInfo, pens, lotComments, lotDefectCounts, showLoading, hideLoading, showToast } = useGlobalStore()
  
  // 按状态分组的 lots - 使用 materialStatus 字段
  const { openLot, closedLots, suspendedLots } = useMemo(() => {
    const open = lots.find(lot => lot.materialStatus === 'OPEN') || null
    const closed = lots.filter(lot => lot.materialStatus === 'CLOSED')
    const suspended = lots.filter(lot => lot.materialStatus === 'SUSPENDED')
    return { openLot: open, closedLots: closed, suspendedLots: suspended }
  }, [lots])

  // 本地状态管理
  const [localOpenLot, setLocalOpenLot] = useState(openLot)
  const [localClosedLots, setLocalClosedLots] = useState(closedLots)
  const [localSuspendedLots, setLocalSuspendedLots] = useState(suspendedLots)
  
  // 当 store 中的 lots 数据变化时（包括 persist 恢复），同步到 local state
  // 仅在 local state 还是空的初始状态时同步，避免覆盖用户在子窗口中的操作
  useEffect(() => {
    if (lots.length > 0 && localOpenLot === null && localClosedLots.length === 0 && localSuspendedLots.length === 0) {
      setLocalOpenLot(openLot)
      setLocalClosedLots(closedLots)
      setLocalSuspendedLots(suspendedLots)
    }
  }, [lots, openLot, closedLots, suspendedLots])
  
  // 选中状态
  const [selectedClosedIndex, setSelectedClosedIndex] = useState(-1)
  const [selectedSuspendedIndex, setSelectedSuspendedIndex] = useState(-1)
  
  // Create Lot Modal state
  const [createLotModalOpen, setCreateLotModalOpen] = useState(false)
  const [suggestedLotId, setSuggestedLotId] = useState('')

  // Alert modal state
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertContent, setAlertContent] = useState('')

  // 排序状态
  const [closedSortBy, setClosedSortBy] = useState('birthday') // 'birthday' | 'name'
  const [suspendedSortBy, setSuspendedSortBy] = useState('birthday')

  // 排序函数
  const sortLots = useCallback((lotList, sortBy) => {
    return [...lotList].sort((a, b) => {
      if (sortBy === 'birthday') {
        return new Date(a.birthday || 0) - new Date(b.birthday || 0)
      } else {
        return (a.lotId || '').localeCompare(b.lotId || '')
      }
    })
  }, [])

  // 排序 CLOSED 列表
  const handleSortClosed = (sortBy) => {
    setClosedSortBy(sortBy)
    setLocalClosedLots(sortLots(localClosedLots, sortBy))
    setSelectedClosedIndex(-1)
  }

  // 排序 SUSPENDED 列表
  const handleSortSuspended = (sortBy) => {
    setSuspendedSortBy(sortBy)
    setLocalSuspendedLots(sortLots(localSuspendedLots, sortBy))
    setSelectedSuspendedIndex(-1)
  }

  // 移动 CLOSED -> SUSPENDED
  const moveClosedToSuspended = () => {
    if (selectedClosedIndex < 0 || selectedClosedIndex >= localClosedLots.length) return
    const lot = { ...localClosedLots[selectedClosedIndex], materialStatus: 'SUSPENDED' }
    const newClosed = localClosedLots.filter((_, i) => i !== selectedClosedIndex)
    setLocalClosedLots(newClosed)
    setLocalSuspendedLots([...localSuspendedLots, lot])
    setSelectedClosedIndex(-1)
  }

  // 移动 SUSPENDED -> CLOSED
  const moveSuspendedToClosed = () => {
    if (selectedSuspendedIndex < 0 || selectedSuspendedIndex >= localSuspendedLots.length) return
    const lot = { ...localSuspendedLots[selectedSuspendedIndex], materialStatus: 'CLOSED' }
    const newSuspended = localSuspendedLots.filter((_, i) => i !== selectedSuspendedIndex)
    setLocalSuspendedLots(newSuspended)
    setLocalClosedLots([...localClosedLots, lot])
    setSelectedSuspendedIndex(-1)
  }

  // 上移 CLOSED
  const moveClosedUp = () => {
    if (selectedClosedIndex <= 0) return
    const newList = [...localClosedLots]
    ;[newList[selectedClosedIndex - 1], newList[selectedClosedIndex]] = 
      [newList[selectedClosedIndex], newList[selectedClosedIndex - 1]]
    setLocalClosedLots(newList)
    setSelectedClosedIndex(selectedClosedIndex - 1)
  }

  // 下移 CLOSED
  const moveClosedDown = () => {
    if (selectedClosedIndex < 0 || selectedClosedIndex >= localClosedLots.length - 1) return
    const newList = [...localClosedLots]
    ;[newList[selectedClosedIndex], newList[selectedClosedIndex + 1]] = 
      [newList[selectedClosedIndex + 1], newList[selectedClosedIndex]]
    setLocalClosedLots(newList)
    setSelectedClosedIndex(selectedClosedIndex + 1)
  }

  // 上移 SUSPENDED
  const moveSuspendedUp = () => {
    if (selectedSuspendedIndex <= 0) return
    const newList = [...localSuspendedLots]
    ;[newList[selectedSuspendedIndex - 1], newList[selectedSuspendedIndex]] = 
      [newList[selectedSuspendedIndex], newList[selectedSuspendedIndex - 1]]
    setLocalSuspendedLots(newList)
    setSelectedSuspendedIndex(selectedSuspendedIndex - 1)
  }

  // 下移 SUSPENDED
  const moveSuspendedDown = () => {
    if (selectedSuspendedIndex < 0 || selectedSuspendedIndex >= localSuspendedLots.length - 1) return
    const newList = [...localSuspendedLots]
    ;[newList[selectedSuspendedIndex], newList[selectedSuspendedIndex + 1]] = 
      [newList[selectedSuspendedIndex + 1], newList[selectedSuspendedIndex]]
    setLocalSuspendedLots(newList)
    setSelectedSuspendedIndex(selectedSuspendedIndex + 1)
  }

  // OPEN -> CLOSED
  const moveOpenToClosed = () => {
    if (!localOpenLot) return
    const lot = { ...localOpenLot, materialStatus: 'CLOSED' }
    setLocalClosedLots([lot, ...localClosedLots])
    setLocalOpenLot(null)
  }

  // OPEN -> SUSPENDED
  const moveOpenToSuspended = () => {
    if (!localOpenLot) return
    const lot = { ...localOpenLot, materialStatus: 'SUSPENDED' }
    setLocalSuspendedLots([lot, ...localSuspendedLots])
    setLocalOpenLot(null)
  }

  // 设置 CLOSED 中的某个为 OPEN
  const setClosedAsOpen = () => {
    if (selectedClosedIndex < 0 || selectedClosedIndex >= localClosedLots.length) return
    const newOpenLot = { ...localClosedLots[selectedClosedIndex], materialStatus: 'OPEN' }
    const newClosed = localClosedLots.filter((_, i) => i !== selectedClosedIndex)
    
    // 如果当前有 OPEN，把它放到 CLOSED
    if (localOpenLot) {
      const oldOpen = { ...localOpenLot, materialStatus: 'CLOSED' }
      setLocalClosedLots([oldOpen, ...newClosed])
    } else {
      setLocalClosedLots(newClosed)
    }
    setLocalOpenLot(newOpenLot)
    setSelectedClosedIndex(-1)
  }

  // 设置 SUSPENDED 中的某个为 OPEN
  const setSuspendedAsOpen = () => {
    if (selectedSuspendedIndex < 0 || selectedSuspendedIndex >= localSuspendedLots.length) return
    const newOpenLot = { ...localSuspendedLots[selectedSuspendedIndex], materialStatus: 'OPEN' }
    const newSuspended = localSuspendedLots.filter((_, i) => i !== selectedSuspendedIndex)
    
    // 如果当前有 OPEN，把它放到 SUSPENDED
    if (localOpenLot) {
      const oldOpen = { ...localOpenLot, materialStatus: 'SUSPENDED' }
      setLocalSuspendedLots([oldOpen, ...newSuspended])
    } else {
      setLocalSuspendedLots(newSuspended)
    }
    setLocalOpenLot(newOpenLot)
    setSelectedSuspendedIndex(-1)
  }

  // Create New Lot - check MaterialMode and apply appropriate logic
  const handleCreateNewLot = () => {
    const materialMode = getMaterialMode()

    if (materialMode === 'Lot') {
      // Lot mode - generate suggested lot ID via CreateLotID and show modal
      const result = CreateLotID()
      if (result.success) {
        setSuggestedLotId(result.lotId)
      } else {
        setSuggestedLotId('')
        // Show error if CreateLotID failed
        if (result.error) {
          setAlertTitle('Error')
          setAlertContent(result.error)
          setAlertOpen(true)
          return
        }
      }
      setCreateLotModalOpen(true)
    } else {
      // Continuous mode - create with timestamp directly
      const newLotId = generateLotId()
      doCreateLot(newLotId)
    }
  }

  // Actually create the lot and update local state only (Save will sync to global store)
  const doCreateLot = useCallback(async (lotId) => {
    // 检查 lot ID 是否重复
    // const allLocalLots = [
    //   ...(localOpenLot ? [localOpenLot] : []),
    //   ...localClosedLots,
    //   ...localSuspendedLots,
    // ]
    // const isDuplicate = allLocalLots.some(lot => lot.lotId === lotId) || lots.some(lot => lot.lotId === lotId)
    // if (isDuplicate) {
    //   setAlertTitle('Error')
    //   setAlertContent(`Lot ID "${lotId}" already exists. Please use a different Lot ID.`)
    //   setAlertOpen(true)
    //   return
    // }

    const now = new Date().toISOString()
    const newLot = {
      lotId,
      lineType: clientInfo.lineType,
      lineNumber: parseInt(clientInfo.lineNumber) || 1,
      source: clientInfo.source,
      materialStatus: localOpenLot ? 'CLOSED' : 'OPEN',
      qualityStatus: 'UNKNOWN',
      auditPhase: 'INITIAL',
      birthday: now,
      startTime: now,
      endTime: null,
      operator: '',
      shift: '',
    }

    // Call api - 创建lot，返回成功才执行后面的逻辑，返回错误给出 Alert 提示
    try {
      showLoading('Requesting ...')
      const resp = await lotCreate({
        // lineNumber: newLot.lineNumber,
        // lineType: newLot.lineType,
        // source: newLot.source,
        lotId: newLot.lotId,
        birthday: newLot.birthday,
      })
      hideLoading()
      if (resp._resp === 'success') {
        showToast('Lot created successfully', 'success')

        if (localOpenLot) {
          // Already has an OPEN lot - new lot goes to CLOSED list
          setLocalClosedLots(prev => [...prev, newLot])
        } else {
          // No OPEN lot - new lot becomes OPEN
          setLocalOpenLot(newLot)
        }

        // Increment count start value (for Lot mode format tracking)
        incrementCountStartValue()

        setCreateLotModalOpen(false)

      } else {
        showToast(resp._message, 'error')
      }
    } catch (err) {
      hideLoading()
      setAlertTitle('Error')
      setAlertContent(err.message || 'Failed to create lot.')
      setAlertOpen(true)
      return
    }

  }, [clientInfo, localOpenLot, localClosedLots, localSuspendedLots, lots])

  // Handle CreateLotModal confirm (Lot mode)
  const handleCreateLotConfirm = useCallback(async (lotId) => {
    await doCreateLot(lotId)
  }, [doCreateLot])

  // Delete Empty Lot - empty lots are lots that have no pens
  const handleDeleteEmptyLot = () => {
    // Determine which lots are empty (no pens associated)
    const isEmptyLot = (lot) => {
      if (!lot) return false
      return !pens.some(p => p.lotId === lot.lotId)
    }

    // Collect all empty lot IDs for cleanup
    const emptyLotIds = []

    // Check OPEN lot
    let newOpenLot = localOpenLot
    if (localOpenLot && isEmptyLot(localOpenLot)) {
      emptyLotIds.push(localOpenLot.lotId)
      newOpenLot = null
      setLocalOpenLot(null)
    }

    // Filter CLOSED lots
    const newClosedLots = localClosedLots.filter(lot => {
      if (isEmptyLot(lot)) {
        emptyLotIds.push(lot.lotId)
        return false
      }
      return true
    })
    setLocalClosedLots(newClosedLots)

    // Filter SUSPENDED lots
    const newSuspendedLots = localSuspendedLots.filter(lot => {
      if (isEmptyLot(lot)) {
        emptyLotIds.push(lot.lotId)
        return false
      }
      return true
    })
    setLocalSuspendedLots(newSuspendedLots)

    // Reset selection
    setSelectedClosedIndex(-1)
    setSelectedSuspendedIndex(-1)

    if (emptyLotIds.length === 0) {
      setAlertTitle('Info')
      setAlertContent('No empty lots found. Empty lots are lots with no pens.')
      setAlertOpen(true)
      return
    }

    // Immediately save to global store to trigger data sync (delete.json)
    const allRemainingLots = [
      ...(newOpenLot ? [newOpenLot] : []),
      ...newClosedLots,
      ...newSuspendedLots,
    ]
    setLots(allRemainingLots)

    // Also clean up related lotComments and lotDefectCounts
    const newLotComments = lotComments.filter(c => !emptyLotIds.includes(c.lotId))
    setLotComments(newLotComments)
    const newLotDefectCounts = lotDefectCounts.filter(d => !emptyLotIds.includes(d.lotId))
    setLotDefectCounts(newLotDefectCounts)

    // Update openLot in global store
    if (newOpenLot) {
      setOpenLot(newOpenLot)
    } else {
      setOpenLot(null)
    }

    // Notify parent window
    if (window.electronAPI?.notifyParent) {
      window.electronAPI.notifyParent('lots-updated', allRemainingLots)
    }

    console.log(`🗑️ Deleted ${emptyLotIds.length} empty lot(s): ${emptyLotIds.join(', ')}`)
    setAlertTitle('Success')
    setAlertContent(`Deleted ${emptyLotIds.length} empty lot(s): ${emptyLotIds.join(', ')}`)
    setAlertOpen(true)
  }

  // Save changes to store and notify parent window
  const handleSave = async () => {
    const allLots = [
      ...(localOpenLot ? [localOpenLot] : []),
      ...localClosedLots,
      ...localSuspendedLots,
    ]

    // Call api - 更新所有的 lots，只有返回成功无错误的情况下才执行后面的逻辑
    try {
      showLoading('Requesting ...')
      await lotUpdateMaterialStatus(allLots)
      hideLoading()
      showToast('Lots updated successfully', 'success')
    } catch (err) {
      hideLoading()
      setAlertTitle('Error')
      setAlertContent(err.message || 'Failed to update lot status.')
      setAlertOpen(true)
      return
    }
    
    setLots(allLots)
    
    // Update openLot in global store and ThisLot singleton
    if (localOpenLot) {
      setOpenLot(localOpenLot)
      const tl = getThisLot()
      tl.setLot(localOpenLot)

      // If this is a newly created lot (not existed in original lots), call ProductMonitor
      // const isNewLot = !lots.find(l => l.lotId === localOpenLot.lotId)
      // if (isNewLot) {
      //   ProductMonitor('LotCreated')
      // }
    } else {
      setOpenLot(null)
    }
    
    // Notify parent window to refresh
    if (window.electronAPI?.notifyParent) {
      window.electronAPI.notifyParent('lots-updated', allLots)
    }
    
    // Close window
    if (window.close) {
      window.close()
    }
  }

  // Close without saving
  const handleClose = () => {
    if (window.close) {
      window.close()
    }
  }

  return (
    <div className="lot-manager-page">
      {/* OPEN Lot Row */}
      <div className="open-lot-row">
        <span className="status-badge open">OPEN</span>
        <span className="open-lot-id">{localOpenLot?.lotId || 'None'}</span>
        <div className="open-lot-buttons">
          <button 
            className="open-action-btn" 
            onClick={moveOpenToClosed} 
            disabled={!localOpenLot}
          >
            To Closed
          </button>
          <button 
            className="open-action-btn" 
            onClick={moveOpenToSuspended} 
            disabled={!localOpenLot}
          >
            To Suspended
          </button>
        </div>
      </div>

      {/* 左右列表区域 */}
      <div className="lot-lists-container">
        {/* CLOSED 列表 */}
        <div className="lot-list-panel">
          <div className="panel-header">
            <span className="status-badge closed">CLOSED</span>
            <span className="panel-title">({localClosedLots.length})</span>
            <div className="sort-buttons">
              <button 
                className={`sort-btn ${closedSortBy === 'birthday' ? 'active' : ''}`}
                onClick={() => handleSortClosed('birthday')}
              >
                Birthday
              </button>
              <button 
                className={`sort-btn ${closedSortBy === 'name' ? 'active' : ''}`}
                onClick={() => handleSortClosed('name')}
              >
                Name
              </button>
            </div>
          </div>
          <div className="lot-list">
            {localClosedLots.map((lot, index) => (
              <div
                key={lot.lotId || index}
                className={`lot-list-item ${selectedClosedIndex === index ? 'selected' : ''}`}
                onClick={() => setSelectedClosedIndex(index)}
              >
                {lot.lotId}
              </div>
            ))}
            {localClosedLots.length === 0 && (
              <div className="empty-list">No CLOSED lots</div>
            )}
          </div>
          <div className="list-actions">
            <button className="move-btn" onClick={setClosedAsOpen} disabled={selectedClosedIndex < 0}>
              ★ Set Open
            </button>
            <button className="move-btn" onClick={moveClosedDown} disabled={selectedClosedIndex < 0 || selectedClosedIndex >= localClosedLots.length - 1}>
              ↓ Down
            </button>
            <button className="move-btn" onClick={moveClosedUp} disabled={selectedClosedIndex <= 0}>
              ↑ Up
            </button>
            <button className="move-btn primary" onClick={moveClosedToSuspended} disabled={selectedClosedIndex < 0}>
              Right → 
            </button>
          </div>
        </div>

        {/* 中间操作区 */}
        {/* <div className="center-actions">
          <button className="transfer-btn" onClick={moveSuspendedToClosed} disabled={selectedSuspendedIndex < 0}>
            ←
          </button>
          <button className="transfer-btn" onClick={moveClosedToSuspended} disabled={selectedClosedIndex < 0}>
            →
          </button>
        </div> */}

        {/* SUSPENDED 列表 */}
        <div className="lot-list-panel">
          <div className="panel-header">
            <span className="status-badge suspended">SUSPENDED</span>
            <span className="panel-title">({localSuspendedLots.length})</span>
            <div className="sort-buttons">
              <button 
                className={`sort-btn ${suspendedSortBy === 'birthday' ? 'active' : ''}`}
                onClick={() => handleSortSuspended('birthday')}
              >
                Birthday
              </button>
              <button 
                className={`sort-btn ${suspendedSortBy === 'name' ? 'active' : ''}`}
                onClick={() => handleSortSuspended('name')}
              >
                Name
              </button>
            </div>
          </div>
          <div className="lot-list">
            {localSuspendedLots.map((lot, index) => (
              <div
                key={lot.lotId || index}
                className={`lot-list-item ${selectedSuspendedIndex === index ? 'selected' : ''}`}
                onClick={() => setSelectedSuspendedIndex(index)}
              >
                {lot.lotId}
              </div>
            ))}
            {localSuspendedLots.length === 0 && (
              <div className="empty-list">No SUSPENDED lots</div>
            )}
          </div>
          <div className="list-actions">
            <button className="move-btn primary" onClick={moveSuspendedToClosed} disabled={selectedSuspendedIndex < 0}>
              ← Left
            </button>
            <button className="move-btn" onClick={moveSuspendedUp} disabled={selectedSuspendedIndex <= 0}>
              ↑ Up
            </button>
            <button className="move-btn" onClick={moveSuspendedDown} disabled={selectedSuspendedIndex < 0 || selectedSuspendedIndex >= localSuspendedLots.length - 1}>
              ↓ Down
            </button>
            <button className="move-btn" onClick={setSuspendedAsOpen} disabled={selectedSuspendedIndex < 0}>
              ★ Set Open
            </button>

          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="lot-manager-footer">
        <div className="footer-left">
          <button className="btn btn-action" onClick={handleCreateNewLot}>
            Create New Lot
          </button>
          {/* <button className="btn btn-action" onClick={handleDeleteEmptyLot}>
            Delete Empty Lot
          </button> */}
        </div>
        <div className="footer-right">
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>

      {/* Create Lot Modal (for Lot mode) */}
      <CreateLotModal
        open={createLotModalOpen}
        onClose={() => setCreateLotModalOpen(false)}
        onConfirm={handleCreateLotConfirm}
        suggestedLotId={suggestedLotId}
      />

      {/* Alert Modal */}
      <AlertModal
        open={alertOpen}
        title={alertTitle}
        content={alertContent}
        onOk={() => setAlertOpen(false)}
      />
    </div>
  )
}

export default FrmLotManager
