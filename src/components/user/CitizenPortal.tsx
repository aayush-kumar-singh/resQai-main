import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, MapPin, Camera, CheckCircle2, 
  Search, Phone, Users, ClipboardList, Navigation
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type {
  Incident,
  IncidentDraft,
  TrackedReport,
  VolunteerForm,
  HelplineInfo,
} from '../../hooks/useUserLanding'
import { SafeRouteMap } from '../map/SafeRouteMap'

interface CitizenPortalProps {
  activeTab: number
  setActiveTab: (i: number) => void

  /* Incident */
  incidentDraft: IncidentDraft
  submittedIncidents: Incident[]
  lastSubmittedId: string | null
  submitStatusMsg: string | null
  isSubmitting: boolean
  updateIncidentField: <K extends keyof IncidentDraft>(field: K, value: IncidentDraft[K]) => void
  submitIncident: () => void
  disasterOptions: string[]

  /* Track */
  trackingId: string
  setTrackingId: (v: string) => void
  trackedReport: TrackedReport | null
  trackReport: () => void

  /* Volunteer */
  volunteer: VolunteerForm
  volunteerSubmitted: boolean
  updateVolunteerField: <K extends keyof VolunteerForm>(field: K, value: VolunteerForm[K]) => void
  toggleSkill: (skill: string) => void
  submitVolunteer: () => void
  availableSkills: string[]
  districts: string[]

  /* Helplines */
  helplines: HelplineInfo[]
}

