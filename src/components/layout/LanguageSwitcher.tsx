import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'HI' },
  { code: 'bn', label: 'বাংলা', short: 'BN' }
]

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const currentLang = LANGUAGES.find(l => l.code === i18n.resolvedLanguage?.split('-')[0]) || LANGUAGES[0]

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative z-[200]" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-brand-950/80 border border-brand-500/20 hover:border-brand-500/50 hover:bg-brand-900 transition-all px-3 py-1.5 rounded-xl shadow-lg"
      >
        <Globe size={16} className="text-brand-400" />
        <span className="font-bold text-white text-sm">{currentLang.short}</span>
        <ChevronDown size={14} className={`text-brand-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 right-0 bg-brand-900 border border-brand-500/30 rounded-xl shadow-2xl p-2 w-32 backdrop-blur-xl"
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  currentLang.code === lang.code 
                    ? 'bg-brand-500/20 text-brand-300 pointer-events-none' 
                    : 'text-brand-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
