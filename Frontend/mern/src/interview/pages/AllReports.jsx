import React, { useEffect } from 'react'
import '../style/Home.css' // Reusing Home.css for similar styling
import useInterview from '../hooks/useInterview'
import { useNavigate } from 'react-router-dom'

const AllReports = () => {
  const { loading, reports, getReports } = useInterview()
  const navigate = useNavigate()

  useEffect(() => {
    getReports()
  }, [getReports])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="home">
      <div className="form-card">
        <h1>All Your Reports</h1>
        <p className="subtitle">
          View all the interview reports you have generated
        </p>

        {reports && reports.length > 0 ? (
          <div className="recent-reports">
            <ul className="reports-list">
              {reports.map((report) => (
                <li
                  key={report._id}
                  className="report-item"
                  onClick={() => navigate(`/interview/${report._id}`)}
                >
                  <span className="report-match">{report.matchScore}% match</span>
                  <span className="report-date">{new Date(report.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No reports found. Generate your first report!</p>
        )}

        <button onClick={() => navigate('/')} className="generate-btn">Generate New Report</button>
      </div>
    </div>
  )
}

export default AllReports