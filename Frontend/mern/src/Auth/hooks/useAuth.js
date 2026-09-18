import React, { useContext } from 'react'
import { toast } from 'react-toastify'
import { AuthContext } from '../services/auth.context'
import { login, logout, register,googleLogin } from '../services/auth.api'

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { User, setUser, loading, setloading } = context

    function extractErrorMessage(error) {
        return error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.'
    }
   const clearAppStorage = () => {
        // Clear all app-related localStorage to avoid showing old user's data
        try {
            // Clear localStorage
            window.localStorage.removeItem('ai-debugger-state')
            window.localStorage.removeItem('debug-context')
            window.localStorage.removeItem('auth-token')
            
            // Clear sessionStorage
            window.sessionStorage.clear()
            
            // Reset debug context state
            if (resetDebugState) {
                resetDebugState()
            }
            
            console.log('✅ App storage cleared successfully')
        } catch (err) {
            console.error('Error clearing storage:', err)
        }
    }
    async function handleLogin({ email, password }) {
        setloading(true)
        try {
            const data = await login({ email, password })
            if (!data?.user) {
                throw new Error('Unable to log in. Please check your credentials.')
            }
            setUser(data.user)
            toast.success('Welcome back! You are signed in.', { theme: 'dark' })
            return true
        }
        catch (error) {
            toast.error(extractErrorMessage(error), { theme: 'dark' })
            return false
        } finally {
            setloading(false)
        }
    }

    async function handleRegister({ name, email, password }) {
        setloading(true)
        try {
            const data = await register({ name, email, password })
            if (!data?.user) {
                throw new Error('Unable to create account. Please try again.')
            }
            setUser(data.user)
            toast.success('Account created successfully! Redirecting to login…', { theme: 'dark' })
            return true
        }
        catch (error) {
            toast.error(extractErrorMessage(error), { theme: 'dark' })
            return false
        }
        finally {
            setloading(false)
        }
    }

    async function handleLogOut() {
        setloading(true)
        try {
            await logout()
            setUser(null)
            toast.info('You have been signed out.', { theme: 'dark' })
        }
        catch (error) {
            toast.error(extractErrorMessage(error), { theme: 'dark' })
        }
        finally {
            setloading(false)
        }
    }
        async function handleGoogleLogin({ uid, name, email, photoURL }) {
    setloading(true)
    try {
        clearAppStorage()

        const data = await googleLogin({
            uid,
            name,
            email,
            photoURL
        })

        setUser(data.userExists)
        console.log(data.userExists)
    }
    catch (error) {
        console.log(error)
    }
    finally {
        setloading(false)
    }
}


    return { User, loading, handleRegister, handleLogOut, handleLogin , handleGoogleLogin }
}

