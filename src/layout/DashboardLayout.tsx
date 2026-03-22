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
    <div className="min-h-screen bg-brand-900 flex flex-col overflow-hidden text-brand-50 font-sans">
      <AppHeader lastUpdateAt={lastUpdateAt} />

      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-6 h-[calc(100vh-88px)]">
        <aside className="w-full lg:w-[480px] xl:w-[540px] flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar shrink-0">
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

        <section className="flex-1 min-h-[500px] lg:min-h-0 relative rounded-2xl overflow-hidden border border-brand-500/20 shadow-2xl bg-brand-950/80">
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
