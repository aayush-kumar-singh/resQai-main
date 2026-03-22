import type { HelplineInfo } from '../../hooks/useUserLanding'
import { useTranslation } from 'react-i18next'

interface LiveHelplinePanelProps {
  helplines: HelplineInfo[]
}

const statusClass = (s: string) =>
  s === 'ONLINE' ? 'badge-online' : s === 'HIGH LOAD' ? 'badge-high-load' : 'badge-offline'

export const LiveHelplinePanel = ({ helplines }: LiveHelplinePanelProps) => {
  const { t } = useTranslation()
  return (
  <section className="helpline-section" id="helpline-panel">
    <h2 className="section-title">{t('portal.helplinePanel.title')}</h2>
    <p className="section-subtitle">{t('portal.helplinePanel.subtitle')}</p>

    <div className="helpline-grid">
      {helplines.map(h => (
        <article key={h.id} className="helpline-card">
          <div className="helpline-top">
            <span className="helpline-icon">{h.icon}</span>
            <div>
              <p className="helpline-name">{h.name}</p>
              <p className="helpline-number">{h.number}</p>
            </div>
            <span className={`helpline-badge ${statusClass(h.status)}`}>{h.status}</span>
          </div>

          <div className="helpline-stats">
            <div className="helpline-stat">
              <span className="hs-label">{t('portal.helplinePanel.activeCalls')}</span>
              <span className="hs-value">{h.calls}</span>
            </div>
            <div className="helpline-stat">
              <span className="hs-label">{t('portal.helplinePanel.waitTime')}</span>
              <span className="hs-value">{h.waitTime}</span>
            </div>
            <div className="helpline-stat">
              <span className="hs-label">{t('portal.helplinePanel.operators')}</span>
              <span className="hs-value">{h.operators}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
  )
}
