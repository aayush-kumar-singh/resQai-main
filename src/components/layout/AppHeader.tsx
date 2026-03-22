import { getRelativeTime } from '../../utils/reportUtils'
import { ShieldCheck, Activity } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslation } from 'react-i18next'

interface AppHeaderProps {
  lastUpdateAt: string
}

export const AppHeader = ({ lastUpdateAt }: AppHeaderProps) => {
  const { t } = useTranslation()
  return (
  <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-brand-900 border-b border-brand-500/20 shadow-lg shrink-0 z-10 relative">
    <div className="absolute top-0 left-1/4 w-[300px] h-full bg-alert-500/5 blur-[50px] pointer-events-none" />
    <div className="flex items-start gap-4 relative z-10">
      <div className="w-12 h-12 bg-gradient-to-br from-alert-500 to-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] shrink-0">
        <ShieldCheck className="text-white" size={28} />
      </div>
      <div>
        <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Activity size={14} className="text-brand-400" /> {t('admin.appHeader.aiIntelligence')}
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight">{t('admin.appHeader.title')}</h1>
        <p className="text-sm text-brand-200 mt-1 max-w-xl leading-relaxed hidden sm:block">
          {t('admin.appHeader.subtitle')}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-4 z-10 self-start md:self-auto">
      <div className="bg-brand-950/50 border border-brand-500/20 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-inner relative">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <span className="text-sm font-medium text-emerald-50 whitespace-nowrap">
          {t('admin.appHeader.liveActive')} <span className="text-brand-400 mx-1 md:mx-2">•</span> <span className="text-brand-300">Updated {getRelativeTime(lastUpdateAt)}</span>
        </span>
      </div>
      <div className="shrink-0 flex items-center">
        <LanguageSwitcher />
      </div>
    </div>
  </header>
  )
}
