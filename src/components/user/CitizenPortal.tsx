import type { FormEvent } from 'react'
import type {
  Incident,
  IncidentDraft,
  TrackedReport,
  VolunteerForm,
  HelplineInfo,
} from '../../hooks/useUserLanding'

interface CitizenPortalProps {
  activeTab: number
  setActiveTab: (i: number) => void

  /* Incident */
  incidentDraft: IncidentDraft
  submittedIncidents: Incident[]
  lastSubmittedId: string | null
  isSubmitting: boolean
  updateIncidentField: <K extends keyof IncidentDraft>(field: K, value: IncidentDraft[K]) => void
  submitIncident: () => void
  disasterOptions: string[]

  /* Track */
  trackingId: string
  setTrackingId: (v: string) => void
  trackedReport: TrackedReport | null
  trackReport: () => void

  /* Volunteer */
  volunteer: VolunteerForm
  volunteerSubmitted: boolean
  updateVolunteerField: <K extends keyof VolunteerForm>(field: K, value: VolunteerForm[K]) => void
  toggleSkill: (skill: string) => void
  submitVolunteer: () => void
  availableSkills: string[]
  districts: string[]

  /* Helplines */
  helplines: HelplineInfo[]
}

const TABS = ['Report Incident', 'Track Report', 'Volunteer Registration', 'Helplines Directory']

