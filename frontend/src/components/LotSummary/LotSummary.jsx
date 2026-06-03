import { useState } from 'react'
import DataTable from '../DataTable'
import './LotSummary.css'

function LotSummary({ lotId, onEditPen, onDeletePen, onClose }) {
  // 参数详情数据
  const parameterDetails = [
    { parameter: 'LotId', value: lotId || '2105JC0751' },
    { parameter: 'Birthday', value: '1/5/2022 8:59:40 PM' },
    { parameter: 'Shift', value: 'B' },
    { parameter: 'RunType', value: 'Production' },
    { parameter: 'ProductName', value: 'HESTIA (WET)' },
    { parameter: 'ProductNumber', value: '3YP17-60002' },
    { parameter: 'ExperimentId', value: '' },
    { parameter: 'ProductType', value: 'HESTIA' },
    { parameter: 'ThinFilmLotId', value: '' },
  ]

  // 评论数据
  const comments = [
    { id: '1', date: '1/5/2022 8:59:40 PM', user: 'SYSTEM', comment: 'Quality state change: [] --> [Yellow]' },
    { id: '2', date: '1/6/2022 3:00:35 AM', user: 'SYSTEM', comment: 'Quality state change: [Yellow] --> [Green]' },
  ]

  // Pen详情数据
  const [penDetails] = useState([
    { id: '1', penId: '6094551118747...', inspectionDate: '1/5/2022 9:01 PM', numberOfPens: 1, disposition: 'G', productName: 'HESTIA (WET)', newClassName: 'Functional', code: 'FSF' },
    { id: '2', penId: '6094551118747...', inspectionDate: '1/5/2022 9:01 PM', numberOfPens: 1, disposition: 'G', productName: 'HESTIA (WET)', newClassName: 'Functional', code: 'FDI' },
    { id: '3', penId: '6094551118747...', inspectionDate: '1/5/2022 9:01 PM', numberOfPens: 1, disposition: 'G', productName: 'HESTIA (WET)', newClassName: 'Cosmetic', code: 'CM' },
    { id: '4', penId: '6094551118748...', inspectionDate: '1/5/2022 9:01 PM', numberOfPens: 1, disposition: 'G', productName: 'HESTIA (WET)', newClassName: 'N/A', code: '' },
    { id: '5', penId: '6094551118747...', inspectionDate: '1/5/2022 9:01 PM', numberOfPens: 1, disposition: 'G', productName: 'HESTIA (WET)', newClassName: 'N/A', code: '' },
    { id: '6', penId: '6094551118747...', inspectionDate: '1/5/2022 9:01 PM', numberOfPens: 1, disposition: 'G', productName: 'HESTIA (WET)', newClassName: 'N/A', code: '' },
    { id: '7', penId: '6094551118747...', inspectionDate: '1/5/2022 9:01 PM', numberOfPens: 1, disposition: 'G', productName: 'HESTIA (WET)', newClassName: 'N/A', code: '' },
    { id: '8', penId: '6094551118747...', inspectionDate: '1/5/2022 9:01 PM', numberOfPens: 1, disposition: 'G', productName: 'HESTIA (WET)', newClassName: 'N/A', code: '' },
  ])

  const [selectedPen, setSelectedPen] = useState(null)

  // Parameter Details 表格列
  const parameterColumns = [
    { key: 'parameter', title: 'Parameter', width: '40%' },
    { key: 'value', title: 'Value', width: '60%' },
  ]

  // Comments 表格列
  const commentColumns = [
    { key: 'date', title: 'Date', width: '25%' },
    { key: 'user', title: 'User', width: '20%' },
    { key: 'comment', title: 'Comment', width: '55%' },
  ]

  // Pen Details 表格列
  const penColumns = [
    { key: 'penId', title: 'PenId', width: '15%' },
    { key: 'inspectionDate', title: 'InspectionDate', width: '15%' },
    { key: 'numberOfPens', title: 'NumberOfPens', width: '10%' },
    { key: 'disposition', title: 'Disposition', width: '10%' },
    { key: 'productName', title: 'ProductName', width: '15%' },
    { key: 'newClassName', title: 'NewClassName', width: '12%' },
    { key: 'code', title: 'Code', width: '8%' },
    {
      key: 'id',
      title: 'Actions',
      width: '15%',
      render: (_value, row) => (
        <div className="action-buttons">
          <button 
            className="action-icon edit-icon" 
            onClick={(e) => {
              e.stopPropagation()
              onEditPen?.(row)
            }}
            title="Edit"
          >
            ✏️
          </button>
          <button 
            className="action-icon delete-icon" 
            onClick={(e) => {
              e.stopPropagation()
              onDeletePen?.(row)
            }}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="lot-summary">
      <div className="summary-header">
        <h2>Summary</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      {/* Parameter Details */}
      <div className="summary-section">
        <div className="section-title">Parameter Details</div>
        <div className="section-content parameter-table">
          <DataTable
            columns={parameterColumns}
            data={parameterDetails}
            rowKey="parameter"
            height="200px"
          />
        </div>
      </div>

      {/* Comments */}
      <div className="summary-section">
        <div className="section-title">Comments</div>
        <div className="section-content">
          <DataTable
            columns={commentColumns}
            data={comments}
            rowKey="id"
            height="120px"
          />
        </div>
      </div>

      {/* Pen Details */}
      <div className="summary-section pen-section">
        <div className="section-title">Pen Details</div>
        <div className="section-content">
          <DataTable
            columns={penColumns}
            data={penDetails}
            rowKey="id"
            selectedRowKeys={selectedPen ? [selectedPen] : []}
            onRowClick={(row) => setSelectedPen(row.id)}
            height="250px"
          />
        </div>
      </div>
    </div>
  )
}

export default LotSummary
