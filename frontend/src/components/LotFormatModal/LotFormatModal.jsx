import { useState, useEffect } from 'react'
import Modal from '../Modal'
import ConfirmModal from '../ConfirmModal'
import { useGlobalStore } from '../../store'
import { writeINIFile } from '../../utils/iniUtils'
import './LotFormatModal.css'

function LotFormatModal({ open, onClose }) {
  const { INIConfig, setINIConfig } = useGlobalStore()
  const [selectedFormat, setSelectedFormat] = useState('Option1')
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Load current format from INIConfig
  useEffect(() => {
    if (open && INIConfig?.LotId?.Format) {
      setSelectedFormat(INIConfig.LotId.Format)
    }
  }, [open, INIConfig])

  const option1 = INIConfig?.LotId?.Option1 || 'YMDD[2chars product_code][2 digit running#][2 digit line_number][RunType]'
  const option2 = INIConfig?.LotId?.Option2 || '[2chars product_code]YYMMDD[2 digit running#][2 digit line_number][RunType]'

  const handleSave = () => {
    setConfirmOpen(true)
  }

  const handleConfirmSave = async () => {
    // Update INIConfig
    const newConfig = {
      ...INIConfig,
      LotId: {
        ...INIConfig?.LotId,
        Format: selectedFormat
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
      <Modal open={open} onClose={onClose} title="Lot Format Setting" width={500} height="auto">
        <div className="lot-format-content">
          <div className="format-description">
            Select the Lot ID format to use:
          </div>
          
          <div className="format-options">
            <label className="format-option">
              <input
                type="radio"
                name="lotFormat"
                value="Option1"
                checked={selectedFormat === 'Option1'}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
              <div className="option-content">
                <span className="option-label">Option 1</span>
                <span className="option-format">{option1}</span>
              </div>
            </label>

            <label className="format-option">
              <input
                type="radio"
                name="lotFormat"
                value="Option2"
                checked={selectedFormat === 'Option2'}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
              <div className="option-content">
                <span className="option-label">Option 2</span>
                <span className="option-format">{option2}</span>
              </div>
            </label>
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
        content={`Are you sure you want to change the Lot Format to ${selectedFormat}?`}
        onOk={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

export default LotFormatModal
