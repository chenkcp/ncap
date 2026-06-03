import { useEffect, useCallback } from 'react'
import './Drawer.css'

function Drawer({
  open,
  onClose,
  title,
  width = 600,
  children,
}) {
  // ESC 键关闭
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  const drawerWidth = typeof width === 'number' ? `${width}px` : width

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer-content"
        style={{ width: drawerWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="drawer-header">
            <h3 className="drawer-title">{title}</h3>
            <button className="drawer-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        )}
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Drawer
