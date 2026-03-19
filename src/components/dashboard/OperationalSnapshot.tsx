import type { DashboardMetrics } from '../../types/report'

interface OperationalSnapshotProps {
  metrics: DashboardMetrics
}

export const OperationalSnapshot = ({ metrics }: OperationalSnapshotProps) => (
  <section className="panel-card metrics-card">
    <div className="card-heading">
      <h2>Operational Snapshot</h2>
      <p>Decision support at a glance</p>
    </div>

    <div className="metrics-grid">
      <article className="metric-tile critical">
        <p className="metric-label">Critical</p>
        <p className="metric-value">{metrics.critical}</p>
      </article>

      <article className="metric-tile high">
        <p className="metric-label">High</p>
        <p className="metric-value">{metrics.high}</p>
      </article>

      <article className="metric-tile neutral">
        <p className="metric-label">Active Zones</p>
        <p className="metric-value">{metrics.activeZones}</p>
      </article>

      <article className="metric-tile neutral">
        <p className="metric-label">Visible Reports</p>
        <p className="metric-value">{metrics.visible}</p>
      </article>
    </div>
  </section>
)
