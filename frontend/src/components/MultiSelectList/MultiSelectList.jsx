import { useState } from 'react'
import './MultiSelectList.css'

function MultiSelectList({
  title,
  items,
  selectedItems = [],
  onChange,
  onSelect,
  height = 150,
}) {
  const [selected, setSelected] = useState(selectedItems)

  const handleItemClick = (id, e) => {
    let newSelected
    const clickedItem = items.find(item => item.id === id)
    
    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + 点击：多选
      if (selected.includes(id)) {
        newSelected = selected.filter(item => item !== id)
      } else {
        newSelected = [...selected, id]
      }
    } else if (e.shiftKey && selected.length > 0) {
      // Shift + 点击：范围选择
      const lastSelected = selected[selected.length - 1]
      const lastIndex = items.findIndex(item => item.id === lastSelected)
      const currentIndex = items.findIndex(item => item.id === id)
      const start = Math.min(lastIndex, currentIndex)
      const end = Math.max(lastIndex, currentIndex)
      const rangeIds = items.slice(start, end + 1).map(item => item.id)
      newSelected = [...new Set([...selected, ...rangeIds])]
    } else {
      // 普通点击：单选
      newSelected = [id]
      // 触发 onSelect 回调（用于 DefectEditor 的层级选择）
      if (onSelect && clickedItem) {
        onSelect(clickedItem)
      }
    }
    
    setSelected(newSelected)
    onChange?.(newSelected)
  }

  return (
    <div className="multi-select-list">
      {title && <div className="multi-select-list-title">{title}</div>}
      <div className="multi-select-list-container" style={{ height }}>
        {items.map(item => (
          <div
            key={item.id}
            className={`multi-select-list-item ${selected.includes(item.id) ? 'selected' : ''}`}
            onClick={(e) => handleItemClick(item.id, e)}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div className="multi-select-list-display" style={{ height: 60 }}>
        {selected.map(id => items.find(item => item.id === id)?.label).join(', ')}
      </div>
    </div>
  )
}

export default MultiSelectList
