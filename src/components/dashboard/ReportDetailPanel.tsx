import type { Report } from '../../types/report'
import { getPriorityClass } from '../../utils/reportUtils'

interface ReportDetailPanelProps {
  selectedReport: Report | null
}

export const ReportDetailPanel = ({ selectedReport }: ReportDetailPanelProps) => (
  <section className="panel-card detail-card">
    <div className="card-heading">
      <h2>Report Detail View</h2>
      <p>Expanded intelligence for field decisions</p>
    </div>

    {selectedReport ? (
      <>
        <p className="detail-message">{selectedReport.message}</p>

        <div className="detail-grid">
          <div className="detail-item">
            <p className="detail-label">Disaster Type</p>
            <p className="detail-value">{selectedReport.disasterType}</p>
          </div>

          <div className="detail-item">
            <p className="detail-label">Location</p>
            <p className="detail-value">{selectedReport.location}</p>
          </div>

          <div className="detail-item">
            <p className="detail-label">People Affected</p>
            <p className="detail-value">{selectedReport.peopleAffected}</p>
          </div>

          <div className="detail-item">
            <p className="detail-label">Source</p>
            <p className="detail-value">{selectedReport.source}</p>
          </div>

          <div className="detail-item">
            <p className="detail-label">User Severity</p>
            <p className={`detail-value priority-pill ${getPriorityClass(selectedReport.severity)}`}>
              {selectedReport.severity}
            </p>
          </div>
        </div>

        <div className="score-section">
          <div className="score-head">
            <p>Priority Score</p>
            <strong>
              {selectedReport.priorityScore}/100 ({selectedReport.priorityLabel})
            </strong>
          </div>

          <div className="score-track" role="presentation">
            <div
              className={`score-fill ${getPriorityClass(selectedReport.priorityLabel)}`}
              style={{ width: `${selectedReport.priorityScore}%` }}
            />
          </div>

          <p className="score-explanation">{selectedReport.priorityExplanation}</p>
        </div>

        <div className="recommendation-box">
          <p className="detail-label">Recommended Response</p>
          <p>{selectedReport.recommendedAction}</p>
        </div>
      </>
    ) : (
      <p className="empty-detail">Select a report to inspect full detail.</p>
    )}
  </section>
)
