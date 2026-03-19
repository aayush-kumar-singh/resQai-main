import { LiveFeedPanel } from '../components/dashboard/LiveFeedPanel'
import { OperationalSnapshot } from '../components/dashboard/OperationalSnapshot'
import { ReportDetailPanel } from '../components/dashboard/ReportDetailPanel'
import { AppHeader } from '../components/layout/AppHeader'
import { IncidentMapPanel } from '../components/map/IncidentMapPanel'
import { ReportSubmissionPanel } from '../components/submission/ReportSubmissionPanel'
import { useResqaiDashboard } from '../hooks/useResqaiDashboard'

export const DashboardLayout = () => {
  const {
    reports,
    filteredReports,
    selectedReport,
    metrics,
    hotspotClusters,
    aiInsights,
    draft,
    submitStatus,
    priorityFilter,
    disasterFilter,
    lastUpdateAt,
    isSubmitting,
    setPriorityFilter,
    setDisasterFilter,
    selectReport,
    updateDraftField,
    autoDetectLocation,
    submitDraft,
  } = useResqaiDashboard()

  return (
    <div className="app-shell">
      <AppHeader lastUpdateAt={lastUpdateAt} />

      <main className="dashboard-grid">
        <aside className="left-panel">
          <OperationalSnapshot metrics={metrics} />

          <ReportSubmissionPanel
            draft={draft}
            submitStatus={submitStatus}
            isSubmitting={isSubmitting}
            onDraftFieldChange={updateDraftField}
            onAutoDetectLocation={autoDetectLocation}
            onSubmitDraft={submitDraft}
          />

          <LiveFeedPanel
            reportsCount={reports.length}
            filteredReports={filteredReports}
            selectedReportId={selectedReport?.id ?? null}
            priorityFilter={priorityFilter}
            disasterFilter={disasterFilter}
            onPriorityFilterChange={setPriorityFilter}
            onDisasterFilterChange={setDisasterFilter}
            onSelectReport={selectReport}
          />

          <ReportDetailPanel selectedReport={selectedReport} />
        </aside>

        <section className="right-panel">
          <IncidentMapPanel
            filteredReports={filteredReports}
            selectedReport={selectedReport}
            hotspotClusters={hotspotClusters}
            aiInsights={aiInsights}
            onSelectReport={selectReport}
          />
        </section>
      </main>
    </div>
  )
}
