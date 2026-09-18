import express from 'express'
import {  SignUp ,Login, logoutUserController, getMeController,googleAuthController } from '../controllers/authController.js'
import { authUser } from '../middlewares/auth.middleware.js'
const authRouter = express.Router()
authRouter.post("/signup",SignUp)
authRouter.post('/login',Login)
authRouter.get('/logout',logoutUserController)
authRouter.get('/get-me',authUser,getMeController)
authRouter.post("/google", googleAuthController)
export default authRouter