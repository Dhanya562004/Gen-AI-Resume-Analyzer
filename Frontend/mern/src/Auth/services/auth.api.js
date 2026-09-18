import axios from "axios";
import api from "../../../axios";

export async function register({ name, email, password }) {
    try {
        const response = await api.post('/auth/signup', { name, email, password })
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error
    }
}
export async function login({ email, password }) {
    try {
        const response = await api.post('/auth/login', { email, password })
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error
    }
}
export async function logout() {
    try {
        const response = await api.get('/auth/logout')
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error
    }
}
export async function getMe() {
    try {
        const response = await api.get('/auth/get-me')
        return response.data
    }
    catch (error) {
        console.log(error)
        throw error
    }
}


export async function googleLogin({ uid, name, email, photoURL }) {
    try {
        const response = await api.post("/auth/google", {
            uid,
            name,
            email,
            photoURL
        })
        return response.data
    }
    catch (error) {
        console.log("Error Occured", error)
    }
}