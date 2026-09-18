import { createContext, useEffect, useState } from "react";
import { getMe } from "./auth.api";

export const AuthContext = createContext()
export function AuthProvider({ children }) {
    const [User, setUser] = useState(null)
    const [loading, setloading] = useState(true)
   useEffect(() => {
    const getAndSetUser = async () => {
        try {
            const response = await getMe()
            setUser(response?.user || null) // null safe
        } catch (error) {
            setUser(null)
        } finally {
            setloading(false) // ✅ HAMESHA chalega, error aaye ya na aaye
        }
    }
    getAndSetUser()
}, [])
    return (
        <AuthContext.Provider value={{ User, setUser, loading, setloading }} >
            {children}
        </AuthContext.Provider>
    )
}