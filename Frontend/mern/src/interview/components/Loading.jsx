import React from 'react'
import '../style/Loading.css'

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-card">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <h2 className="loading-title">Generating Your Report</h2>
        <p className="loading-message">{message}</p>
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading