import { useState } from 'react'
import './DataTable.css'

function DataTable({
  columns,
  data,
  rowKey = 'id',
  selectedRowKeys = [],
  onRowSelect,
  onRowClick,
  height = 200,
}) {
  const getRowKey = (record, index) => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return record[rowKey] || String(index)
  }

  const handleRowClick = (record, index) => {
    const key = getRowKey(record, index)
    const newSelected = selectedRowKeys.includes(key)
      ? selectedRowKeys.filter(k => k !== key)
      : [key] // 单选模式
    
    const selectedRows = data.filter((row, idx) => 
      newSelected.includes(getRowKey(row, idx))
    )
    onRowSelect?.(newSelected, selectedRows)
    onRowClick?.(record, index)
  }

  return (
    <div className="data-table-wrapper" style={{ height }}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => {
            const key = getRowKey(record, index)
            const isSelected = selectedRowKeys.includes(key)
            return (
              <tr
                key={key}
                className={isSelected ? 'selected' : ''}
                onClick={() => handleRowClick(record, index)}
              >
                {columns.map(col => (
                  <td 
                    key={col.key}
                    style={{ width: col.width }}
                  >
                    {col.render 
                      ? col.render(record[col.key], record, index)
                      : String(record[col.key] ?? '')
                    }
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
