import { useState, useMemo, useEffect, useCallback } from 'react'
import { useGlobalStore } from '../../store'
import { syncLotDefectCounts } from '../../utils/syncLotDefectCounts'
import { updateDefect, badPenAdd, toLocalIsoString } from '../../services/utils'
import DataTable from '../DataTable'
import RadioGroup from '../RadioGroup'
import Checkbox from '../Checkbox'
import Modal from '../Modal'
import AlertModal from '../AlertModal'
import './DefectEditor.css'

import { 
  ProductMonitor
} from '../../utils/lotUtils'

function DefectEditor({
  lotId = '',
  penId = '',
  pens = [],
  penDefects = [],
  levelOneDescriptions = [],
  levelTwoDescriptions = [],
  addBadPen = false,
  onOk,
  onCancel,
}) {
  const { setPenDefects, setLotDefectCounts, showToast, showLoading, hideLoading } = useGlobalStore()

  // 状态
  const [currentLotId, setCurrentLotId] = useState(lotId)
  const [currentPenId, setCurrentPenId] = useState(penId)
  const [disposition, setDisposition] = useState('Good')
  const [notShipped, setNotShipped] = useState(false)
  const [continuousLogging, setContinuousLogging] = useState(false)

  // 当前选中的第一层和第二层缺陷
  const [selectedLevelOne, setSelectedLevelOne] = useState({
    cosmetic: '',
    functional: '',
    risk: '',
  })
  const [selectedLevelTwo, setSelectedLevelTwo] = useState({
    cosmetic: '',
    functional: '',
    risk: '',
  })
  
  // 缺陷记录表格
  const [defectRecords, setDefectRecords] = useState([])
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  
  // Modal 状态
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [numericModalOpen, setNumericModalOpen] = useState(false)
  const [commentValue, setCommentValue] = useState('')
  const [numericValue, setNumericValue] = useState('')
  
  // 标记是否有修改
  const [hasChanges, setHasChanges] = useState(false)

  // Alert modal state
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  // 同步 lotId 和 penId props
  useEffect(() => {
    setCurrentLotId(lotId)
  }, [lotId])
  
  useEffect(() => {
    setCurrentPenId(penId)
  }, [penId])

  // 从 pens 获取 pen 信息
  const currentPen = useMemo(() => {
    return pens.find(p => p.penId === penId && p.lotId === lotId)
  }, [pens, penId, lotId])

  // checkAndSetPrimary - 检查并设置 primary defect
  // 优先级: Risk > Functional > Cosmetic
  // 同优先级下选 birthday 最小的
  const checkAndSetPrimary = useCallback((records) => {
    if (records.length === 0) return records
    
    // 按类型分组
    const riskRecords = records.filter(r => r.type === 'Risk')
    const functionalRecords = records.filter(r => r.type === 'Functional')
    const cosmeticRecords = records.filter(r => r.type === 'Cosmetic')
    
    // 选择优先级最高的组
    let targetGroup = []
    if (riskRecords.length > 0) {
      targetGroup = riskRecords
    } else if (functionalRecords.length > 0) {
      targetGroup = functionalRecords
    } else if (cosmeticRecords.length > 0) {
      targetGroup = cosmeticRecords
    }
    
    // 在目标组中找 birthday 最小的
    let primaryId = null
    if (targetGroup.length > 0) {
      // 按 birthday 排序，找最早的
      const sorted = [...targetGroup].sort((a, b) => {
        const dateA = a.birthday ? new Date(a.birthday) : new Date()
        const dateB = b.birthday ? new Date(b.birthday) : new Date()
        return dateA - dateB
      })
      primaryId = sorted[0].id
    }
    
    // 更新 primary 状态
    return records.map(r => ({
      ...r,
      primaryDefect: r.id === primaryId ? 1 : 0,
    }))
  }, [])

  // 从 penDefects 加载已有的缺陷记录
  useEffect(() => {
    if (lotId && penId) {
      const existingDefects = penDefects.filter(
        d => d.lotId === lotId && d.penId === penId
      )
      const records = existingDefects.map((d, idx) => ({
        id: d.id || `${idx + 1}`,
        primaryDefect: d.primaryDefect === 1 ? 1 : 0,
        type: d.className || '',
        defect: `(${d.code1})-${d.description1 || ''}`,
        subDefect: `(${d.code2})-${d.description2 || ''}`,
        defectComment: d.defectComment || '',
        numericComment: d.numericComment || '',
        code1: d.code1,
        code2: d.code2,
        className: d.className,
        description1: d.description1,
        description2: d.description2,
        birthday: d.birthday || new Date().toISOString(),
      }))
      setDefectRecords(records)
      
      // 设置 disposition
      if (currentPen?.disposition) {
        setDisposition(currentPen.disposition)
      }
      if (currentPen?.penNotShipped) {
        setNotShipped(true)
      }
    }
  }, [lotId, penId, penDefects, currentPen])

  // 过滤 Level One 列表（按 className）
  const cosmeticLevelOne = useMemo(() => {
    return levelOneDescriptions
      .filter(d => d.className === 'Cosmetic')
      .sort((a, b) => a.order1 - b.order1)
  }, [levelOneDescriptions])

  const functionalLevelOne = useMemo(() => {
    return levelOneDescriptions
      .filter(d => d.className === 'Functional')
      .sort((a, b) => a.order1 - b.order1)
  }, [levelOneDescriptions])

  const riskLevelOne = useMemo(() => {
    return levelOneDescriptions
      .filter(d => d.className === 'Risk')
      .sort((a, b) => a.order1 - b.order1)
  }, [levelOneDescriptions])

  // 过滤 Level Two 列表（根据选中的 Level One 的 code1）
  const cosmeticLevelTwo = useMemo(() => {
    if (!selectedLevelOne.cosmetic) return []
    return levelTwoDescriptions
      .filter(d => d.code1 === selectedLevelOne.cosmetic)
      .sort((a, b) => a.order2 - b.order2)
  }, [levelTwoDescriptions, selectedLevelOne.cosmetic])

  const functionalLevelTwo = useMemo(() => {
    if (!selectedLevelOne.functional) return []
    return levelTwoDescriptions
      .filter(d => d.code1 === selectedLevelOne.functional)
      .sort((a, b) => a.order2 - b.order2)
  }, [levelTwoDescriptions, selectedLevelOne.functional])

  const riskLevelTwo = useMemo(() => {
    if (!selectedLevelOne.risk) return []
    return levelTwoDescriptions
      .filter(d => d.code1 === selectedLevelOne.risk)
      .sort((a, b) => a.order2 - b.order2)
  }, [levelTwoDescriptions, selectedLevelOne.risk])

  // 处理 Level One 选择
  const handleLevelOneChange = (type, code1) => {
    setSelectedLevelOne(prev => ({
      ...prev,
      [type]: code1,
    }))
    // 清空对应的 Level Two 选择
    setSelectedLevelTwo(prev => ({
      ...prev,
      [type]: '',
    }))
  }

  // 处理 Level Two 选择（添加到缺陷记录）
  const handleLevelTwoChange = (type, code2) => {
    setSelectedLevelTwo(prev => ({
      ...prev,
      [type]: code2,
    }))
    
    // 找到对应的 Level One 和 Level Two 信息
    const levelOneList = type === 'cosmetic' ? cosmeticLevelOne : 
                         type === 'functional' ? functionalLevelOne : riskLevelOne
    const levelTwoList = type === 'cosmetic' ? cosmeticLevelTwo : 
                         type === 'functional' ? functionalLevelTwo : riskLevelTwo
    
    const levelOneItem = levelOneList.find(d => d.code1 === selectedLevelOne[type])
    const levelTwoItem = levelTwoList.find(d => d.code2 === code2)
    
    if (levelOneItem && levelTwoItem) {
      const newRecord = {
        id: String(Date.now()),
        primaryDefect: 0,
        type: type.charAt(0).toUpperCase() + type.slice(1),
        defect: `(${levelOneItem.code1})-${levelOneItem.description1}`,
        subDefect: `(${levelTwoItem.code2})-${levelTwoItem.description2}`,
        defectComment: '',
        numericComment: '',
        code1: levelOneItem.code1,
        code2: levelTwoItem.code2,
        className: levelOneItem.className,
        description1: levelOneItem.description1,
        description2: levelTwoItem.description2,
        birthday: new Date().toISOString(),
      }
      
      // 添加新记录并重新计算 primary
      setDefectRecords(prev => {
        const newRecords = [...prev, newRecord]
        return checkAndSetPrimary(newRecords)
      })
      setHasChanges(true)
      
      // 清空选择
      setSelectedLevelOne(prev => ({ ...prev, [type]: '' }))
      setSelectedLevelTwo(prev => ({ ...prev, [type]: '' }))
    }
  }

  // 表格列定义
  const columns = [
    { 
      key: 'primaryDefect', 
      title: 'Primary', 
      width: '8%',
      render: (value) => value === 1 ? '✓' : ''
    },
    { key: 'type', title: 'Type', width: '10%' },
    { key: 'defect', title: 'Defect', width: '18%' },
    { key: 'subDefect', title: 'SubDefect', width: '18%' },
    { key: 'defectComment', title: 'Comment', width: '14%' },
    { key: 'numericComment', title: 'Numeric', width: '10%' },
    {
      key: 'actions',
      title: 'Actions',
      width: '22%',
      render: (_value, record) => (
        <div className="defect-row-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-xs btn-primary" onClick={() => handleRowPrimary(record.id)}>Primary</button>
          <button className="btn btn-xs" onClick={() => handleRowComment(record.id)}>Comment</button>
          <button className="btn btn-xs" onClick={() => handleRowNumeric(record.id)}>Numeric</button>
          <button className="btn btn-xs btn-danger" onClick={() => handleRowDelete(record.id)}>Delete</button>
        </div>
      ),
    },
  ]

  // 行内操作按钮处理
  const handleRowPrimary = (id) => {
    setDefectRecords(prev => prev.map(r => ({
      ...r,
      primaryDefect: r.id === id ? 1 : 0,
    })))
    setHasChanges(true)
  }

  const handleRowDelete = (id) => {
    setDefectRecords(prev => {
      const newRecords = prev.filter(r => r.id !== id)
      return checkAndSetPrimary(newRecords)
    })
    if (selectedRecordId === id) setSelectedRecordId(null)
    setHasChanges(true)
  }

  const handleRowComment = (id) => {
    const record = defectRecords.find(r => r.id === id)
    if (record) {
      setSelectedRecordId(id)
      setCommentValue(record.defectComment || '')
      setCommentModalOpen(true)
    }
  }

  const handleRowNumeric = (id) => {
    const record = defectRecords.find(r => r.id === id)
    if (record) {
      setSelectedRecordId(id)
      setNumericValue(record.numericComment || '')
      setNumericModalOpen(true)
    }
  }

  // 保存修改到 store (通过 zustand persist)
  const saveToStore = useCallback(async () => {
    // Get the current pen to inherit line/source/birthday fields
    const currentLot = useGlobalStore.getState().lots.find(l => l.lotId === lotId)
    const clientInfo = useGlobalStore.getState().clientInfo
    const allContext = useGlobalStore.getState().context
    const _products = useGlobalStore.getState().products

    let _inspectionDate = currentPen?.inspectionDate || new Date().toISOString()
    // _inspectionDate 统一转换成 本地时间 YYYY-MM-DD HH:mm:ss 格式字符串
    _inspectionDate = toLocalIsoString(_inspectionDate)

    // 将当前 defectRecords 转换为 penDefects 格式
    const updatedPenDefects = defectRecords.map((r, idx) => ({
      lineType: currentLot?.lineType || clientInfo?.lineType || '',
      lineNumber: currentLot?.lineNumber || parseInt(clientInfo?.lineNumber) || 1,
      source: currentLot?.source || clientInfo?.source || '',
      lotId,
      birthday: currentLot?.birthday || '',
      penId,
      inspectionDate: _inspectionDate,
      defectNumber: idx + 1,
      id: r.id,
      primaryDefect: r.primaryDefect,
      className: r.className,
      code1: r.code1,
      code2: r.code2,
      description1: r.description1,
      description2: r.description2,
      defectComment: r.defectComment || '',
      numericComment: r.numericComment || '',
      cause1: '',
      cause2: '',
    }))

    const _product = _products.find(p => p.productNumber === allContext.partNumber)
    const productType = _product?.productType || null 

    const requestObject = {
      "newPenFlag": addBadPen,
      "lotId": lotId,
      "birthday": currentLot?.birthday || '',
      "penId": penId,
      "inspectionDate": _inspectionDate,
      "userName": allContext.operator,
      "shift": allContext.shift,
      "runType": allContext.runType,
      "productName": allContext.partName,
      "productNumber": allContext.partNumber,
      "productType": productType,
      "defectList": updatedPenDefects.map(p => {
        return {
          "className": p.className,
          "code1": p.code1,
          "code2": p.code2,
          "primaryDefect": p.primaryDefect,
          "defectComment": p.defectComment,
          "numericComment": p.numericComment
        }
      })
    }

    try {
      showLoading('Requesting ...')
      const resp = await updateDefect(requestObject)
      console.log("resp -----------------", resp)
      hideLoading()
      if (resp._resp === "success"){
        
        showToast(resp._message, 'success')

        // 获取其他 pen 的缺陷（不是当前 pen 的）
        const otherDefects = penDefects.filter(
          d => !(d.lotId === lotId && d.penId === penId)
        )
        // 合并并更新到 store
        const allDefects = [...otherDefects, ...updatedPenDefects]
        setPenDefects(allDefects)

        // 获取 lot defect counts
        const { lotDefectCounts } = useGlobalStore.getState()
        const needToUpdateLotDefectCounts = resp.lotDefectCounts
        // 获取其他 lot 的缺陷（不是当前 lot 的）
        const otherLotDefects = lotDefectCounts.filter(
          d => !(d.lotId === lotId)
        )
        // 合并并更新到 store
        const allLotDefects = [...otherLotDefects, ...needToUpdateLotDefectCounts]
        setLotDefectCounts(allLotDefects)

        // Run ProductMonitor
        const monitorResult = await ProductMonitor('PenUpdated', penId)
        if (!monitorResult.success) {
          showToast( monitorResult.message || 'Failed to run ProductMonitor.', 'error')
        }

        // 同步到localstorage 让父窗口读取
        const raw = localStorage.getItem('next-cap-storage')

        if (raw) {
          const parsed = JSON.parse(raw)
          parsed["state"]["lotDefectCounts"] = allLotDefects

          console.log("allLotDefects", allLotDefects, parsed)
          localStorage.setItem('next-cap-storage', JSON.stringify(parsed))
        }

        console.log('✅ 缺陷数据已保存到 store:', allDefects.length)
        return true
      } else {
        showToast(resp._message, 'error')

        return false
      }

    } catch (err) {
      hideLoading()
      console.error("Error adding bad pen:", err)
      showToast( err.message || 'Failed to add the bad pen.', 'error')
      return false
    }

  }, [defectRecords, lotId, penId, penDefects, setPenDefects])

  const handleOk = async () => {
    // If there are defect records, must have a primary defect
    if (defectRecords.length > 0) {
      const hasPrimary = defectRecords.some(r => r.primaryDefect === 1)
      if (!hasPrimary) {
        setAlertMessage('Please set a Primary defect.')
        setAlertOpen(true)
        return
      }
    }

    // Always save to store
    // Note: saveToStore already sets lotDefectCounts from the API response.
    // Do NOT call syncLotDefectCounts here — it recalculates from local penDefects
    // using primaryDefect === -1, but DefectEditor records use 1, causing every
    // pen to be counted as Good and overwriting the correct API data in the store/localStorage.
    const result = await saveToStore()
    if (result) {
      // onOk?.(defectRecords)
    }
  }

  const handleCancel = () => {
    onCancel?.()
  }

  // 保存评论
  const handleSaveComment = () => {
    setDefectRecords(prev => prev.map(r => 
      r.id === selectedRecordId 
        ? { ...r, defectComment: commentValue }
        : r
    ))
    setCommentModalOpen(false)
    setHasChanges(true)
  }

  // 保存数字
  const handleSaveNumeric = () => {
    setDefectRecords(prev => prev.map(r => 
      r.id === selectedRecordId 
        ? { ...r, numericComment: numericValue }
        : r
    ))
    setNumericModalOpen(false)
    setHasChanges(true)
  }

  return (
    <div className="defect-editor">
      {/* 顶部信息栏 */}
      <div className="defect-editor-header">
        <div className="header-field">
          <label>Lot ID</label>
          <input 
            type="text" 
            className="input" 
            value={currentLotId}
            readOnly
          />
        </div>
        <div className="header-field">
          <label>Pen ID</label>
          <input 
            type="text" 
            className="input" 
            value={currentPenId}
            readOnly
          />
        </div>
        {/* <div className="header-field disposition-field">
          <label>Pen Disposition</label>
          <RadioGroup
            name="disposition"
            value={disposition}
            onChange={setDisposition}
            options={[
              { value: 'Good', label: 'Good' },
              { value: 'Reclaim', label: 'Reclaim' },
              { value: 'Scrap', label: 'Scrap' },
            ]}
          />
        </div> */}
      </div>

      {/* Not Shipped 复选框 */}
      {/* <div className="defect-editor-checkbox">
        <Checkbox
          checked={notShipped}
          onChange={setNotShipped}
          label="Not Shipped"
        />
      </div> */}

      {/* 三列选择区域 - 使用 Select 控件 */}
      <div className="defect-editor-selects">
        {/* Cosmetic */}
        <div className="defect-select-column">
          <div className="select-title">Cosmetic ({cosmeticLevelOne.length})</div>
          <select 
            className="defect-select"
            value={selectedLevelOne.cosmetic}
            onChange={(e) => handleLevelOneChange('cosmetic', e.target.value)}
          >
            <option value="">-- Select Level 1 --</option>
            {cosmeticLevelOne.map(d => (
              <option key={d.code1} value={d.code1}>
                ({d.code1})-{d.description1}
              </option>
            ))}
          </select>
          <select 
            className="defect-select"
            value={selectedLevelTwo.cosmetic}
            onChange={(e) => handleLevelTwoChange('cosmetic', e.target.value)}
            disabled={!selectedLevelOne.cosmetic}
          >
            <option value="">-- Select Level 2 --</option>
            {cosmeticLevelTwo.map(d => (
              <option key={d.code2} value={d.code2}>
                ({d.code2})-{d.description2}
              </option>
            ))}
          </select>
        </div>

        {/* Functional */}
        <div className="defect-select-column">
          <div className="select-title">Functional ({functionalLevelOne.length})</div>
          <select 
            className="defect-select"
            value={selectedLevelOne.functional}
            onChange={(e) => handleLevelOneChange('functional', e.target.value)}
          >
            <option value="">-- Select Level 1 --</option>
            {functionalLevelOne.map(d => (
              <option key={d.code1} value={d.code1}>
                ({d.code1})-{d.description1}
              </option>
            ))}
          </select>
          <select 
            className="defect-select"
            value={selectedLevelTwo.functional}
            onChange={(e) => handleLevelTwoChange('functional', e.target.value)}
            disabled={!selectedLevelOne.functional}
          >
            <option value="">-- Select Level 2 --</option>
            {functionalLevelTwo.map(d => (
              <option key={d.code2} value={d.code2}>
                ({d.code2})-{d.description2}
              </option>
            ))}
          </select>
        </div>

        {/* Risk */}
        <div className="defect-select-column">
          <div className="select-title">Risk ({riskLevelOne.length})</div>
          <select 
            className="defect-select"
            value={selectedLevelOne.risk}
            onChange={(e) => handleLevelOneChange('risk', e.target.value)}
          >
            <option value="">-- Select Level 1 --</option>
            {riskLevelOne.map(d => (
              <option key={d.code1} value={d.code1}>
                ({d.code1})-{d.description1}
              </option>
            ))}
          </select>
          <select 
            className="defect-select"
            value={selectedLevelTwo.risk}
            onChange={(e) => handleLevelTwoChange('risk', e.target.value)}
            disabled={!selectedLevelOne.risk}
          >
            <option value="">-- Select Level 2 --</option>
            {riskLevelTwo.map(d => (
              <option key={d.code2} value={d.code2}>
                ({d.code2})-{d.description2}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enable Continuous Logging */}
      {/* <div className="defect-editor-checkbox">
        <Checkbox
          checked={continuousLogging}
          onChange={setContinuousLogging}
          label="Enable Continuous Logging"
        />
      </div> */}

      {/* 数据表格 */}
      <div className="defect-editor-table">
        <DataTable
          columns={columns}
          data={defectRecords}
          rowKey="id"
          selectedRowKeys={selectedRecordId ? [selectedRecordId] : []}
          onRowClick={(row) => setSelectedRecordId(row.id)}
          height={200}
        />
      </div>

      {/* 底部按钮 - OK / Cancel */}
      <div className="defect-editor-footer">
        <button className="btn" onClick={handleOk}>OK</button>
        <button className="btn" onClick={handleCancel}>Cancel</button>
      </div>

      {/* Comment Modal */}
      <Modal
        open={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title="Add Comment"
        width={400}
      >
        <div className="modal-form">
          <textarea
            className="comment-textarea"
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)}
            placeholder="Enter comment..."
            rows={4}
          />
          <div className="modal-buttons">
            <button className="btn" onClick={handleSaveComment}>OK</button>
            <button className="btn" onClick={() => setCommentModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Numeric Modal */}
      <Modal
        open={numericModalOpen}
        onClose={() => setNumericModalOpen(false)}
        title="Numeric Input"
        width={300}
      >
        <div className="modal-form">
          <input
            type="number"
            className="numeric-input"
            value={numericValue}
            onChange={(e) => setNumericValue(e.target.value)}
            placeholder="Enter number..."
          />
          <div className="modal-buttons">
            <button className="btn" onClick={handleSaveNumeric}>OK</button>
            <button className="btn" onClick={() => setNumericModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Alert Modal */}
      <AlertModal
        open={alertOpen}
        title="Alert"
        content={alertMessage}
        onOk={() => setAlertOpen(false)}
      />
    </div>
  )
}

export default DefectEditor
