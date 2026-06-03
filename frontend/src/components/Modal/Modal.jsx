import { useEffect, useCallback } from 'react'
import './Modal.css'

function Modal({
  open,
  onClose,
  title,
  width = 900,
  height = 'auto',
  className = '',
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

  const modalWidth = typeof width === 'number' ? `${width}px` : width
  const modalHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <div className={`modal-overlay ${className}`} onClick={onClose}>
      <div 
        className="modal-content"
        style={{ width: modalWidth, height: modalHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
