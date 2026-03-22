import type { Report } from '../../types/report'
import { FileText, AlertCircle, Sparkles, Navigation } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ReportDetailPanelProps {
  selectedReport: Report | null
}

export const ReportDetailPanel = ({ selectedReport }: ReportDetailPanelProps) => {
  const { t } = useTranslation()
  return (
    <section className="bg-brand-900/50 border border-white/5 rounded-2xl flex flex-col backdrop-blur-md shadow-xl p-5 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="text-brand-400" size={20} /> {t('admin.detail.title')}
        </h2>
        <p className="text-xs text-brand-300 mt-1">{t('admin.detail.subtitle')}</p>
      </div>

      {selectedReport ? (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-brand-950/50 p-4 rounded-xl border border-brand-500/10">
            <p className="text-sm text-brand-50 leading-relaxed font-medium">"{selectedReport.message}"</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-brand-950/30 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] uppercase font-bold text-brand-400 tracking-wider mb-1">{t('admin.detail.type')}</p>
              <p className="text-sm font-semibold text-white">{selectedReport.disasterType}</p>
            </div>

            <div className="bg-brand-950/30 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] uppercase font-bold text-brand-400 tracking-wider mb-1">{t('admin.detail.location')}</p>
              <p className="text-sm font-semibold text-white">{selectedReport.location}</p>
            </div>

            <div className="bg-brand-950/30 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] uppercase font-bold text-brand-400 tracking-wider mb-1">{t('admin.detail.impact')}</p>
              <p className="text-sm font-semibold text-white">{selectedReport.peopleAffected} {t('admin.liveFeed.affected')}</p>
            </div>

            <div className="bg-brand-950/30 p-3 rounded-lg border border-white/5">
              <p className="text-[10px] uppercase font-bold text-brand-400 tracking-wider mb-1">{t('admin.detail.source')}</p>
              <p className="text-sm font-semibold text-white">{selectedReport.source}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 to-brand-900/80 p-4">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={64} />
            </div>
            <div className="flex justify-between items-end mb-3 relative z-10">
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles size={12} /> {t('admin.detail.aiAssessment')}
                </p>
                <p className="text-2xl font-black text-white">
                  {selectedReport.priorityScore}<span className="text-sm text-indigo-200 font-bold ml-1">/ 100</span>
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                selectedReport.priorityLabel === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                selectedReport.priorityLabel === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                selectedReport.priorityLabel === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {selectedReport.priorityLabel}
              </span>
            </div>
            
            <div className="h-1.5 w-full bg-brand-950 rounded-full overflow-hidden mb-3 relative z-10">
              <div 
                className={`h-full rounded-full ${
                  selectedReport.priorityLabel === 'Critical' ? 'bg-red-500' :
                  selectedReport.priorityLabel === 'High' ? 'bg-orange-500' :
                  selectedReport.priorityLabel === 'Medium' ? 'bg-yellow-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${selectedReport.priorityScore}%` }}
              />
            </div>
            <p className="text-xs text-indigo-100/80 leading-relaxed font-medium mt-2 relative z-10">
              {selectedReport.priorityExplanation}
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Navigation size={12} /> {t('admin.detail.recommended')}
            </p>
            <p className="text-sm text-amber-50 font-medium leading-relaxed">
              {selectedReport.recommendedAction}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 opacity-50">
          <AlertCircle size={32} className="text-brand-400 mb-3" />
          <p className="text-sm text-brand-300 text-center">{t('admin.detail.empty')}</p>
        </div>
      )}
    </section>
  )
}
