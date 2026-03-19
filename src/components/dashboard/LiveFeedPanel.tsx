import type { CSSProperties } from 'react'
import { DISASTER_TYPES } from '../../data/reportData'
import type {
  DisasterFilter,
  PriorityFilter,
  Report,
} from '../../types/report'
import {
  getPriorityClass,
  getRelativeTime,
  truncateMessage,
} from '../../utils/reportUtils'

interface LiveFeedPanelProps {
  reportsCount: number
  filteredReports: Report[]
  selectedReportId: string | null
  priorityFilter: PriorityFilter
  disasterFilter: DisasterFilter
  onPriorityFilterChange: (value: PriorityFilter) => void
  onDisasterFilterChange: (value: DisasterFilter) => void
  onSelectReport: (reportId: string) => void
}

export const LiveFeedPanel = ({
  reportsCount,
  filteredReports,
  selectedReportId,
  priorityFilter,
  disasterFilter,
  onPriorityFilterChange,
  onDisasterFilterChange,
  onSelectReport,
}: LiveFeedPanelProps) => (
  <section className="panel-card feed-card">
    <div className="feed-topline">
      <div className="card-heading">
        <h2>Live Incoming Feed</h2>
        <p>
          {filteredReports.length} shown / {reportsCount} total reports
        </p>
      </div>
    </div>

    <div className="filters-row">
      <div>
        <label htmlFor="priority-filter">Priority</label>
        <select
          id="priority-filter"
          value={priorityFilter}
          onChange={(event) =>
            onPriorityFilterChange(event.target.value as PriorityFilter)
          }
        >
          <option value="All">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div>
        <label htmlFor="disaster-filter">Disaster Type</label>
        <select
          id="disaster-filter"
          value={disasterFilter}
          onChange={(event) =>
            onDisasterFilterChange(event.target.value as DisasterFilter)
          }
        >
          <option value="All">All Types</option>
          {DISASTER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>

    <ul className="feed-list" aria-live="polite">
      {filteredReports.map((report, index) => {
        const delayStyle = {
          '--delay': `${Math.min(index * 45, 360)}ms`,
        } as CSSProperties

        return (
          <li key={report.id}>
            <button
              type="button"
              className={`feed-item ${selectedReportId === report.id ? 'selected' : ''}`}
              style={delayStyle}
              onClick={() => onSelectReport(report.id)}
            >
              <div className="feed-item-head">
                <p>{truncateMessage(report.message)}</p>
                <span className={`priority-pill ${getPriorityClass(report.severity)}`}>
                  {report.severity} (AI: {report.priorityLabel} - {report.priorityScore})
                </span>
              </div>

              <div className="feed-meta">
                <span>{report.location}</span>
                <span>{report.disasterType}</span>
                <span>{report.peopleAffected} people</span>
                <span>{getRelativeTime(report.createdAt)}</span>
              </div>
            </button>
          </li>
        )
      })}

      {filteredReports.length === 0 ? (
        <li className="empty-feed">
          {reportsCount === 0
            ? 'No reports yet. Submit a distress report to see it here.'
            : 'No reports match the current filters.'}
        </li>
      ) : null}
    </ul>
  </section>
)
