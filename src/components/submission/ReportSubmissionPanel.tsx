import type { FormEvent } from 'react'
import type { DraftReport } from '../../types/report'
import { PlusCircle, MapPin, Upload, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ReportSubmissionPanelProps {
  draft: DraftReport
  submitStatus: string
  isSubmitting: boolean
  onDraftFieldChange: (field: keyof DraftReport, value: string) => void
  onAutoDetectLocation: () => void
  onSubmitDraft: () => void
}

export const ReportSubmissionPanel = ({
  draft,
  submitStatus,
  isSubmitting,
  onDraftFieldChange,
  onAutoDetectLocation,
  onSubmitDraft,
}: ReportSubmissionPanelProps) => {
  const { t } = useTranslation()
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSubmitDraft()
  }

  return (
    <section className="bg-brand-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col shrink-0">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <PlusCircle className="text-brand-400" size={20} /> {t('admin.submitReport.title')}
        </h2>
        <p className="text-xs text-brand-300 mt-1">{t('admin.submitReport.subtitle')}</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="message" className="block text-[10px] uppercase font-bold text-brand-400 tracking-wider mb-1.5">{t('admin.submitReport.details')}</label>
          <textarea
            id="message"
            className="w-full bg-brand-950/80 border border-brand-500/20 text-brand-50 text-sm rounded-xl p-3 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all placeholder:text-brand-500/40 resize-none h-24 custom-scrollbar"
            value={draft.message}
            onChange={(event) => onDraftFieldChange('message', event.target.value)}
            placeholder={t('admin.submitReport.placeholder')}
            required
          />
        </div>

        <div>
           <label htmlFor="location" className="block text-[10px] uppercase font-bold text-brand-400 tracking-wider mb-1.5 flex items-center gap-1.5">
             <MapPin size={12} /> {t('admin.submitReport.location')}
           </label>
          <div className="flex gap-2 relative">
            <input
              id="location"
              type="text"
              className="flex-1 bg-brand-950/80 border border-brand-500/20 text-brand-50 text-sm rounded-xl pl-3 pr-24 py-2.5 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all placeholder:text-brand-500/40"
              value={draft.location}
              onChange={(event) => onDraftFieldChange('location', event.target.value)}
              placeholder=""
              required
            />
            <button
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 hover:text-white text-xs font-bold rounded-lg transition-colors border border-brand-500/20"
              type="button"
              onClick={onAutoDetectLocation}
            >
              {t('admin.submitReport.autoBtn')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="people" className="block text-[10px] uppercase font-bold text-brand-400 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users size={12}/> {t('admin.submitReport.people')}
            </label>
            <input
              id="people"
              type="number"
              min={1}
              className="w-full bg-brand-950/80 border border-brand-500/20 text-brand-50 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all placeholder:text-brand-500/40"
              value={draft.peopleAffected}
              onChange={(event) => onDraftFieldChange('peopleAffected', event.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div>
             <label htmlFor="image" className="block text-[10px] uppercase font-bold text-brand-400 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Upload size={12}/> {t('admin.submitReport.image')}
            </label>
            <div className="relative w-full h-[42px] bg-brand-950/80 border border-brand-500/20 border-dashed rounded-xl flex items-center justify-center text-brand-400 text-xs hover:bg-brand-900/50 hover:border-brand-500/40 transition-all cursor-pointer overflow-hidden">
               <span className="truncate px-2">{draft.imageName || 'Select File'}</span>
               <input
                id="image"
                className="absolute inset-0 opacity-0 cursor-pointer"
                type="file"
                accept="image/*"
                onChange={(event) => onDraftFieldChange('imageName', event.target.files?.[0]?.name ?? '')}
              />
            </div>
          </div>
        </div>

        <button 
          className="w-full mt-2 bg-gradient-to-r from-alert-500 to-red-600 hover:from-alert-600 hover:to-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-alert-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? t('admin.submitReport.processing') : t('admin.submitReport.submitBtn')}
        </button>

        {submitStatus && (
          <div className="mt-2 p-3 bg-brand-800/50 border border-brand-500/30 rounded-xl text-center">
             <p className="text-sm text-brand-200 font-medium">{submitStatus}</p>
          </div>
        )}
      </form>
    </section>
  )
}
