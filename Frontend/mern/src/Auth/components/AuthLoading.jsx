import React from 'react'
import '../style/auth.css'

const AuthLoading = ({ message = "Loading..." }) => {
  return (
    <div className="auth-loading">
      <div className="loading-spinner-container">
        <div className="loading-spinner">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>
        <h2 className="loading-title">Processing...</h2>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}

export default AuthLoading
