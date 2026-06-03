import { useState } from 'react'
import ConfirmModal from '../ConfirmModal'
import './ClientCustomerSelector.css'

function ClientCustomerSelector({ customers, onSelect, onCancel }) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirm = () => {
    if (selectedIndex >= 0 && selectedIndex < customers.length) {
      // Show confirmation dialog
      setConfirmOpen(true)
    }
  }

  const handleConfirmSelect = () => {
    setConfirmOpen(false)
    onSelect(customers[selectedIndex])
  }

  const handleCancelConfirm = () => {
    setConfirmOpen(false)
    // Close the app if user cancels
    if (window.electronAPI?.showErrorAndQuit) {
      window.electronAPI.showErrorAndQuit('User cancelled. Application will exit.')
    }
  }

  const selectedCustomer = selectedIndex >= 0 ? customers[selectedIndex] : null
  const confirmMessage = selectedCustomer 
    ? `Local Machine State not detected. Will use database default configuration:\n${selectedCustomer.lineType}/${selectedCustomer.lineNumber}/${selectedCustomer.source}\n\nDo you want to continue?`
    : ''

  return (
    <div className="client-selector-overlay">
      <div className="client-selector-modal">
        <div className="client-selector-header">
          <h3>Select Workstation</h3>
          <p>Please select the workstation configuration to use</p>
        </div>

        <div className="client-selector-content">
          <table className="client-selector-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}></th>
                <th>Client Name</th>
                <th>Line Type</th>
                <th>Line Number</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr
                  key={index}
                  className={selectedIndex === index ? 'selected' : ''}
                  onClick={() => setSelectedIndex(index)}
                >
                  <td>
                    <input
                      type="radio"
                      name="clientCustomer"
                      checked={selectedIndex === index}
                      onChange={() => setSelectedIndex(index)}
                    />
                  </td>
                  <td>{customer.clientName}</td>
                  <td>{customer.lineType}</td>
                  <td>{customer.lineNumber}</td>
                  <td>{customer.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="client-selector-footer">
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={selectedIndex < 0}
          >
            Confirm
          </button>
          {onCancel && (
            <button className="btn btn-default" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirm Selection"
        content={confirmMessage}
        onOk={handleConfirmSelect}
        onCancel={handleCancelConfirm}
      />
    </div>
  )
}

export default ClientCustomerSelector
