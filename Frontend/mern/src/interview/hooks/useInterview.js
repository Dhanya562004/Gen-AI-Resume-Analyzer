import { useCallback, useContext } from "react";
import { generateInterviewReport, generateResumePDF } from "../services/interview.api";
import { getInterviewReportById } from "../services/interview.api";
import { getAllInterviewReport } from "../services/interview.api";
import { InterviewContext } from "../interview.context";

export default function useInterview() {
    const context = useContext(InterviewContext)
    const { loading, setloading, report, setreport, setreports, reports } = context

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resume }) => {
        setloading(true)
        let response = null

        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resume })
            setreport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setloading(false)
        }

        return response?.interviewReport
    }, [setloading, setreport])

    const getReportById = useCallback(async (interviewId) => {
        setloading(true)
        let response = null

        try {
            response = await getInterviewReportById(interviewId)
            setreport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setloading(false)
        }

        return response?.interviewReport
    }, [setloading, setreport])

    const getReports = useCallback(async () => {
        setloading(true)
        let response = null

        try {
            response = await getAllInterviewReport()
            setreports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setloading(false)
        }

        return response?.interviewReports
    }, [setloading, setreports])
     async function getResume(interviewId){
        let response = null
        try{
            response = await generateResumePDF(interviewId)
            const url = window.URL.createObjectURL(new Blob([response],{type:"application/pdf"}))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download",`interview_report_${interviewId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }
        catch(error){
            console.log(error)
            throw error
        }
     }

    return { loading, report, reports, getReportById, generateReport, getReports ,getResume}
}
