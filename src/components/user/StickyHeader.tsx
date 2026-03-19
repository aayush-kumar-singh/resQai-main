import { Link } from 'react-router-dom'
import type { TickerMessage } from '../../hooks/useUserLanding'

interface StickyHeaderProps {
  tickerMessages: TickerMessage[]
  clock: string
  activeIncidents: number
}

export const StickyHeader = ({ tickerMessages, clock, activeIncidents }: StickyHeaderProps) => {
  const tickerText = tickerMessages.map(m => m.text).join('    ●    ')

  return (
    <header className="user-sticky-header" id="sticky-header">
      <div className="header-left">
        <span className="header-logo">🛡️</span>
        <span className="header-brand">Res<span className="brand-accent">Q</span>AI</span>
      </div>

      <div className="header-ticker">
        <div className="ticker-track">
          <span className="ticker-content">{tickerText}    ●    {tickerText}</span>
        </div>
      </div>

      <div className="header-right">
        <span className="header-clock" aria-live="polite">{clock}</span>
        <span className="header-incidents-pill">
          <span className="pulse-dot" />
          {activeIncidents} Active Incidents
        </span>
        <Link to="/admin" className="admin-login-btn" id="admin-login-btn">
          Admin Login →
        </Link>
      </div>
    </header>
  )
}
