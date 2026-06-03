import { useState, useMemo, useEffect } from 'react'
import { useGlobalStore } from '../../store'
import DataTable from '../DataTable'
import RadioGroup from '../RadioGroup'
import Checkbox from '../Checkbox'
import './DefectEditor.css'

function DefectEditor({
  lotId = '',
  penId = '',
  pens = [],
  penDefects = [],
  levelOneDescriptions = [],
  levelTwoDescriptions = [],
  onOk,
  onCancel,
}) {
  const { clientInfo } = useGlobalStore()
  
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

  // 调试输出
  useEffect(() => {
    console.log('DefectEditor 组件数据:', {
      lotId,
      penId,
      currentLotId,
      currentPenId,
      currentPen,
      clientInfo,
      levelOneCount: levelOneDescriptions.length,
      levelTwoCount: levelTwoDescriptions.length,
    })
    // 输出 levelOneDescriptions 用于调试
    if (levelOneDescriptions.length > 0) {
      console.log('LevelOne 总数:', levelOneDescriptions.length)
      console.log('LevelOne 第一条数据:', levelOneDescriptions[0])
      console.log('过滤条件:', {
        lineType: clientInfo.lineType,
        lineNumber: clientInfo.lineNumber,
        source: clientInfo.source,
      })
      // 检查有哪些 itemType 值
      const itemTypes = [...new Set(levelOneDescriptions.map(d => d.itemType))]
      console.log('所有 itemType 值:', itemTypes)
      
      // 检查有哪些 lineType 值
      const lineTypes = [...new Set(levelOneDescriptions.map(d => d.lineType))]
      console.log('数据中的 lineType 值:', lineTypes)
      
      // 检查有哪些 source 值
      const sources = [...new Set(levelOneDescriptions.map(d => d.source))]
      console.log('数据中的 source 值:', sources)
    }
  }, [lotId, penId, currentLotId, currentPenId, currentPen, clientInfo, levelOneDescriptions, levelTwoDescriptions])

  // 从 penDefects 加载已有的缺陷记录
  useEffect(() => {
    if (lotId && penId) {
      const existingDefects = penDefects.filter(
        d => d.lotId === lotId && d.penId === penId
      )
      const records = existingDefects.map((d, idx) => ({
        id: `${idx + 1}`,
        primary: d.primaryDefect === -1 ? 'No' : 'Yes',
        type: d.className || '',
        defect: `(${d.code1})-${d.description1 || ''}`,
        subDefect: `(${d.code2})-${d.description2 || ''}`,
        comment: d.comment || '',
        numeric: d.numericValue || '',
        code1: d.code1,
        code2: d.code2,
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

  console.log("---------------",clientInfo,levelOneDescriptions)

  // 过滤 Level One 列表（按 lineType, lineNumber, source, itemType）
  const cosmeticLevelOne = useMemo(() => {
    const result = levelOneDescriptions
      .filter(d => d.className === 'Cosmetic')
      .sort((a, b) => a.order1 - b.order1)
    console.log('Cosmetic Level One 过滤结果:', result.length)
    return result
  }, [levelOneDescriptions, clientInfo])

  const functionalLevelOne = useMemo(() => {
    const result = levelOneDescriptions
      .filter(d => d.className === 'Functional')
      .sort((a, b) => a.order1 - b.order1)
    console.log('Functional Level One 过滤结果:', result.length)
    return result
  }, [levelOneDescriptions, clientInfo])

  const riskLevelOne = useMemo(() => {
    const result = levelOneDescriptions
      .filter(d => d.className === 'Risk')
      .sort((a, b) => a.order1 - b.order1)
    console.log('Risk Level One 过滤结果:', result.length)
    return result
  }, [levelOneDescriptions, clientInfo])

  // 过滤 Level Two 列表（根据选中的 Level One 的 code1）
  const cosmeticLevelTwo = useMemo(() => {
    if (!selectedLevelOne.cosmetic) return []
    return levelTwoDescriptions
      .filter(d => d.code1 === selectedLevelOne.cosmetic)
      .sort((a, b) => a.order2 - b.order2)
  }, [levelTwoDescriptions, selectedLevelOne.cosmetic, clientInfo])

  const functionalLevelTwo = useMemo(() => {
    if (!selectedLevelOne.functional) return []
    return levelTwoDescriptions
      .filter(d => d.code1 === selectedLevelOne.functional)
      .sort((a, b) => a.order2 - b.order2)
  }, [levelTwoDescriptions, selectedLevelOne.functional, clientInfo])

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
        primary: '',
        type: type.charAt(0).toUpperCase() + type.slice(1),
        defect: `(${levelOneItem.code1})-${levelOneItem.description1}`,
        subDefect: `(${levelTwoItem.code2})-${levelTwoItem.description2}`,
        comment: '',
        numeric: '',
        code1: levelOneItem.code1,
        code2: levelTwoItem.code2,
      }
      setDefectRecords(prev => [...prev, newRecord])
      
      // 清空选择
      setSelectedLevelOne(prev => ({ ...prev, [type]: '' }))
      setSelectedLevelTwo(prev => ({ ...prev, [type]: '' }))
    }
  }

  // 表格列定义
  const columns = [
    { key: 'primary', title: 'Primary', width: '10%' },
    { key: 'type', title: 'Type', width: '12%' },
    { key: 'defect', title: 'Defect', width: '25%' },
    { key: 'subDefect', title: 'SubDefect', width: '25%' },
    { key: 'comment', title: 'Comment', width: '15%' },
    { key: 'numeric', title: 'Numeric', width: '13%' },
  ]

  const handleOk = () => {
    onOk?.(defectRecords)
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handlePrimary = () => {
    if (!selectedRecordId) return
    setDefectRecords(prev => prev.map(r => ({
      ...r,
      primary: r.id === selectedRecordId ? 'Yes' : ''
    })))
  }

  const handleDelete = () => {
    if (!selectedRecordId) return
    setDefectRecords(prev => prev.filter(r => r.id !== selectedRecordId))
    setSelectedRecordId(null)
  }

  const handleComment = () => {
    // 添加评论
    console.log('Add Comment')
  }

  const handleNumericInput = () => {
    // 数值输入
    console.log('Numeric Input')
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
        <div className="header-field disposition-field">
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
        </div>
      </div>

      {/* Not Shipped 复选框 */}
      <div className="defect-editor-checkbox">
        <Checkbox
          checked={notShipped}
          onChange={setNotShipped}
          label="Not Shipped"
        />
      </div>

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

      {/* 操作按钮行 */}
      <div className="defect-editor-actions">
        <button className="btn" onClick={handleOk}>OK</button>
        <button className="btn" onClick={handleCancel}>Cancel</button>
        <button className="btn">Help</button>
      </div>

      {/* Enable Continuous Logging */}
      <div className="defect-editor-checkbox">
        <Checkbox
          checked={continuousLogging}
          onChange={setContinuousLogging}
          label="Enable Continuous Logging"
        />
      </div>

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

      {/* 底部按钮 */}
      <div className="defect-editor-footer">
        <button className="btn" onClick={handlePrimary}>Primary</button>
        <button className="btn" onClick={handleDelete}>Delete</button>
        <button className="btn" onClick={handleComment}>Comment</button>
        <button className="btn" onClick={handleNumericInput}>Numeric Input</button>
      </div>
    </div>
  )
}

export default DefectEditor
