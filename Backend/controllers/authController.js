import User from "../models/User.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import blacklistModel from "../models/blacklist.model.js"
import { sendRegistrationEmail } from "../services/email.service.js"
export async function SignUp(req, resp) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return resp.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({ email })

        if (user) {
            return resp.status(409).json({ message: "User already exists" })
        }

        const userData = await User.create({
            name,
            email,
            password,
            authProvider: "local"
        })

        await sendRegistrationEmail(email, name)

        return resp.status(201).json({
            message: "User registered Successfully",
            userData
        })

    } catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}
export async function Login(req, resp) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return resp.status(400).json({ message: "All fields are required" })
        }

        const userExists = await User.findOne({ email }).select("+password")

        if (!userExists) {
            return resp.status(404).json({ message: "User is not registered" })
        }

        if (userExists.authProvider === "google") {
            return resp.status(400).json({
                message: "This account was created with Google. Please login with Google."
            })
        }

        const ishashPassword = await bcrypt.compare(password, userExists.password)

        if (!ishashPassword) {
            return resp.status(401).json({ message: "Invalid password" })
        }

        const token = jwt.sign(
            { id: userExists._id, name: userExists.name },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        )

        resp.cookie("token", token)

        return resp.status(200).json({
            message: "Login Successfully",
            token,
            userExists
        })

    } catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}
export async function googleAuthController(req, resp) {
    try {
        const { uid, name, email, photoURL } = req.body

        if (!uid || !email) {
            return resp.status(400).json({ message: "UID and email are required" })
        }

        let userExists = await User.findOne({ email })

        if (!userExists) {
            userExists = await User.create({
                name: name || "Google User",
                email,
                firebaseUid: uid,
                photoURL,
                authProvider: "google"
            })
        } else {
            userExists.firebaseUid = uid
            userExists.photoURL = photoURL
            userExists.name = name || userExists.name

            await userExists.save()
        }

        const token = jwt.sign(
            { id: userExists._id, name: userExists.name },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        )

        resp.cookie("token", token)

        return resp.status(200).json({
            message: "Google Login Successfully",
            token,
            userExists
        })

    } catch (error) {
        return resp.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}
 export async function logoutUserController(req,resp){
    try{
        const token = req.cookies.token
        if(token){
            await blacklistModel.create({token})
        }
        resp.clearCookie("token")
        return resp.status(200).json({message:"User Logged Out Successfully"})
    }
    catch(error){
      return resp.status(500).json({message:"Internal Server Error",error})
    }
 }
 export async function getMeController(req,resp){
    try{
        const user = await User.findById(req.user.id)
        return resp.status(200).json({message:"Data get",user:{id:user._id,username:user.name,email:user.email}})
    }
    catch(error){
        return resp.status(500).json({message:"Internal server error",error})
    }
 }