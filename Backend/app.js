import express from 'express'
import cookieParser from "cookie-parser"
import cors from 'cors'
import authRouter from './routes/authRoutes.js'
import interviewRouter from './routes/interview.routes.js'
import path from 'path'
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
const __dirname = path.resolve()
app.use('/api/auth',authRouter)
app.use('/api/interview/',interviewRouter)
app.use(express.static(path.join(__dirname,"Frontend/mern/dist")))
app.get("/{*splat}",(req,resp)=>{
    resp.sendFile(path.resolve(__dirname,"Frontend","mern","dist","index.html"))
})

export default app