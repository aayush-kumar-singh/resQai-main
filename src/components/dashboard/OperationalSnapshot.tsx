import type { DashboardMetrics } from '../../types/report'
import { Activity, AlertTriangle, Map, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface OperationalSnapshotProps {
  metrics: DashboardMetrics
}

export const OperationalSnapshot = ({ metrics }: OperationalSnapshotProps) => {
  const { t } = useTranslation()
  return (
    <section className="bg-brand-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-md shadow-xl">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="text-brand-400" size={20} /> {t('admin.snapshot.title')}
        </h2>
        <p className="text-xs text-brand-300 mt-1">{t('admin.snapshot.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <article className="bg-alert-500/10 border border-alert-500/20 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-alert-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <AlertTriangle className="text-alert-400 mb-2" size={20} />
          <p className="text-xs font-bold text-alert-300 uppercase tracking-wider text-center">{t('admin.snapshot.critical')}</p>
          <p className="text-3xl font-black text-white mt-1">{metrics.critical}</p>
        </article>

        <article className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <AlertTriangle className="text-orange-400 mb-2" size={20} />
          <p className="text-xs font-bold text-orange-300 uppercase tracking-wider text-center">{t('admin.snapshot.high')}</p>
          <p className="text-3xl font-black text-white mt-1">{metrics.high}</p>
        </article>

        <article className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Map className="text-brand-400 mb-2" size={20} />
          <p className="text-xs font-bold text-brand-300 uppercase tracking-wider text-center">{t('admin.snapshot.activeZones')}</p>
          <p className="text-3xl font-black text-white mt-1">{metrics.activeZones}</p>
        </article>

        <article className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Eye className="text-cyan-400 mb-2" size={20} />
          <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider text-center">{t('admin.snapshot.visible')}</p>
          <p className="text-3xl font-black text-white mt-1">{metrics.visible}</p>
        </article>
      </div>
    </section>
  )
}
