import Modal from '../Modal'
import './AlertModal.css'

function AlertModal({
  open,
  onOk,
  title = 'Alert',
  content = '',
  okText = 'OK',
}) {
  if (!open) return null

  return (
    <Modal open={open} onClose={onOk} title={title} width={400} height="auto" className="alert-modal-overlay">
      <div className="alert-modal-content">
        <p className="alert-message">{content}</p>
        <div className="alert-buttons">
          <button className="alert-btn alert-btn-ok" onClick={onOk}>
            {okText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default AlertModal
