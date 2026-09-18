import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import '../style/interview.css'
import useInterview from '../hooks/useInterview'
import { useParams } from 'react-router-dom'
import Loading from '../components/Loading'
const sectionConfig = [
  {
    id: 'technical',
    title: 'Technical Question',
    subtitle: 'High-value technical question summary',
    schemaKey: 'technicalQuestionSchema'
  },
  {
    id: 'behavioural',
    title: 'Behavioral Question',
    subtitle: 'Real-world behavioral prompts and answers',
    schemaKey: 'behaviourQuestionSchema'
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    subtitle: 'Your preparation plan for the next interview',
    schemaKey: 'preparationPlanSchema'
  }
]


const Interview = () => {
  const [activeSectionId, setActiveSectionId] = useState(sectionConfig[0].id)
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadMessage, setDownloadMessage] = useState('')
  const {report, loading, getReportById, getReports, getResume} = useInterview()
  const {interview} = useParams()
  const activeSection = useMemo(
    () => sectionConfig.find((section) => section.id === activeSectionId) || sectionConfig[0],
    [activeSectionId]
  )

  useEffect(() => {
    if (interview) {
      getReportById(interview)
    }
    else{
      getReports()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview])

  const handleDownloadResume = async () => {
    if (!interview) return
    setDownloadMessage('Generating AI Resume PDF...')
    setDownloadLoading(true)

    try {
      await getResume(interview)
      setDownloadMessage('Your AI Resume PDF download should start shortly.')
      toast.success('Resume PDF is ready and downloading.', { theme: 'dark' })
    } catch (error) {
      setDownloadMessage('Unable to download the PDF. Please try again.')
      toast.error('Failed to download resume PDF. Please try again.', { theme: 'dark' })
    } finally {
      setTimeout(() => {
        setDownloadLoading(false)
        setDownloadMessage('')
      }, 1800)
    }
  }

  const toggleQuestion = (question) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(question)) {
        newSet.delete(question)
      } else {
        newSet.add(question)
      }
      return newSet
    })
  }

  const activeItems = useMemo(() => {
    if (!report) {
      return []
    }
    if (activeSection.id === 'roadmap') {
      return report.preparationPlanSchema
    }
    return report[activeSection.schemaKey]
  }, [activeSection, report])

  if (loading || !report) {
    return <Loading message="Loading your interview report..." />
  }

  return (
    <div className="interview-page">
      <aside className="interview-sidebar">
        <div className="interview-panel">
          <h2 className="interview-section-title">Sections</h2>
          <div className="interview-option-list">
            {sectionConfig.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`interview-option-card ${activeSectionId === section.id ? 'active' : ''}`}
                onClick={() => setActiveSectionId(section.id)}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="interview-main">
        <div className="interview-panel interview-main-panel">
          <div className="interview-main-content">
            <div className="interview-main-header">
              <div>
                <h1 className="interview-main-title">{activeSection.title}</h1>
                <p className="interview-main-description">{activeSection.subtitle}</p>
              </div>
              <div className="interview-header-actions">
                <button
                  type="button"
                  className="download-resume-btn"
                  onClick={handleDownloadResume}
                  disabled={downloadLoading}
                >
                  {downloadLoading ? 'Generating Resume...' : 'Download Resume PDF'}
                </button>
                <div className="interview-score-pill">{report.matchScore}% match</div>
              </div>
            </div>
            {downloadMessage && (
              <div className="download-status-banner">
                {downloadMessage}
              </div>
            )}

            <div className="interview-main-details">
              {activeSection.id === 'roadmap' ? (
                activeItems.map((item) => (
                  <div key={item.day} className="roadmap-card">
                    <div className="roadmap-card-header">
                      <span className="roadmap-day">Day {item.day}</span>
                      <span className="roadmap-focus">{item.focus}</span>
                    </div>
                    <ul className="roadmap-task-list">
                      {item.tasks.map((task) => (
                        <li key={task} className="roadmap-task-item">{task}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                activeItems.map((item) => (
                  <div key={item.question} className="question-card">
                    <p className="question-label">Question</p>
                    <h2 
                      className={`question-title clickable ${expandedQuestions.has(item.question) ? 'expanded' : ''}`} 
                      onClick={() => toggleQuestion(item.question)}
                    >
                      {item.question}
                    </h2>
                    {expandedQuestions.has(item.question) && (
                      <>
                        <p className="question-label">Intention</p>
                        <p className="question-intention">{item.intention}</p>
                        <p className="question-label">Model Answer</p>
                        <p className="question-answer">{item.answer}</p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <aside className="interview-sidebar">
        <div className="interview-panel">
          <h2 className="interview-section-title">Skill Gaps</h2>
          <ul className="skill-list">
            {report.skillGapsSchema.map((item) => (
              <li key={item.skill} className="skill-item">
                <span>{item.skill}</span>
                <span className={`severity severity-${item.severity}`}>{item.severity}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

export default Interview
