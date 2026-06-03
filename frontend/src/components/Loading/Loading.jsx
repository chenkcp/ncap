import React from 'react'
import './Loading.css'

const Loading = ({ visible, message }) => {
  if (!visible) return null

  return (
    <div className="loading-mask">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && <div className="loading-message">{message}</div>}
      </div>
    </div>
  )
}

export default Loading
