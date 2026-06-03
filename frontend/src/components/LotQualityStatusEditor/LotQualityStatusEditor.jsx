import { useState } from 'react'
import './LotQualityStatusEditor.css'

const statusOptions = ['Blue', 'dw', 'Green', 'Red', 'Yellow']

function LotQualityStatusEditor({
  lotId,
  currentStatus = 'Green',
  onOk,
  onCancel,
  onDelete,
  onEdit,
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [pensShipped, setPensShipped] = useState('0')
  const [pensInLot, setPensInLot] = useState('0')
  const [is100Inspection, setIs100Inspection] = useState(false)
  const [checkbox1, setCheckbox1] = useState(false)
  const [commonEvent, setCommonEvent] = useState('')
  const [comments, setComments] = useState('')

  // 历史记录
  const historyData = [
    { date: '2022-01-05 09:04:22 PM', user: 'SYSTEM', comment: 'Quality state change: []...' },
    { date: '2022-01-06 06:27:25 AM', user: 'SYSTEM', comment: 'Quality state change: [...]' },
  ]

  // 状态对应的颜色
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'green': return '#4CAF50'
      case 'yellow': return '#FFC107'
      case 'red': return '#f44336'
      case 'blue': return '#2196F3'
      default: return '#999'
    }
  }

  const handleOk = () => {
    onOk?.(selectedStatus)
  }

  return (
    <div className="lot-quality-editor">
      {/* 标题栏 */}
      <div className="editor-title-bar">
        <span className="lot-id-display">{lotId}</span>
      </div>

      {/* 主内容区 */}
      <div className="editor-content">
        {/* 左侧：状态选择 */}
        <div className="status-section">
          <div className="section-label">Lot Quality Status</div>
          <div className="status-list">
            {statusOptions.map((status) => (
              <div
                key={status}
                className={`status-option ${selectedStatus === status ? 'selected' : ''}`}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </div>
            ))}
          </div>
        </div>

        {/* 中间：状态图标 */}
        <div className="status-icon-section">
          <div className="section-label">Green</div>
          <div 
            className="status-icon-large"
            style={{ backgroundColor: getStatusColor(selectedStatus) }}
          >
            <span className="checkmark">✓</span>
          </div>
        </div>

        {/* 右侧：Shipment Data */}
        <div className="shipment-section">
          <div className="section-label">Shipment Data</div>
          <div className="form-row">
            <label>Pens Shipped</label>
            <input
              type="text"
              value={pensShipped}
              onChange={(e) => setPensShipped(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Pens In Lot</label>
            <input
              type="text"
              value={pensInLot}
              onChange={(e) => setPensInLot(e.target.value)}
            />
          </div>
          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={is100Inspection}
                onChange={(e) => setIs100Inspection(e.target.checked)}
              />
              100% Inspection
            </label>
            <label>
              <input
                type="checkbox"
                checked={checkbox1}
                onChange={(e) => setCheckbox1(e.target.checked)}
              />
              CheckBox1
            </label>
          </div>
        </div>
      </div>

      {/* 历史记录表格 */}
      <div className="history-section">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.user}</td>
                <td>{item.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Common Events */}
      <div className="common-events-section">
        <div className="section-label">Common Events</div>
        <select
          value={commonEvent}
          onChange={(e) => setCommonEvent(e.target.value)}
          className="common-events-select"
        >
          <option value="">Select...</option>
          <option value="event1">Event 1</option>
          <option value="event2">Event 2</option>
        </select>
      </div>

      {/* Comments */}
      <div className="comments-section">
        <div className="section-label">Comments</div>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter comments..."
          rows={3}
        />
      </div>

      {/* 底部按钮 */}
      <div className="editor-buttons">
        <button className="btn btn-primary" onClick={handleOk}>OK</button>
        <button className="btn btn-danger" onClick={onDelete}>Delete</button>
        <button className="btn btn-default" onClick={onEdit}>Edit</button>
        <button className="btn btn-default" onClick={onCancel}>Abort</button>
      </div>
    </div>
  )
}

export default LotQualityStatusEditor
