import api from "../../../axios";
export async function generateInterviewReport({resume,selfDescription,jobDescription}){
        const formData = new FormData()
        formData.append("jobDescription",jobDescription)
        formData.append("selfDescription",selfDescription)
        formData.append("resume",resume)

        const response = await api.post("/interview/",formData,{
            headers:{
                "Content-Type":"multipart/form-data"
            }
        })
        return response.data
}
export async function getInterviewReportById(interviewId){
    const response = await api.get(`/interview/report/${interviewId}`)
    return response.data
}
export async  function getAllInterviewReport(){
    const response = await api.get("/interview/reports")
    return response.data
}
export async function generateResumePDF(interviewId){
    const response = await api.get(`/interview/download/${interviewId}`,{responseType:"blob"})
    return response.data
}
