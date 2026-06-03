import { useState, useEffect, useMemo, useCallback } from 'react'
import { useGlobalStore } from '../store'
import { DataTable, AlertModal } from '../components'
import './pages.css'

function FrmLotSummary() {
  const [lotId, setLotId] = useState('')
  const [lotBirthday, setLotBirthday] = useState(null) // null = not provided, use lotId only
  const [selectedPen, setSelectedPen] = useState(null)
  const [activeTab, setActiveTab] = useState('parameters') // 'parameters', 'comments', 'pens'

  // Alert modal state
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertContent, setAlertContent] = useState('')

  const { 
    context,
    lots,
    setLots,
    lotComments,
    setLotComments,
    lotDefectCounts,
    setLotDefectCounts,
    pens,
    penDefects,
    products,
    openLot,
    setOpenLot,
  } = useGlobalStore()

  // 获取当前 lot 的数据
  // 如果传递了 birthday 就同时以 lotId + birthday 定位，防止 lotId 重复时拿到错误的 lot
  const currentLot = useMemo(() => {
    return lots.find(l =>
      l.lotId === lotId &&
      (lotBirthday == null || l.birthday === lotBirthday)
    )
  }, [lots, lotId, lotBirthday])

  // 获取窗口参数
  useEffect(() => {
    const getParams = async () => {
      if (window.electronAPI?.getWindowParams) {
        const params = await window.electronAPI.getWindowParams()
        if (params.lotId) {
          setLotId(params.lotId)
        }
        if (params.birthday != null) {
          setLotBirthday(params.birthday)
        }
      }
    }
    getParams()

    // 监听参数更新
    if (window.electronAPI?.onWindowParamsUpdate) {
      window.electronAPI.onWindowParamsUpdate((params) => {
        if (params.lotId) {
          setLotId(params.lotId)
        }
        if (params.birthday != null) {
          setLotBirthday(params.birthday)
        }
      })
    }
  }, [])



  // 获取当前 lot 的评论（添加唯一 ID）
  const currentComments = useMemo(() => {
    return lotComments
      .filter(c =>
        c.lotId === lotId &&
        (lotBirthday == null || c.birthday === lotBirthday || c.lotBirthday === lotBirthday)
      )
      .map((c, idx) => ({ ...c, id: `${c.lotId}-${c.commentDate}-${idx}` }))
  }, [lotComments, lotId, lotBirthday])

  // 获取当前 lot 的 pens
  const currentPens = useMemo(() => {
    return pens.filter(p =>
      p.lotId === lotId &&
      (lotBirthday == null || p.birthday === lotBirthday)
    )
  }, [pens, lotId, lotBirthday])

  // 从全局 context 获取 Parameter Details
  const parameterDetails = useMemo(() => {
    const product = products.find(p => p.productNumber === context.partNumber)
    return [
      { parameter: 'LotId', value: lotId || '-' },
      { parameter: 'Birthday', value: currentLot?.birthday ? new Date(currentLot.birthday).toLocaleString() : '-' },
      { parameter: 'Shift', value: context.shift || '-' },
      { parameter: 'RunType', value: context.runType || '-' },
      { parameter: 'ProductName', value: context.partName || product?.productName || '-' },
      { parameter: 'ProductNumber', value: context.partNumber || product?.productNumber || '-' },
      { parameter: 'ExperimentId', value: context.experimentId || '-' },
      { parameter: 'ProductType', value: product?.productType || '-' },
      { parameter: 'ThinFilmLotId', value: context.thinFilmLot || '-' },
    ]
  }, [lotId, currentLot, context, products])

  // Pen Details 数据
  const penDetails = useMemo(() => {
    return currentPens.map((pen, idx) => {
      const defects = penDefects.filter(d => d.penId === pen.penId)
      const defect = defects[0] || {}
      return {
        id: String(idx + 1),
        penId: pen.penId,
        inspectionDate: pen.inspectionDate ? new Date(pen.inspectionDate).toLocaleString() : '-',
        numberOfPens: pen.numberOfPens || 1,
        disposition: pen.disposition || '-',
        productName: pen.productName || '-',
        newClassName: defect.newClassName || defect.className || 'N/A',
        code: defect.code || '',
      }
    })
  }, [currentPens, penDefects])

  // Parameter Details 表格列
  const parameterColumns = [
    { key: 'parameter', title: 'Parameter', width: '40%' },
    { key: 'value', title: 'Value', width: '60%' },
  ]

  // Comments 表格列
  const commentColumns = [
    { key: 'commentDate', title: 'Date', width: '25%', render: (v) => v ? new Date(v).toLocaleString() : '-' },
    { key: 'user', title: 'User', width: '20%' },
    { key: 'lotComment', title: 'Comment', width: '55%' },
  ]

  // Pen Details 表格列
  const penColumns = [
    { key: 'penId', title: 'PenId', width: '18%' },
    { key: 'inspectionDate', title: 'InspectionDate', width: '15%' },
    { key: 'numberOfPens', title: 'NumberOfPens', width: '10%' },
    { key: 'disposition', title: 'Disposition', width: '10%' },
    { key: 'productName', title: 'ProductName', width: '15%' },
    { key: 'newClassName', title: 'NewClassName', width: '12%' },
    { key: 'code', title: 'Code', width: '10%' },
    { 
      key: 'action', 
      title: 'Action', 
      width: '10%',
      render: (_, record) => (
        <button 
          className="edit-btn"
          style={{ display: currentLot?.materialStatus !== 'CLOSED' ? 'block' : 'none' }}
          onClick={(e) => {
            e.stopPropagation()
            handleEditPen(record.penId)
          }}
        >
          Edit
        </button>
      )
    },
  ]

  // 编辑 Pen
  const handleEditPen = async (penId) => {
    if (window.electronAPI?.openChildWindow) {
      // 打开 Defect Editor 窗口，父窗口保持不关闭
      await window.electronAPI.openChildWindow({
        id: `defect-editor-${lotId}-${penId}`,
        route: '/defect-editor',
        title: `Defect Editor - ${penId}`,
        width: 1375,
        height: 750,
        params: { lotId, penId }
      })
    }
  }

  // Check if the current lot is empty (has no pens)
  const isEmptyLot = useMemo(() => {
    if (!lotId) return false
    return !pens.some(p => p.lotId === lotId)
  }, [lotId, pens])

  // Delete Empty Lot - removes this lot from global store and triggers data sync (delete.json)
  const handleDeleteEmptyLot = useCallback(() => {
    if (!lotId || !isEmptyLot) return

    // Remove lot from store
    const newLots = lots.filter(l => l.lotId !== lotId)
    setLots(newLots)

    // Clean up related comments and defect counts
    const newLotComments = lotComments.filter(c => c.lotId !== lotId)
    setLotComments(newLotComments)
    const newLotDefectCounts = lotDefectCounts.filter(d => d.lotId !== lotId)
    setLotDefectCounts(newLotDefectCounts)

    // If this was the open lot, clear it
    if (openLot?.lotId === lotId) {
      setOpenLot(null)
    }

    // Notify parent window
    if (window.electronAPI?.notifyParent) {
      window.electronAPI.notifyParent('lots-updated', newLots)
    }

    console.log(`🗑️ Deleted empty lot: ${lotId}`)

    // Close this summary window after a short delay
    setTimeout(() => {
      window.close()
    }, 300)
  }, [lotId, isEmptyLot, lots, setLots, lotComments, setLotComments, lotDefectCounts, setLotDefectCounts, openLot, setOpenLot])

  // 关闭窗口
  const handleClose = () => {
    window.close()
  }

  return (
    <div className="lot-summary-page">
      <div className="summary-header">
        <h2>Summary - {lotId}</h2>
        <button className="close-btn" onClick={handleClose}>✕</button>
      </div>

      {/* Tab 切换 */}
      <div className="summary-tabs">
        <button 
          className={`tab-button ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          Parameter Details
        </button>
        <button 
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments ({currentComments.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'pens' ? 'active' : ''}`}
          onClick={() => setActiveTab('pens')}
        >
          Pen Details ({penDetails.length})
        </button>
      </div>

      {/* Tab 内容 */}
      <div className="tab-content">
        {/* Parameter Details */}
        {activeTab === 'parameters' && (
          <div className="summary-section">
            <div className="section-content parameter-table">
              <DataTable
                columns={parameterColumns}
                data={parameterDetails}
                rowKey="parameter"
                height="400px"
              />
            </div>
          </div>
        )}

        {/* Comments */}
        {activeTab === 'comments' && (
          <div className="summary-section">
            <div className="section-content">
              <DataTable
                columns={commentColumns}
                data={currentComments}
                rowKey="id"
                height="400px"
              />
            </div>
          </div>
        )}

        {/* Pen Details */}
        {activeTab === 'pens' && (
          <div className="summary-section pen-section">
            <div className="section-content">
              <DataTable
                columns={penColumns}
                data={penDetails}
                rowKey="id"
                selectedRowKeys={selectedPen ? [selectedPen] : []}
                onRowClick={(row) => setSelectedPen(row.id)}
                height="400px"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer with action buttons */}
      <div className="summary-footer" style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 10, 
        padding: '10px 16px',
        borderTop: '1px solid #e0e0e0',
      }}>
        {/* {isEmptyLot && (
          <button
            className="btn btn-danger"
            onClick={handleDeleteEmptyLot}
            style={{
              padding: '6px 16px',
              backgroundColor: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Delete Empty Lot
          </button>
        )} */}
        <button
          className="btn btn-secondary"
          onClick={handleClose}
          style={{
            padding: '6px 16px',
            border: '1px solid #ccc',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Close
        </button>
      </div>

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

export default FrmLotSummary
