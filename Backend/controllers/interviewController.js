import { PDFParse } from "pdf-parse"
import generateInterviewReport, { generateResumePdf } from "../services/ai.service.js"
import InterViewReport from "../models/interviewReport.model.js"
export async function interviewController(req,resp){
    try{
        if (!req.file) {
    return resp.status(400).json({ message: "Resume file is required" });
}
        const resumeFile = req.file
        const resumeContent =await (new PDFParse(Uint8Array.from(req.file.buffer))).getText()  // It returns data in object 
        console.log(resumeContent)
        const {selfDescription,jobDescription} = req.body
        const interviewRepotByAI = await generateInterviewReport({
            resumeText:resumeContent.text,
            selfDescription,
            jobDescription
        })
        console.log(interviewRepotByAI)
        const interviewReport = await InterViewReport.create({
            user:req.user.id,
            resumeText:resumeContent.text,  // it return data in string 
            selfDescription,
            jobDescription,
            ...interviewRepotByAI
        })

        return resp.status(201).json({message:"Interview report generated successfuly",interviewReport})
    }

    catch(error){
        console.error('interviewController error:', error)
        return resp.status(500).json({message:"Internal Server Error", error: error.message || error})
    }
}
export async function getInterviewReport(req,resp){
    try{
        const {interviewId} = req.params
        const interviewReport = await InterViewReport.findOne({_id:interviewId,user:req.user.id})
        if(!interviewReport){
            return resp.status(404).json({
                message:"Interview report not found"
            })
        }
        resp.status(200).json({message:"Interview Fetched Successfully",interviewReport})
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error})
    }
}
export async function getAllInterviewReportController(req,resp){
    try{
        const interviewReports = await InterViewReport.find({user:req.user.id}).sort({createdAt:-1}).select("-resumeText -selfDescription -jobDescription -_v -tecnicalQuestionSchema -behaviourQuestionSchema -skillGapsSchema -preparationPlanSchema")
        if(!interviewReports){
            return resp.status(404).json({message:"All interview Reports are not get"})
        }
        return resp.status(201).json({message:"All interview Reports are get", interviewReports})
    }
    catch(error){
        return resp.status(500).json({message:"Internal Server Error",error})
    }
}
export async function downloadInterviewReportController(req,resp){
    try{
        const {interviewId} = req.params
        const interviewReport = await InterViewReport.findById(interviewId)
        if(!interviewReport){
            return resp.status(404).json({message:"Interview Report not found"})
        }
        const {resumeText,selfDescription,jobDescription} = interviewReport
        const pdfBuffer = await generateResumePdf({resumeText,selfDescription,jobDescription})
        resp.set({
            "Content-Type":"application/pdf",
            "Content-Disposition":"attachement; filename = interview_report.pdf"
        })
        resp.send(pdfBuffer)
    }
    catch(error){
        resp.status(500).json({message:"Internal Server Error",error})
    }
}