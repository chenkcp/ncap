import { useState, useEffect } from 'react'
import Modal from '../Modal'
import './CreateLotModal.css'

function CreateLotModal({ open, onClose, onConfirm, suggestedLotId }) {
  const [lotId, setLotId] = useState('')

  useEffect(() => {
    if (open && suggestedLotId) {
      setLotId(suggestedLotId)
    }
  }, [open, suggestedLotId])

  const handleConfirm = () => {
    if (!lotId.trim()) {
      alert('Please enter a Lot ID')
      return
    }
    onConfirm(lotId.trim())
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Lot" width={450} height="auto">
      <div className="create-lot-content">
        <div className="form-description">
          Enter the Lot ID for the new lot:
        </div>
        
        <div className="form-group">
          <label>Lot ID</label>
          <input
            type="text"
            value={lotId}
            onChange={(e) => setLotId(e.target.value)}
            placeholder="Enter Lot ID"
            autoFocus
          />
        </div>

        <div className="form-buttons">
          <button className="btn btn-primary" onClick={handleConfirm}>Create</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export default CreateLotModal
