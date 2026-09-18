import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLoading from '../components/AuthLoading'
import '../style/auth.css'
import { useFirebase } from '../../Firebase/FirebaseProvider'
import { toast } from 'react-toastify'

const SignUp = () => {
    const navigate = useNavigate()
    const { loading, handleRegister,handleGoogleLogin } = useAuth()
    const firebase = useFirebase()
    const [formData, setformData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const [error, setError] = useState("")
    const [passwordStrength, setPasswordStrength] = useState(0)

    function handleChange(e) {
        const { value, name } = e.target
        setformData((prev) => ({ ...prev, [name]: value }))
        
        if (error) setError("")

        if (name === 'password') {
            let strength = 0
            if (value.length >= 8) strength++
            if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++
            if (/\d/.test(value)) strength++
            if (/[^\w]/.test(value)) strength++
            setPasswordStrength(strength)
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
    async function handleSubmit(e) {
        e.preventDefault()
        setError("")

        if (!formData.name || !formData.email || !formData.password) {
            setError("Please fill in all fields")
            return
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        const success = await handleRegister(formData)
        if (success) {
            navigate("/login")
        }
    }

    if (loading) {
        return <AuthLoading message="Creating your account..." />
    }

    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join us and start preparing for interviews</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder='Enter your full name'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

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
                            placeholder='Create a strong password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {formData.password && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '8px',
                                fontSize: '0.85rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    gap: '3px',
                                    flex: 1
                                }}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            style={{
                                                flex: 1,
                                                height: '4px',
                                                borderRadius: '2px',
                                                background: i <= passwordStrength
                                                    ? strengthColors[passwordStrength]
                                                    : 'rgba(255, 255, 255, 0.1)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    ))}
                                </div>
                                <span style={{ color: strengthColors[passwordStrength] }}>
                                    {strengthLabels[passwordStrength]}
                                </span>
                            </div>
                        )}
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
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
                        Already have an account?
                        <Link to="/login" className="auth-link">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignUp