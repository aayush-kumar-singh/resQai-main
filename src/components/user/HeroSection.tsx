import { useState, useEffect, useRef } from 'react'
import type { StatCard } from '../../hooks/useUserLanding'
import { motion } from 'framer-motion'
import { AlertTriangle, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HeroSectionProps {
  statCards: StatCard[]
}

/* ─── Animated counter hook ─── */
const useCountUp = (target: number, duration = 2000) => {
  const [count, setCount] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) ref.current = requestAnimationFrame(step)
    }
    ref.current = requestAnimationFrame(step)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [target, duration])

  return count
}

const StatCardAnimated = ({ card, index }: { card: StatCard; index: number }) => {
  const { t } = useTranslation()
  const numericValue = parseInt(card.value.replace(/[^\d]/g, ''), 10)
  const count = useCountUp(isNaN(numericValue) ? 0 : numericValue, 2200)
  const labels = ['citizens', 'time', 'volunteers', 'accuracy'] as const

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 text-center overflow-hidden transition-shadow duration-300 hover:shadow-glow-brand hover:border-brand-400/30"
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400/0 to-brand-400/0 group-hover:from-brand-400/5 group-hover:to-transparent transition-all duration-500 rounded-2xl" />
      <div className="relative z-10">
        <div className="text-3xl mb-3 flex justify-center">{card.icon}</div>
        <p className="text-4xl font-extrabold text-white mb-2 tabular-nums">
          {isNaN(numericValue) ? card.value : count}
          <span className="text-brand-300 text-2xl ml-1">{card.suffix}</span>
        </p>
        <p className="text-brand-200/70 font-semibold uppercase tracking-wider text-xs">
          {t(`hero.stats.${labels[index]}`)}
        </p>
      </div>
    </motion.article>
  )
}

export const HeroSection = ({ statCards }: HeroSectionProps) => {
  const { t } = useTranslation()
  return (
  <section className="relative bg-brand-900 border-b border-white/[0.06] text-white overflow-hidden py-28 px-6 md:px-12">

    {/* ─── Background floating orbs ─── */}
    <motion.div
      animate={{ y: [0, -25, 0], x: [0, 10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-brand-400/[0.08] blur-[120px] rounded-full pointer-events-none"
    />
    <motion.div
      animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      className="absolute bottom-[-15%] right-[10%] w-[600px] h-[600px] bg-brand-500/[0.06] blur-[140px] rounded-full pointer-events-none"
    />
    <motion.div
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-alert-500/[0.04] blur-[100px] rounded-full pointer-events-none"
    />

    {/* ─── Grid pattern overlay ─── */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
      backgroundSize: '60px 60px'
    }} />

    <div className="relative max-w-6xl mx-auto z-10 flex flex-col items-center">
      <div className="text-center mb-16 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-alert-500/10 text-alert-400 px-5 py-2 rounded-full text-sm font-semibold mb-8 inline-flex items-center gap-2 border border-alert-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          >
            <span className="w-2 h-2 rounded-full bg-alert-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            {t('hero.liveIntel')}
          </motion.span>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08]">
            {t('hero.title1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-200 to-cyan-300 animate-gradient" style={{ backgroundSize: '200% auto' }}>
              {t('hero.title2')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-brand-100/60 max-w-2xl text-center mb-12 leading-relaxed font-medium">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center w-full gap-4">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const portal = document.querySelector('.portal-section')
                if (portal) portal.scrollIntoView({ behavior: 'smooth' })
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-alert-500 to-red-600 hover:from-alert-400 hover:to-red-500 transition-all text-white px-8 py-4 rounded-xl font-bold shadow-glow-alert hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] w-full sm:w-auto"
            >
              <AlertTriangle size={20} /> {t('hero.reportBtn')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                 window.location.href = '/admin'
              }}
              className="flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-brand-400/30 backdrop-blur-md transition-all text-white px-8 py-4 rounded-xl font-bold hover:shadow-glow-brand w-full sm:w-auto"
            >
              <MapPin size={20} /> {t('hero.mapBtn')}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full">
        {statCards.map((card, idx) => (
          <StatCardAnimated key={card.label} card={card} index={idx} />
        ))}
      </div>
    </div>
  </section>
  )
}
