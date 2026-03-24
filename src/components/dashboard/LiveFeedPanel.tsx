import { DISASTER_TYPES } from '../../data/reportData'
import type { DisasterFilter, PriorityFilter, Report } from '../../types/report'
import {  getRelativeTime, truncateMessage } from '../../utils/reportUtils'
import { Filter, Clock, Activity, Users, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
}: LiveFeedPanelProps) => {
  const { t } = useTranslation()
  return (
    <section className="bg-brand-900/50 border border-white/5 rounded-2xl flex flex-col backdrop-blur-md shadow-xl max-h-[600px] overflow-hidden">
      <div className="p-5 border-b border-brand-500/20 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="text-brand-400" size={20} /> {t('admin.liveFeed.title')}
            </h2>
            <p className="text-xs text-brand-300 mt-1">
              {t('admin.liveFeed.subtitle', { shown: filteredReports.length, total: reportsCount })}
            </p>
          </div>
          <div className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/30 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs font-bold text-brand-300 uppercase tracking-widest">{t('admin.liveFeed.live')}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="priority-filter" className="sr-only">Priority</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="text-brand-400" size={14} />
              </div>
              <select
                id="priority-filter"
                className="w-full bg-brand-950/80 border border-brand-500/20 text-brand-100 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-brand-500/50 appearance-none"
                value={priorityFilter}
                onChange={(e) => onPriorityFilterChange(e.target.value as PriorityFilter)}
              >
                <option value="All">{t('admin.liveFeed.allPriority')}</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="disaster-filter" className="sr-only">Disaster Type</label>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Filter className="text-brand-400" size={14} />
              </div>
              <select
                id="disaster-filter"
                className="w-full bg-brand-950/80 border border-brand-500/20 text-brand-100 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-brand-500/50 appearance-none"
                value={disasterFilter}
                onChange={(e) => onDisasterFilterChange(e.target.value as DisasterFilter)}
              >
                <option value="All">{t('admin.liveFeed.allTypes')}</option>
                {DISASTER_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar" aria-live="polite">
        {filteredReports.map((report) => (
          <li key={report.id}>
            <button
              type="button"
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
                selectedReportId === report.id
                  ? 'bg-brand-500/20 border-brand-500/50 shadow-lg'
                  : 'bg-brand-950/40 border-brand-500/10 hover:bg-brand-900 hover:border-brand-500/30'
              }`}
              onClick={() => onSelectReport(report.id)}
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <p className="text-sm font-medium text-brand-50 leading-snug line-clamp-2">
                  {truncateMessage(report.message, 80)}
                </p>
                <span className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                  report.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                  report.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                  report.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {report.severity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs text-brand-300">
                <div className="flex items-center gap-1.5 line-clamp-1"><MapPin size={12} className="text-brand-400 shrink-0"/> <span className="truncate">{report.location}</span></div>
                <div className="flex items-center gap-1.5"><Activity size={12} className="text-brand-400 shrink-0"/> {report.disasterType}</div>
                <div className="flex items-center gap-1.5"><Users size={12} className="text-brand-400 shrink-0"/> {report.peopleAffected} {t('admin.liveFeed.affected')}</div>
                <div className="flex items-center gap-1.5"><Clock size={12} className="text-brand-400 shrink-0"/> {getRelativeTime(report.createdAt)}</div>
              </div>
            </button>
          </li>
        ))}

        {filteredReports.length === 0 ? (
          <li className="p-8 text-center text-brand-400 text-sm border border-dashed border-brand-500/20 rounded-xl m-2 bg-brand-950/50">
            {reportsCount === 0
              ? t('admin.liveFeed.noReports')
              : t('admin.liveFeed.empty')}
          </li>
        ) : null}
      </ul>
    </section>
  )
}