export const CitizenPortal = (props: CitizenPortalProps) => {
  const { t } = useTranslation()
  const [wizardStep, setWizardStep] = useState(1)

  const TABS = [
    { id: 0, label: t('portal.tabs.report'), icon: <AlertTriangle size={16}/> },
    { id: 1, label: t('portal.tabs.track'), icon: <Search size={16}/> },
    { id: 2, label: t('portal.tabs.volunteer'), icon: <Users size={16}/> },
    { id: 3, label: t('portal.tabs.helplines'), icon: <Phone size={16}/> },
    { id: 4, label: t('portal.tabs.safeRoute'), icon: <Navigation size={16}/> }
  ]

  const handleIncidentSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (wizardStep < 3) {
      setWizardStep(p => p + 1)
      return
    }
    // submitIncident returns true if this was a duplicate (merged), false if new
    const isDuplicate = await props.submitIncident()
    if (!isDuplicate) {
      setWizardStep(4) // success screen
    }
    // If duplicate, stay on step 3 — the amber banner will appear via submitStatusMsg
  }
  const handleVolunteerSubmit = (e: FormEvent) => { e.preventDefault(); props.submitVolunteer() }
  const handleTrack = (e: FormEvent) => { e.preventDefault(); props.trackReport() }

  return (
    <section className="py-24 px-6 md:px-12 bg-brand-950 relative" id="citizen-portal">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-3">{t('portal.title')}</h2>
          <p className="text-brand-300 text-lg">{t('portal.subtitle')}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={props.activeTab === tab.id}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                props.activeTab === tab.id 
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
                : 'bg-white/5 text-brand-300 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                props.setActiveTab(tab.id)
                if (tab.id === 0) setWizardStep(1)
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-brand-900 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[100px] rounded-full pointer-events-none" />

          {/* ─── TAB 0: Report Incident WIZARD ─── */}
          {props.activeTab === 0 && (
            <div className="relative z-10 w-full max-w-2xl mx-auto">
              {wizardStep < 4 && (
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    {[1, 2, 3].map(step => (
                      <div key={step} className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                        step <= wizardStep ? 'bg-alert-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white/10'
                      }`} />
                    ))}
                  </div>
                  <p className="text-center text-brand-300 text-sm font-medium uppercase tracking-widest mt-4">
                    {t('portal.wizard.step', { current: wizardStep, total: 3 })}
                  </p>
                </div>
              )}

              {/* Duplicate dispatch banner */}
              {props.submitStatusMsg && (
                <div className="mb-6 p-4 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 font-semibold text-sm flex items-start gap-3">
                  <span className="text-xl">🚨</span>
                  <span>{props.submitStatusMsg}</span>
                </div>
              )}

              <form onSubmit={handleIncidentSubmit}>
                <AnimatePresence mode="wait">
                  {wizardStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-6 text-center">{t('portal.wizard.q1')}</h3>
                      
                      <div>
                        <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">{t('portal.wizard.disasterType')}</label>
                        <select
                          className="w-full bg-brand-950 border border-brand-500/20 text-white rounded-xl p-4 focus:ring-2 focus:ring-brand-500/50 outline-none"
                          value={props.incidentDraft.disasterType}
                          onChange={e => props.updateIncidentField('disasterType', e.target.value)}
                          required
                        >
                          <option value="">...</option>
                          {props.disasterOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-3">{t('portal.wizard.severity')}</label>
                        <div className="flex flex-wrap gap-2">
                          {['Low', 'Medium', 'High', 'Critical'].map(s => (
                            <label key={s} className={`flex flex-1 items-center justify-center p-4 rounded-xl border font-bold cursor-pointer transition-all ${
                              props.incidentDraft.severity === s 
                              ? (s === 'Critical' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 
                                s === 'High' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' :
                                'bg-brand-500/20 border-brand-500/50 text-brand-300')
                              : 'bg-brand-950 border-white/10 text-brand-400 hover:bg-white/5'
                            }`}>
                              <input type="radio" className="hidden" name="severity" value={s} checked={props.incidentDraft.severity === s} onChange={() => props.updateIncidentField('severity', s)} />
                              <span className="font-bold">
                                {s === 'Low' && t('portal.severity.low')}
                                {s === 'Medium' && t('portal.severity.medium')}
                                {s === 'High' && t('portal.severity.high')}
                                {s === 'Critical' && t('portal.severity.critical')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">{t('portal.wizard.description')}</label>
                        <textarea
                          className="w-full bg-brand-950 border border-brand-500/20 text-white rounded-xl p-4 focus:ring-2 focus:ring-brand-500/50 outline-none resize-none h-32"
                          value={props.incidentDraft.description}
                          onChange={e => props.updateIncidentField('description', e.target.value)}
                          placeholder={t('portal.wizard.descPlaceholder')}
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {wizardStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-6 text-center">{t('portal.wizard.q2')}</h3>
                      
                      <div>
                        <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">{t('portal.wizard.location')}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-brand-950 border border-brand-500/20 text-white rounded-xl p-4 focus:ring-2 focus:ring-brand-500/50 outline-none"
                            value={props.incidentDraft.location}
                            onChange={e => props.updateIncidentField('location', e.target.value)}
                            placeholder={t('portal.wizard.locPlaceholder')}
                            required
                          />
                          <button 
                            type="button"
                            className="bg-brand-800 hover:bg-brand-700 text-white px-6 rounded-xl font-bold transition-colors flex items-center gap-2"
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  ({ coords }) => props.updateIncidentField('location', `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`)
                                )
                              }
                            }}
                          >
                            <MapPin size={18}/> {t('portal.wizard.gpsBtn')}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">{t('portal.wizard.evidence')}</label>
                        <div className="w-full relative border-2 border-dashed border-brand-500/30 rounded-xl p-8 text-center hover:bg-brand-500/5 transition-colors cursor-pointer group">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={e => props.updateIncidentField('file', e.target.files?.[0] ?? null)}
                          />
                          <Camera className="mx-auto text-brand-500 mb-3 group-hover:scale-110 transition-transform" size={32}/>
                          <p className="text-brand-300 font-medium">{t('portal.wizard.uploadText')}</p>
                          {props.incidentDraft.file && <p className="text-emerald-400 text-sm mt-2 font-bold">{t('portal.wizard.attached', { filename: props.incidentDraft.file.name })}</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {wizardStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-6 text-center">{t('portal.wizard.q3')}</h3>

                      <label className="flex items-center gap-3 p-4 bg-brand-950 border border-brand-500/20 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                        <div className={`w-6 h-6 rounded border flex items-center justify-center ${props.incidentDraft.anonymous ? 'bg-alert-500 border-alert-500' : 'border-brand-500/50'}`}>
                          {props.incidentDraft.anonymous && <CheckCircle2 size={16} className="text-white"/>}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={props.incidentDraft.anonymous}
                          onChange={e => props.updateIncidentField('anonymous', e.target.checked)}
                        />
                        <span className="font-bold text-white">{t('portal.wizard.anonLabel')}</span>
                      </label>
                      
                      {!props.incidentDraft.anonymous && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">{t('portal.wizard.nameLabel')}</label>
                            <input
                              type="text"
                              className="w-full bg-brand-950 border border-brand-500/20 text-white rounded-xl p-4 focus:ring-2 focus:ring-brand-500/50 outline-none"
                              value={props.incidentDraft.reporterName}
                              onChange={e => props.updateIncidentField('reporterName', e.target.value)}
                              placeholder=""
                              required={!props.incidentDraft.anonymous}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">{t('portal.wizard.phoneLabel')}</label>
                            <input
                              type="tel"
                              className="w-full bg-brand-950 border border-brand-500/20 text-white rounded-xl p-4 focus:ring-2 focus:ring-brand-500/50 outline-none"
                              value={props.incidentDraft.reporterPhone}
                              onChange={e => props.updateIncidentField('reporterPhone', e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                              required={!props.incidentDraft.anonymous}
                            />
                          </div>
                        </div>
                      )}

                      <div className="bg-alert-500/10 border border-alert-500/20 p-4 rounded-xl flex items-start gap-3 mt-4">
                        <AlertTriangle className="text-alert-400 shrink-0 mt-0.5" size={20}/>
                        <p className="text-sm text-alert-100/90 leading-relaxed font-medium">{t('portal.wizard.warning')}</p>
                      </div>
                    </motion.div>
                  )}

                  {wizardStep === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-6">
                      <div className="w-24 h-24 bg-emerald-500/20 flex items-center justify-center rounded-full mx-auto mb-6">
                        <CheckCircle2 size={48} className="text-emerald-400" />
                      </div>
                      <h3 className="text-3xl font-extrabold text-white">{t('portal.wizard.successTitle')}</h3>
                      <p className="text-brand-200 text-lg max-w-md mx-auto">{t('portal.wizard.successDesc')}</p>
                      {props.lastSubmittedId && (
                        <div className="bg-brand-950 border border-brand-500/30 p-6 rounded-2xl max-w-sm mx-auto mt-6">
                          <p className="text-brand-400 text-sm font-bold uppercase tracking-wider mb-2">{t('portal.wizard.trackingId')}</p>
                          <p className="text-3xl font-mono font-bold text-white tracking-widest">{props.lastSubmittedId}</p>
                        </div>
                      )}
                      <button 
                        type="button" 
                        onClick={() => { setWizardStep(1); props.setActiveTab(1); props.setTrackingId(props.lastSubmittedId || '') }} 
                        className="text-brand-400 hover:text-white font-bold transition-colors mt-6 inline-block"
                      >
                        {t('portal.wizard.trackStatus')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {wizardStep < 4 && (
                  <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
                    {wizardStep > 1 && (
                      <button type="button" onClick={() => setWizardStep(p => p - 1)} className="px-6 py-4 rounded-xl font-bold text-brand-300 hover:text-white hover:bg-white/5 transition-colors">
                        {t('portal.wizard.back')}
                      </button>
                    )}
                    <button type="submit" disabled={props.isSubmitting} className="flex-1 bg-gradient-to-r from-alert-500 to-red-600 hover:from-alert-600 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-alert-500/25 transition-all text-lg flex items-center justify-center gap-2">
                       {props.isSubmitting ? t('portal.wizard.processing') : (wizardStep === 3 ? t('portal.wizard.submit') : t('portal.wizard.continue'))}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ─── TAB 1: Track Report ─── */}
          {props.activeTab === 1 && (
             <div className="relative z-10 w-full max-w-2xl mx-auto py-8">
               <form onSubmit={handleTrack} className="mb-10">
                 <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">{t('portal.track.enterId')}</label>
                 <div className="flex gap-3 relative">
                   <div className="relative flex-1">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" size={20}/>
                     <input
                        type="text"
                        className="w-full bg-brand-950 border border-brand-500/20 text-white rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-brand-500/50 outline-none font-mono text-lg transition-transform"
                        value={props.trackingId}
                        onChange={e => props.setTrackingId(e.target.value)}
                        placeholder={t('portal.track.placeholder')}
                        required
                      />
                   </div>
                    <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white px-8 rounded-xl font-bold transition-colors shadow-lg shrink-0">
                      {t('portal.track.trackBtn')}
                    </button>
                 </div>
               </form>

               {props.trackedReport && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-950/50 border border-white/10 rounded-2xl p-6 md:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                       <div className="text-center p-4 bg-brand-900 rounded-xl border border-brand-500/20">
                         <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider mb-1">{t('portal.track.status')}</p>
                         <p className="text-emerald-400 font-bold">{props.trackedReport.status}</p>
                       </div>
                       <div className="text-center p-4 bg-brand-900 rounded-xl border border-brand-500/20">
                         <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider mb-1">{t('portal.track.aiPriority')}</p>
                         <p className="text-alert-400 font-bold">{props.trackedReport.priority}</p>
                       </div>
                       <div className="text-center p-4 bg-brand-900 rounded-xl border border-brand-500/20">
                         <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider mb-1">{t('portal.track.response')}</p>
                         <p className="text-white font-bold">{props.trackedReport.teams}</p>
                       </div>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><ClipboardList className="text-brand-400"/> {t('portal.track.timeline')}</h4>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-500 before:to-transparent">
                      {props.trackedReport.timeline.map((step, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-brand-900 bg-brand-950 shrink-0 shadow-inner z-10 ${step.done ? 'text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'text-brand-500'} md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                             {step.done ? <CheckCircle2 size={16}/> : <div className="w-2 h-2 rounded-full bg-brand-500"/>}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-brand-900 p-4 rounded-xl border border-brand-500/20 shadow-md">
                            <time className="text-xs font-mono text-brand-400 mb-1 block">{step.time}</time>
                            <p className="text-sm font-bold text-brand-50">{step.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
               )}
             </div>
          )}

          {props.activeTab === 2 && (
             <div className="relative z-10 w-full max-w-2xl mx-auto py-8 text-center text-brand-300">
                <Users size={64} className="mx-auto text-brand-500 mb-6 opacity-50" />
                <h3 className="text-2xl font-bold text-white mb-4">{t('portal.volunteer.title')}</h3>
                <p className="mb-8">{t('portal.volunteer.desc')}</p>
                <form onSubmit={handleVolunteerSubmit} className="text-left space-y-6">
                  {/* Basic fallback form styling with Tailwind. Ideally we could detail it out further. */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input type="text" placeholder={t('portal.volunteer.name')} className="w-full bg-brand-950 border border-brand-500/20 text-white rounded-xl p-4" required/>
                     <input type="tel" placeholder={t('portal.volunteer.phone')} className="w-full bg-brand-950 border border-brand-500/20 text-white rounded-xl p-4" required/>
                  </div>
                  <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1">
                     {t('portal.volunteer.submit')}
                  </button>
                </form>
             </div>
          )}

          {props.activeTab === 3 && (
            <div className="relative z-10 w-full py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {props.helplines.map(h => (
                   <div key={h.id} className="bg-brand-950/50 border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-brand-500/30 transition-colors">
                      <div className="text-4xl">{h.icon}</div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">{h.name}</p>
                        <p className="font-mono text-brand-400 mt-1">{h.number}</p>
                      </div>
                      <a href={`tel:${h.number}`} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer">Call</a>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {props.activeTab === 4 && (
            <SafeRouteMap />
          )}
        </div>
      </div>
    </section>
  )
}
