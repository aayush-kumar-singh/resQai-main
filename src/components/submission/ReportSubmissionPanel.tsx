import type { FormEvent } from 'react'
import type { DraftReport } from '../../types/report'

interface ReportSubmissionPanelProps {
  draft: DraftReport
  submitStatus: string
  isSubmitting: boolean
  onDraftFieldChange: (field: keyof DraftReport, value: string) => void
  onAutoDetectLocation: () => void
  onSubmitDraft: () => void
}

export const ReportSubmissionPanel = ({
  draft,
  submitStatus,
  isSubmitting,
  onDraftFieldChange,
  onAutoDetectLocation,
  onSubmitDraft,
}: ReportSubmissionPanelProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSubmitDraft()
  }

  return (
    <section className="panel-card submission-card">
      <div className="card-heading">
        <h2>Submit Distress Report</h2>
        <p>Fast mobile-first intake for citizens and volunteers</p>
      </div>

      <form className="submission-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="message">Situation details</label>
          <textarea
            id="message"
            value={draft.message}
            onChange={(event) => onDraftFieldChange('message', event.target.value)}
            placeholder="Describe what is happening, key hazards, and urgency."
            required
          />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <div className="location-row">
            <input
              id="location"
              type="text"
              value={draft.location}
              onChange={(event) => onDraftFieldChange('location', event.target.value)}
              placeholder="Area, street, landmark"
              required
            />
            <button
              className="ghost-button"
              type="button"
              onClick={onAutoDetectLocation}
            >
              Auto-detect
            </button>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="people">People affected</label>
            <input
              id="people"
              type="number"
              min={1}
              value={draft.peopleAffected}
              onChange={(event) =>
                onDraftFieldChange('peopleAffected', event.target.value)
              }
              placeholder="0"
              required
            />
          </div>

          <div>
            <label htmlFor="image">Upload image (optional)</label>
            <input
              id="image"
              className="file-picker"
              type="file"
              accept="image/*"
              onChange={(event) =>
                onDraftFieldChange('imageName', event.target.files?.[0]?.name ?? '')
              }
            />
          </div>
        </div>

        {draft.imageName ? <p className="file-name">Attached: {draft.imageName}</p> : null}

        <button className="cta-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '⏳ Submitting...' : 'Send Emergency Report'}
        </button>

        {submitStatus ? <p className="submit-status">{submitStatus}</p> : null}
      </form>
    </section>
  )
}
