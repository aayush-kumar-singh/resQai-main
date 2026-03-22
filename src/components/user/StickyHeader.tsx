import { Link } from 'react-router-dom'
import type { TickerMessage } from '../../hooks/useUserLanding'
import { motion } from 'framer-motion'
import { ShieldAlert, ChevronRight } from 'lucide-react'
import { LanguageSwitcher } from '../layout/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

interface StickyHeaderProps {
  tickerMessages: TickerMessage[]
  clock: string
  activeIncidents: number
}

export const StickyHeader = ({ tickerMessages, clock, activeIncidents }: StickyHeaderProps) => {
  const { t } = useTranslation()
  const tickerText = tickerMessages.map(m => m.text).join('    ●    ')

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 flex items-center gap-4 px-6 bg-brand-900/80 border-b border-brand-400/10 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.4),_0_1px_0_inset_rgba(255,255,255,0.04)]">
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400/20 to-transparent" />

      <div className="flex items-center gap-2 shrink-0">
        <ShieldAlert className="text-brand-400" size={24} />
        <span className="text-xl font-extrabold text-brand-50 tracking-tight">Res<span className="text-brand-300">Q</span>AI</span>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden relative" style={{ maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}>
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex w-max"
        >
          <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-brand-200/50 pr-16">{tickerText}    ●    {tickerText}</span>
        </motion.div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <LanguageSwitcher />
        <span className="hidden md:inline-block font-mono text-xs font-bold text-brand-300 bg-brand-950/60 px-3 py-1.5 rounded-lg border border-brand-400/15 backdrop-blur-md">
          {clock}
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-alert-500/8 border border-alert-500/20 rounded-full text-xs font-bold text-alert-400 whitespace-nowrap backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-alert-500 animate-[pulse_2s_infinite] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          {activeIncidents} Active
        </span>
        <Link to="/admin" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-white text-sm font-bold shadow-glow-brand/30 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-glow-brand">
          {t('nav.adminLogin')} <ChevronRight size={16} />
        </Link>
      </div>
    </header>
  )
}
