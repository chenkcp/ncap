import { useState, useEffect } from 'react'
import Modal from '../Modal'
import ConfirmModal from '../ConfirmModal'
import { useGlobalStore } from '../../store'
import { writeINIFile } from '../../utils/iniUtils'
import './PenFormatModal.css'

function PenFormatModal({ open, onClose }) {
  const { INIConfig, setINIConfig } = useGlobalStore()
  const [maxLen, setMaxLen] = useState('11')
  const [minLen, setMinLen] = useState('9')
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Load current values from INIConfig
  useEffect(() => {
    if (open && INIConfig?.PenId) {
      setMaxLen(String(INIConfig.PenId.maxLen || '11'))
      setMinLen(String(INIConfig.PenId.minLen || '9'))
    }
  }, [open, INIConfig])

  const handleSave = () => {
    // Validate
    const max = parseInt(maxLen)
    const min = parseInt(minLen)
    if (isNaN(max) || isNaN(min)) {
      alert('Please enter valid numbers')
      return
    }
    if (min > max) {
      alert('Min length cannot be greater than max length')
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmSave = async () => {
    // Update INIConfig
    const newConfig = {
      ...INIConfig,
      PenId: {
        ...INIConfig?.PenId,
        maxLen: parseInt(maxLen),
        minLen: parseInt(minLen)
      }
    }
    setINIConfig(newConfig)

    // Save to INI file
    await writeINIFile('config.ini', newConfig)

    setConfirmOpen(false)
    onClose()
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Pen Format Setting" width={400} height="auto">
        <div className="pen-format-content">
          <div className="format-description">
            Configure Pen ID length restrictions:
          </div>
          
          <div className="form-group">
            <label>Max Length</label>
            <input
              type="number"
              value={maxLen}
              onChange={(e) => setMaxLen(e.target.value)}
              min="1"
              max="50"
            />
          </div>

          <div className="form-group">
            <label>Min Length</label>
            <input
              type="number"
              value={minLen}
              onChange={(e) => setMinLen(e.target.value)}
              min="1"
              max="50"
            />
          </div>

          <div className="format-buttons">
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        title="Confirm Save"
        content={`Are you sure you want to update Pen Format settings?\nMax Length: ${maxLen}\nMin Length: ${minLen}`}
        onOk={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

export default PenFormatModal
