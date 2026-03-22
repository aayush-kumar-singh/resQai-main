import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronDown, Flame, Waves, Wind, Mountain } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const SafetyGuide = () => {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const GUIDES = [
    {
      title: t('safety.earthquake.title'),
      icon: <Mountain className="text-white" size={24} />,
      color: 'from-amber-500 to-amber-700',
      border: 'border-amber-500/30',
      before: t('safety.earthquake.before', { returnObjects: true }) as string[],
      during: t('safety.earthquake.during', { returnObjects: true }) as string[],
      after: t('safety.earthquake.after', { returnObjects: true }) as string[],
      tip: t('safety.earthquake.tip')
    },
    {
      title: t('safety.flood.title'),
      icon: <Waves className="text-white" size={24} />,
      color: 'from-cyan-500 to-cyan-700',
      border: 'border-cyan-500/30',
      before: t('safety.flood.before', { returnObjects: true }) as string[],
      during: t('safety.flood.during', { returnObjects: true }) as string[],
      after: t('safety.flood.after', { returnObjects: true }) as string[],
      tip: t('safety.flood.tip')
    },
    {
      title: t('safety.fire.title'),
      icon: <Flame className="text-white" size={24} />,
      color: 'from-red-500 to-orange-700',
      border: 'border-red-500/30',
      before: t('safety.fire.before', { returnObjects: true }) as string[],
      during: t('safety.fire.during', { returnObjects: true }) as string[],
      after: t('safety.fire.after', { returnObjects: true }) as string[],
      tip: t('safety.fire.tip')
    },
    {
      title: t('safety.cyclone.title'),
      icon: <Wind className="text-white" size={24} />,
      color: 'from-indigo-500 to-indigo-700',
      border: 'border-indigo-500/30',
      before: t('safety.cyclone.before', { returnObjects: true }) as string[],
      during: t('safety.cyclone.during', { returnObjects: true }) as string[],
      after: t('safety.cyclone.after', { returnObjects: true }) as string[],
      tip: t('safety.cyclone.tip')
    }
  ]

  return (
    <section className="py-24 px-6 md:px-12 bg-brand-900 border-t border-white/5" id="safety-guide">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 border border-emerald-500/20">
             <Shield className="text-emerald-400" size={32}/>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">{t('safety.title')}</h2>
          <p className="text-brand-300 text-lg">{t('safety.subtitle')}</p>
        </div>

        <div className="space-y-4">
          {GUIDES.map((guide, idx) => (
            <div key={guide.title} className={`bg-brand-950/50 border ${guide.border} rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300 shadow-lg`}>
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                type="button"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${guide.color} flex items-center justify-center shadow-inner`}>
                    {guide.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{guide.title}</h3>
                </div>
                <ChevronDown className={`text-brand-400 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} size={24} />
              </button>

              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 border-t border-white/5 mt-4">
                      
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-4 mx-2 md:mx-6">
                         <div className="bg-amber-500/20 p-2 rounded-lg shrink-0">
                           <Shield className="text-amber-400" size={20}/>
                         </div>
                         <div>
                           <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">{t('safety.tip')}</p>
                           <p className="text-amber-100/90 text-sm font-medium">{guide.tip}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2 md:px-6 mb-4">
                        <div className="bg-brand-900 border-l-4 border-yellow-500 p-5 rounded-r-xl shadow-md">
                          <h4 className="font-bold text-yellow-500 mb-4 whitespace-nowrap flex items-center gap-2">
                             📌 {t('safety.before')}
                          </h4>
                          <ul className="text-sm text-brand-200 space-y-3">
                            {guide.before.map((item, i) => <li key={i} className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50 mt-1.5 shrink-0"/>{item}</li>)}
                          </ul>
                        </div>

                        <div className="bg-brand-900 border-l-4 border-red-500 p-5 rounded-r-xl shadow-md">
                          <h4 className="font-bold text-red-500 mb-4 whitespace-nowrap flex items-center gap-2">
                             🚨 {t('safety.during')}
                          </h4>
                          <ul className="text-sm text-brand-200 space-y-3">
                            {guide.during.map((item, i) => <li key={i} className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-1.5 shrink-0"/>{item}</li>)}
                          </ul>
                        </div>

                        <div className="bg-brand-900 border-l-4 border-emerald-500 p-5 rounded-r-xl shadow-md">
                          <h4 className="font-bold text-emerald-500 mb-4 whitespace-nowrap flex items-center gap-2">
                             ✅ {t('safety.after')}
                          </h4>
                          <ul className="text-sm text-brand-200 space-y-3">
                            {guide.after.map((item, i) => <li key={i} className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 shrink-0"/>{item}</li>)}
                          </ul>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
