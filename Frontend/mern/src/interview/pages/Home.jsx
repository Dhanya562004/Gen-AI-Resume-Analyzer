import React, { useRef, useState } from 'react'

import '../style/Home.css'
import useInterview from '../hooks/useInterview'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../Auth/hooks/useAuth'
import Loading from '../components/Loading'
const Home = () => {
  const { loading, generateReport, reports, getReports } = useInterview()
  const { handleLogOut } = useAuth()
  const [jobDescription, setjobDescription] = useState('')
  const [selfDescription, setselfDescription] = useState('')
  const resumeInputRef = useRef()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await handleLogOut()
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      navigate('/login')
    }
  }

  async function handleGenerateReport() {
    const resume = resumeInputRef.current.files[0]
    if (!resume) {
      alert("Please upload a resume PDF before generating the report.")
      return
    }

    const interviewReport = await generateReport({ jobDescription, selfDescription, resume })
    console.log(interviewReport)
    if (!interviewReport?._id) {
      return
    }
    navigate(`/interview/${interviewReport._id}`)
  }

  if (loading) {
    return <Loading message="Generating your personalized interview report..." />
  }
  return (
    <div className="home">
      <div className="form-card">
        <div className="home-header">
          <h1>Interview Report Generator</h1>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <p className="subtitle">
          Fill in the details below to generate your interview report
        </p>

        <div className="form-group">
          <label htmlFor="jobDescription">Job Description</label>
          <textarea
            name="jobDescription"
            id="jobDescription"
            placeholder="Enter Job Description here...."
            rows="8"
            onChange={(event) => setjobDescription(event.target.value)}
            value={jobDescription}
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="resume">Upload Resume</label>
            <input
              type="file"
              name="resume"
              id="resume"
              accept=".pdf"
              ref={resumeInputRef}
            />
          </div>

          <div className="form-group">
            <label htmlFor="selfDescription">Self Description</label>
            <input
              type="text"
              name="selfDescription"
              id="selfDescription"
              placeholder="Describe yourself in this box..."
              onChange={(event) => setselfDescription(event.target.value)}
              value={selfDescription}
            />
          </div>
        </div>

        <div className="button-row">
          <button onClick={handleGenerateReport} className="generate-btn">Generate Interview Report</button>
          <button onClick={() => navigate('/reports')} className="view-reports-btn">View All Reports</button>
        </div>
    </div>
    </div>
  )

}
export default Home