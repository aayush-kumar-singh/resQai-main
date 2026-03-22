import { motion } from 'framer-motion'
import { Radio, BrainCircuit, Map, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const HowItWorks = () => {
  const { t } = useTranslation()

  const STEPS = [
    { icon: <Radio className="w-8 h-8 text-blue-400" />, title: t('portal.howItWorks.s1Title'), desc: t('portal.howItWorks.s1Desc') },
    { icon: <BrainCircuit className="w-8 h-8 text-purple-400" />, title: t('portal.howItWorks.s2Title'), desc: t('portal.howItWorks.s2Desc') },
    { icon: <Map className="w-8 h-8 text-emerald-400" />, title: t('portal.howItWorks.s3Title'), desc: t('portal.howItWorks.s3Desc') },
    { icon: <Truck className="w-8 h-8 text-alert-500" />, title: t('portal.howItWorks.s4Title'), desc: t('portal.howItWorks.s4Desc') },
  ]

  return (
  <section className="py-24 px-6 md:px-12 bg-brand-900 border-b border-white/5 relative overflow-hidden" id="how-it-works">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
    
    <div className="max-w-6xl mx-auto relative z-10 text-center">
      <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">{t('portal.howItWorks.title')}</h2>
      <p className="text-brand-200 mb-16 text-lg">{t('portal.howItWorks.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500/0 via-brand-500/50 to-alert-500/0 z-0" />

        {STEPS.map((step, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            key={step.title} 
            className="relative z-10 hidden md:flex flex-col items-center group"
          >
            <div className="w-24 h-24 mb-6 rounded-2xl bg-brand-800/80 border border-brand-500/30 flex items-center justify-center shadow-lg group-hover:-translate-y-2 group-hover:shadow-brand-500/20 transition-all backdrop-blur-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {step.icon}
            </div>
            <span className="text-xs font-bold text-brand-400 mb-2 tracking-wider">{t('portal.howItWorks.step')} {i + 1}</span>
            <h3 className="text-xl font-bold text-brand-50 mb-3">{step.title}</h3>
            <p className="text-brand-200 text-sm leading-relaxed px-4">{step.desc}</p>
          </motion.div>
        ))}

        {STEPS.map((step, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            key={step.title + "-mobile"} 
            className="flex flex-col items-center md:hidden relative z-10 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
          >
            <span className="absolute top-4 left-6 text-xs font-bold text-brand-400 tracking-wider">0{i + 1}</span>
            <div className="mb-4 mt-6">{step.icon}</div>
            <h3 className="text-xl font-bold text-brand-50 mb-2">{step.title}</h3>
            <p className="text-brand-200 text-sm leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  )
}