export const CitizenPortal = (props: CitizenPortalProps) => {
  const handleIncidentSubmit = (e: FormEvent) => { e.preventDefault(); props.submitIncident() }
  const handleVolunteerSubmit = (e: FormEvent) => { e.preventDefault(); props.submitVolunteer() }
  const handleTrack = (e: FormEvent) => { e.preventDefault(); props.trackReport() }

  return (
    <section className="portal-section" id="citizen-portal">
      <h2 className="section-title">Citizen Portal</h2>
      <p className="section-subtitle">Report incidents, track responses, register as volunteer, or find emergency helplines</p>

      <div className="portal-tabs" role="tablist">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            role="tab"
            id={`tab-${i}`}
            aria-selected={props.activeTab === i}
            className={`portal-tab ${props.activeTab === i ? 'active' : ''}`}
            onClick={() => props.setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="portal-body">
        {/* ─── TAB 0: Report Incident ─── */}
        {props.activeTab === 0 && (
          <>
          <form className="portal-form" onSubmit={handleIncidentSubmit} id="report-incident-form">
            {props.lastSubmittedId && (
              <div className="form-success">
                ✅ Incident report submitted successfully! Your report ID is <strong>{props.lastSubmittedId}</strong>
              </div>
            )}

            <div className="form-grid-2">
              <div className="field">
                <label htmlFor="disaster-type">Disaster Type</label>
                <select
                  id="disaster-type"
                  value={props.incidentDraft.disasterType}
                  onChange={e => props.updateIncidentField('disasterType', e.target.value)}
                  required
                >
                  <option value="">Select disaster type...</option>
                  {props.disasterOptions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Severity Level</label>
                <div className="severity-radios">
                  {['Low', 'Medium', 'High', 'Critical'].map(s => (
                    <label key={s} className={`severity-radio ${props.incidentDraft.severity === s ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="severity"
                        value={s}
                        checked={props.incidentDraft.severity === s}
                        onChange={() => props.updateIncidentField('severity', s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="inc-location">Location</label>
              <div className="location-row">
                <input
                  id="inc-location"
                  type="text"
                  value={props.incidentDraft.location}
                  onChange={e => props.updateIncidentField('location', e.target.value)}
                  placeholder="Area, street, landmark"
                  required
                />
                <button className="ghost-button gps-btn" type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        ({ coords }) => props.updateIncidentField('location', `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`),
                        () => {}
                      )
                    }
                  }}>
                  📍 GPS
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="inc-desc">Description</label>
              <textarea
                id="inc-desc"
                value={props.incidentDraft.description}
                onChange={e => props.updateIncidentField('description', e.target.value)}
                placeholder="Describe the situation in detail — hazards, trapped individuals, urgency level, access routes..."
                rows={4}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="field">
                <label htmlFor="inc-source">Source</label>
                <select
                  id="inc-source"
                  value={props.incidentDraft.source}
                  onChange={e => props.updateIncidentField('source', e.target.value)}
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Authority">Authority</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="inc-file">Upload Evidence</label>
                <input
                  id="inc-file"
                  type="file"
                  accept="image/*,video/*"
                  className="file-picker"
                  onChange={e => props.updateIncidentField('file', e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <div className="anon-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={props.incidentDraft.anonymous}
                  onChange={e => props.updateIncidentField('anonymous', e.target.checked)}
                />
                <span className="toggle-switch" />
                Report anonymously
              </label>
            </div>

            {!props.incidentDraft.anonymous && (
              <div className="form-grid-3">
                <div className="field">
                  <label htmlFor="rep-name">Your Name</label>
                  <input
                    id="rep-name"
                    type="text"
                    value={props.incidentDraft.reporterName}
                    onChange={e => props.updateIncidentField('reporterName', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="field">
                  <label htmlFor="rep-phone">Phone</label>
                  <input
                    id="rep-phone"
                    type="tel"
                    value={props.incidentDraft.reporterPhone}
                    onChange={e => props.updateIncidentField('reporterPhone', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="field">
                  <label htmlFor="rep-email">Email</label>
                  <input
                    id="rep-email"
                    type="email"
                    value={props.incidentDraft.reporterEmail}
                    onChange={e => props.updateIncidentField('reporterEmail', e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            )}

            <button
              className="cta-button submit-incident-btn"
              type="submit"
              disabled={props.isSubmitting}
            >
              {props.isSubmitting ? '⏳ Submitting...' : '🚨 Submit Incident Report'}
            </button>
          </form>

          {/* ─── Live Incoming Feed ─── */}
          {props.submittedIncidents.length > 0 && (
            <div className="live-feed-section">
              <h3 className="feed-heading">📡 Live Incoming Feed</h3>
              <p className="feed-subtext">{props.submittedIncidents.length} incident{props.submittedIncidents.length !== 1 ? 's' : ''} reported</p>
              <div className="feed-scroll">
                {props.submittedIncidents.map(inc => (
                  <article key={inc.id} className="feed-incident-card">
                    <div className="fic-header">
                      <span className="fic-id">{inc.id}</span>
                      <span className={`fic-severity sev-${inc.severity.toLowerCase()}`}>{inc.severity}</span>
                    </div>
                    <p className="fic-type">{inc.type}</p>
                    <p className="fic-desc">{inc.description}</p>
                    <div className="fic-meta">
                      <span>📍 {inc.location}</span>
                      <span>👤 {inc.source}</span>
                      <span>🕐 {inc.time}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
          </>
        )}

        {/* ─── TAB 1: Track Report ─── */}
        {props.activeTab === 1 && (
          <div className="track-panel" id="track-report-panel">
            <form className="track-form" onSubmit={handleTrack}>
              <div className="field">
                <label htmlFor="track-id">Incident ID</label>
                <div className="location-row">
                  <input
                    id="track-id"
                    type="text"
                    value={props.trackingId}
                    onChange={e => props.setTrackingId(e.target.value)}
                    placeholder="Enter your incident ID, e.g. RQ-123456"
                    required
                  />
                  <button className="ghost-button" type="submit">Track</button>
                </div>
              </div>
            </form>

            {props.trackedReport && (
              <div className="track-result">
                <div className="track-summary">
                  <div className="track-stat">
                    <span className="ts-label">AI Priority</span>
                    <span className="ts-value priority-high">{props.trackedReport.priority}</span>
                  </div>
                  <div className="track-stat">
                    <span className="ts-label">Teams Assigned</span>
                    <span className="ts-value">{props.trackedReport.teams}</span>
                  </div>
                  <div className="track-stat">
                    <span className="ts-label">Status</span>
                    <span className="ts-value status-active">{props.trackedReport.status}</span>
                  </div>
                </div>

                <div className="track-timeline">
                  <h4>Response Timeline</h4>
                  <div className="timeline-list">
                    {props.trackedReport.timeline.map((step, i) => (
                      <div key={i} className={`timeline-step ${step.done ? 'done' : 'pending'}`}>
                        <span className="timeline-dot" />
                        <span className="timeline-time">{step.time}</span>
                        <span className="timeline-label">{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: Volunteer Registration ─── */}
        {props.activeTab === 2 && (
          <form className="portal-form" onSubmit={handleVolunteerSubmit} id="volunteer-form">
            {props.volunteerSubmitted && (
              <div className="form-success">
                ✅ Thank you for registering! Our coordination team will reach out during the next activation.
              </div>
            )}

            <div className="form-grid-2">
              <div className="field">
                <label htmlFor="vol-name">Full Name</label>
                <input
                  id="vol-name"
                  type="text"
                  value={props.volunteer.name}
                  onChange={e => props.updateVolunteerField('name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="vol-phone">Phone Number</label>
                <input
                  id="vol-phone"
                  type="tel"
                  value={props.volunteer.phone}
                  onChange={e => props.updateVolunteerField('phone', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="field">
                <label htmlFor="vol-email">Email Address</label>
                <input
                  id="vol-email"
                  type="email"
                  value={props.volunteer.email}
                  onChange={e => props.updateVolunteerField('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="vol-district">District</label>
                <select
                  id="vol-district"
                  value={props.volunteer.district}
                  onChange={e => props.updateVolunteerField('district', e.target.value)}
                  required
                >
                  <option value="">Select district...</option>
                  {props.districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="vol-avail">Availability</label>
              <select
                id="vol-avail"
                value={props.volunteer.availability}
                onChange={e => props.updateVolunteerField('availability', e.target.value)}
                required
              >
                <option value="">Select availability...</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Full Time">Full Time</option>
                <option value="On Call">On Call</option>
              </select>
            </div>

            <div className="field">
              <label>Skills (select all that apply)</label>
              <div className="skill-chips">
                {props.availableSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    className={`skill-chip ${props.volunteer.skills.includes(skill) ? 'selected' : ''}`}
                    onClick={() => props.toggleSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <button className="cta-button volunteer-btn" type="submit">
              🤝 Register as Volunteer
            </button>
          </form>
        )}

        {/* ─── TAB 3: Helplines Directory ─── */}
        {props.activeTab === 3 && (
          <div className="helplines-dir" id="helplines-directory">
            <div className="dir-grid">
              {props.helplines.map(h => (
                <article key={h.id} className="dir-card">
                  <span className="dir-icon">{h.icon}</span>
                  <div className="dir-info">
                    <p className="dir-name">{h.name}</p>
                    <p className="dir-number">{h.number}</p>
                  </div>
                  <a href={`tel:${h.number}`} className="dir-call-btn">
                    📞 Call Now
                  </a>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
