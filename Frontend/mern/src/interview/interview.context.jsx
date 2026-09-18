import { useState } from "react"
import { createContext } from "react"

export const InterviewContext = createContext()
function InterviewProvider({children}){
    const [loading,setloading] = useState(false)
    const [report,setreport] = useState(null)
    const [reports,setreports] = useState([])
    return(
        <InterviewContext.Provider value={{loading,setloading,setreport,report,reports,setreports}}>
            {children}
        </InterviewContext.Provider>
    )
}
export default InterviewProvider