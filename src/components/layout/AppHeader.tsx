import { getRelativeTime } from '../../utils/reportUtils'

interface AppHeaderProps {
  lastUpdateAt: string
}

export const AppHeader = ({ lastUpdateAt }: AppHeaderProps) => (
  <header className="app-header">
    <div>
      <p className="eyebrow">AI-Powered Disaster Response Intelligence</p>
      <h1>ResQAI Command Center</h1>
      <p className="subtitle">
        Unstructured distress signals become prioritized, map-based action in real
        time.
      </p>
    </div>

    <div className="status-chip" aria-live="polite">
      <span className="status-dot" />
      <span>Live feed active - Last update {getRelativeTime(lastUpdateAt)}</span>
    </div>
  </header>
)
