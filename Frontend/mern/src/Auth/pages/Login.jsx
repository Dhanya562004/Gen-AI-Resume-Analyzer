import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLoading from '../components/AuthLoading'
import '../style/auth.css'
import { toast } from 'react-toastify'
import { useFirebase } from '../../Firebase/FirebaseProvider'

const Login = () => {
    const navigate = useNavigate()
    const { User, loading, handleLogin,handleGoogleLogin } = useAuth()
    const firebase = useFirebase()
    const [formData, setformData] = useState({
        email: "",
        password: ""
    })

    const [error, setError] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        
        if (!formData.email || !formData.password) {
            setError("Please fill in all fields")
            return
        }
        
        const success = await handleLogin(formData)
        if (success) {
            navigate("/")
        }
    }

    const signupwithgoogle = async () => {
        try {
            const result = await firebase.signupwithgoogle()
    
            const user = result.user
    
            await handleGoogleLogin({
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            })
    
            // toast.success("Google login successful")
            navigate("/")
        }
        catch (error) {
            console.log("Error occured", error)
            toast.error("Google login failed")
        }
    }
    function handleChange(e) {
        const { value, name } = e.target
        setformData((prev) => ({ ...prev, [name]: value }))
        if (error) setError("")
    }

    if (loading) {
        return <AuthLoading message="Logging in to your account..." />
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder='Enter your email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder='Enter your password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            color: "#fecaca",
                            fontSize: "0.9rem"
                        }}>
                            {error}
                        </div>
                    )}

                    <button type='submit' className='submit-btn' disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                 <button
  type="button"
  onClick={signupwithgoogle}
  style={{
    width: "100%",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginTop: "12px",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)"
  }}
  onMouseEnter={(e) => {
    e.target.style.background = "rgba(255,255,255,0.1)"
    e.target.style.transform = "translateY(-2px)"
  }}
  onMouseLeave={(e) => {
    e.target.style.background = "rgba(255,255,255,0.05)"
    e.target.style.transform = "translateY(0)"
  }}
>
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="google"
    style={{
      width: "20px",
      height: "20px"
    }}
  />

  Continue with Google
</button>
                </form>

                <div className="auth-link-group">
                    <p className="auth-link-text">
                        Don't have an account?
                        <Link to="/signup" className="auth-link">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login