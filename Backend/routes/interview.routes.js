import express from 'express'
import { authUser } from '../middlewares/auth.middleware.js'
import upload from '../middlewares/file.middleware.js'
import { interviewController } from '../controllers/interviewController.js'
import { getInterviewReport } from '../controllers/interviewController.js'
import { getAllInterviewReportController } from '../controllers/interviewController.js'
import { downloadInterviewReportController } from '../controllers/interviewController.js'
const interviewRouter = express.Router()
interviewRouter.post("/",authUser,upload.single("resume"),interviewController)
interviewRouter.get("/report/:interviewId",authUser,getInterviewReport)
interviewRouter.get("/reports",authUser,getAllInterviewReportController)
interviewRouter.get("/download/:interviewId",authUser,downloadInterviewReportController)
export default interviewRouter