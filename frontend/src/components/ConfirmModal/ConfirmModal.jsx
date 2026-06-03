import Modal from '../Modal'
import './ConfirmModal.css'

function ConfirmModal({
  open,
  onOk,
  onCancel,
  title = 'Confirm',
  content = 'Are you sure?',
  okText = 'OK',
  cancelText = 'Cancel',
}) {
  if (!open) return null

  return (
    <Modal open={open} onClose={onCancel} title={title} width={400} height="auto">
      <div className="confirm-modal-content">
        <p className="confirm-message">{content}</p>
        <div className="confirm-buttons">
          <button className="confirm-btn confirm-btn-ok" onClick={onOk}>
            {okText}
          </button>
          <button className="confirm-btn confirm-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal
