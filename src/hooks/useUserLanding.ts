import { useCallback, useEffect, useRef, useState } from 'react'
import { useSharedReports } from '../context/ReportsContext'
import { useTranslation } from 'react-i18next'
import {
  deriveCoords,
} from '../utils/reportUtils'
import type { Report } from '../types/report'

/* ─── Helpline Types ─── */
export type HelplineStatus = 'ONLINE' | 'HIGH LOAD' | 'OFFLINE'

export interface HelplineInfo {
  id: string
  name: string
  number: string
  icon: string
  status: HelplineStatus
  calls: number
  waitTime: string
  operators: number
}

/* ─── Ticker ─── */
export interface TickerMessage {
  id: number
  text: string
  type: 'critical' | 'high' | 'info'
}

/* ─── Report Tracking ─── */
export interface TrackedReport {
  id: string
  priority: string
  teams: number
  status: string
  timeline: { time: string; label: string; done: boolean }[]
}

/* ─── Volunteer ─── */
export interface VolunteerForm {
  name: string
  phone: string
  email: string
  district: string
  availability: string
  skills: string[]
}

/* ─── Incident Report (Draft = form state) ─── */
export interface IncidentDraft {
  disasterType: string
  severity: string
  location: string
  description: string
  source: string
  file: File | null
  anonymous: boolean
  reporterName: string
  reporterPhone: string
  reporterEmail: string
}

/* ─── Submitted Incident (stored in central array) ─── */
export interface Incident {
  id: string
  type: string
  severity: string
  location: string
  description: string
  source: string
  time: string
  reporterName: string
  reporterPhone: string
  reporterEmail: string
}

/* ─── Stat Card ─── */
export interface StatCard {
  label: string
  value: string
  suffix: string
  icon: string
}

const STAT_CARDS: StatCard[] = [
  { label: 'Signals Processed', value: '124,847', suffix: '', icon: '📡' },
  { label: 'Teams Active', value: '38', suffix: '', icon: '🚒' },
  { label: 'Avg Response Time', value: '4.2', suffix: ' min', icon: '⚡' },
  { label: 'Lives Impacted', value: '12,400', suffix: '+', icon: '🛡️' },
]

const INITIAL_HELPLINES: HelplineInfo[] = [
  { id: 'h1', name: 'Disaster Management', number: '1078', icon: '🌊', status: 'ONLINE', calls: 342, waitTime: '~2 min', operators: 24 },
  { id: 'h2', name: 'Ambulance', number: '108', icon: '🚑', status: 'HIGH LOAD', calls: 891, waitTime: '~8 min', operators: 18 },
  { id: 'h3', name: 'Fire Service', number: '101', icon: '🔥', status: 'ONLINE', calls: 156, waitTime: '~1 min', operators: 30 },
  { id: 'h4', name: 'Police', number: '100', icon: '🚔', status: 'ONLINE', calls: 567, waitTime: '~3 min', operators: 45 },
  { id: 'h5', name: 'Flood Helpline', number: '1800-XXX', icon: '💧', status: 'HIGH LOAD', calls: 1204, waitTime: '~12 min', operators: 12 },
  { id: 'h6', name: 'Earthquake Helpline', number: '1800-YYY', icon: '🏚️', status: 'OFFLINE', calls: 0, waitTime: '—', operators: 0 },
  { id: 'h7', name: 'Child Helpline', number: '1098', icon: '👶', status: 'ONLINE', calls: 89, waitTime: '~1 min', operators: 15 },
  { id: 'h8', name: 'Women Helpline', number: '181', icon: '👩', status: 'ONLINE', calls: 213, waitTime: '~2 min', operators: 20 },
]

const TICKER_MESSAGES: TickerMessage[] = [
  { id: 1, text: '🔴 CRITICAL: Flash flood reported in Salt Lake Sector V — 18 residents trapped', type: 'critical' },
  { id: 2, text: '🟠 HIGH: Fire in Park Circus apartment — 24 evacuated, smoke spreading', type: 'high' },
  { id: 3, text: '🔵 UPDATE: Relief convoy dispatched to Howrah East — ETA 12 min', type: 'info' },
  { id: 4, text: '🔴 CRITICAL: Bridge submerged near Tollygunge — commuter buses stranded', type: 'critical' },
  { id: 5, text: '🟠 HIGH: Aftershock damage at Dum Dum school shelter — structural check underway', type: 'high' },
  { id: 6, text: '🔵 UPDATE: 42 volunteers deployed to New Town Block C relief camp', type: 'info' },
  { id: 7, text: '🔴 CRITICAL: Gas leak detected near Behala Market — area evacuation initiated', type: 'critical' },
  { id: 8, text: '🟠 HIGH: Power grid failure in Ballygunge — hospitals on backup', type: 'high' },
]

const AVAILABLE_SKILLS = [
  'First Aid', 'Swimming', 'Driving', 'Medical',
  'Engineering', 'Communication', 'Leadership', 'Cooking',
]

const DISTRICTS = [
  'Kolkata', 'Howrah', 'North 24 Parganas', 'South 24 Parganas',
  'Hooghly', 'Nadia', 'Purba Medinipur', 'Paschim Medinipur',
  'Murshidabad', 'Birbhum',
]

const DISASTER_OPTIONS = [
  'Flood', 'Fire', 'Earthquake', 'Storm', 'Landslide',
  'Medical Emergency', 'Gas Leak', 'Building Collapse',
]

/* ─── Hook ─── */
export const useUserLanding = () => {
  const { i18n } = useTranslation()
  /* Shared reports context — same array the admin dashboard reads */
  const { addReport } = useSharedReports()
  /* Clock */
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString('en-IN', { hour12: false }))

  /* Helplines */
  const [helplines, setHelplines] = useState<HelplineInfo[]>(INITIAL_HELPLINES)

  /* Active incidents count */
  const [activeIncidents, setActiveIncidents] = useState(7)

  /* Incident form */
  const [incidentDraft, setIncidentDraft] = useState<IncidentDraft>({
    disasterType: '',
    severity: '',
    location: '',
    description: '',
    source: 'Citizen',
    file: null,
    anonymous: false,
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
  })

  /* ─── Centralized incidents array (live feed source of truth) ─── */
  const [submittedIncidents, setSubmittedIncidents] = useState<Incident[]>([])
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* Tracking */
  const [trackingId, setTrackingId] = useState('')
  const [trackedReport, setTrackedReport] = useState<TrackedReport | null>(null)

  /* Volunteer */
  const [volunteer, setVolunteer] = useState<VolunteerForm>({
    name: '', phone: '', email: '', district: '', availability: '', skills: [],
  })
  const [volunteerSubmitted, setVolunteerSubmitted] = useState(false)

  /* Active tab */
  const [activeTab, setActiveTab] = useState(0)

  /* Timers */
  const intervalRefs = useRef<number[]>([])

  useEffect(() => {
    /* Clock every second */
    const clockId = window.setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-IN', { hour12: false }))
    }, 1000)

    /* Helpline call count fluctuation every 2s */
    const helplineId = window.setInterval(() => {
      setHelplines(prev => prev.map(h => {
        if (h.status === 'OFFLINE') return h
        const delta = Math.floor(Math.random() * 21) - 10
        return { ...h, calls: Math.max(0, h.calls + delta) }
      }))
    }, 2000)

    /* Active incidents fluctuation every 8s */
    const incidentId = window.setInterval(() => {
      setActiveIncidents(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1
        return Math.max(3, Math.min(15, prev + delta))
      })
    }, 8000)

    intervalRefs.current = [clockId, helplineId, incidentId]

    return () => {
      intervalRefs.current.forEach(id => window.clearInterval(id))
    }
  }, [])

  /* Incident form handlers */
  const updateIncidentField = useCallback(<K extends keyof IncidentDraft>(field: K, value: IncidentDraft[K]) => {
    setIncidentDraft(prev => ({ ...prev, [field]: value }))
    setLastSubmittedId(null)
  }, [])

  /**
   * submitIncident — Fixed: generates exactly ONE unique ID per submit.
   *
   * BUG FIX: Previously, Date.now() was called inside JSX render, causing
   * a new ID to be generated on every re-render (clock tick, helpline
   * fluctuation, etc.). Now the ID is created once here, stored in state,
   * and displayed from state — never recalculated.
   *
   * Also adds an isSubmitting guard to prevent duplicate submissions.
   */
  const submitIncident = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setLastSubmittedId(null)

    // Generate ONE unique ID
    const incidentId = `RQ-${Date.now()}`

    console.log('[DEBUG][submitIncident] User-selected severity:', incidentDraft.severity)
    console.log('[DEBUG][submitIncident] Incident ID:', incidentId)

    // Build the local incident object immediately (for user page feed)
    const newIncident: Incident = {
      id: incidentId,
      type: incidentDraft.disasterType,
      severity: incidentDraft.severity || 'Analyzing...',
      location: incidentDraft.location,
      description: incidentDraft.description,
      source: incidentDraft.source,
      time: 'Just now',
      reporterName: incidentDraft.anonymous ? '' : incidentDraft.reporterName,
      reporterPhone: incidentDraft.anonymous ? '' : incidentDraft.reporterPhone,
      reporterEmail: incidentDraft.anonymous ? '' : incidentDraft.reporterEmail,
    }

    // Prepend to local user-page feed
    setSubmittedIncidents(prev => [newIncident, ...prev])
    setLastSubmittedId(incidentId)

    // ─── Call Gemini AI for severity analysis ───
    const { analyzeDisasterReport } = await import('../services/geminiService')
    const createdAt = new Date().toISOString()

    console.log('\n🤖 [submitIncident] Calling Gemini AI for severity analysis...')
    console.log('🤖 [submitIncident] Description:', incidentDraft.description)
    console.log('🤖 [submitIncident] Location:', incidentDraft.location)
    console.log('🤖 [submitIncident] Disaster type:', incidentDraft.disasterType)

    const aiResult = await analyzeDisasterReport(
      incidentDraft.description,
      incidentDraft.location,
      incidentDraft.disasterType || 'Unknown',
      1,
      i18n.language
    )

    console.log('\n✅ [submitIncident] AI Analysis Complete!')
    console.log('   🎯 Priority Score:', aiResult.priorityScore, '/ 100')
    console.log('   🏷️  Priority Label:', aiResult.priorityLabel)
    console.log('   🔥 Disaster Type:', aiResult.disasterType)
    console.log('   👥 People Affected (AI estimated):', aiResult.peopleAffected)
    console.log('   🚑 Recommended Action:', aiResult.recommendedAction)
    console.log('   📊 Explanation:', aiResult.priorityExplanation)

    // Use user-selected severity if provided, otherwise use AI severity
    const finalSeverity = (incidentDraft.severity || aiResult.priorityLabel) as import('../types/report').PriorityLabel

    // Update the local incident with actual AI severity
    setSubmittedIncidents(prev =>
      prev.map(inc => inc.id === incidentId ? { ...inc, severity: finalSeverity } : inc)
    )

    console.log('   📋 Final severity (displayed):', finalSeverity)
    console.log('   👥 People affected (AI):', aiResult.peopleAffected)

    const sharedReport: Report = {
      id: incidentId,
      message: incidentDraft.description,
      location: incidentDraft.location,
      peopleAffected: aiResult.peopleAffected,
      severity: finalSeverity,
      priorityScore: aiResult.priorityScore,
      priorityLabel: aiResult.priorityLabel,
      disasterType: aiResult.disasterType,
      recommendedAction: aiResult.recommendedAction,
      priorityExplanation: aiResult.priorityExplanation,
      coords: await deriveCoords(incidentDraft.location),
      createdAt,
      source: 'Citizen',
    }

    console.log('\n📦 [submitIncident] Final Report for Admin Dashboard:', JSON.stringify(sharedReport, null, 2))

    addReport(sharedReport)

    // Reset the form
    setIncidentDraft({
      disasterType: '',
      severity: '',
      location: '',
      description: '',
      source: 'Citizen',
      file: null,
      anonymous: false,
      reporterName: '',
      reporterPhone: '',
      reporterEmail: '',
    })

    setIsSubmitting(false)
    setTimeout(() => setLastSubmittedId(null), 6000)
  }, [isSubmitting, incidentDraft, addReport])

  /* Tracking */
  const trackReport = useCallback(() => {
    if (!trackingId.trim()) return

    // ✅ BUG FIX: Look up actual submitted incident to get real severity
    const matchedIncident = submittedIncidents.find(inc => inc.id === trackingId.trim())
    const actualSeverity = matchedIncident?.severity || 'Unknown'

    // ✅ DEBUG: Log tracking lookup
    console.log('[DEBUG][trackReport] Tracking ID:', trackingId.trim())
    console.log('[DEBUG][trackReport] Matched incident:', matchedIncident)
    console.log('[DEBUG][trackReport] Actual severity:', actualSeverity)

    setTrackedReport({
      id: trackingId.trim(),
      priority: actualSeverity,
      teams: 3,
      status: 'Rescue In Progress',
      timeline: [
        { time: '14:02', label: 'Report received via citizen portal', done: true },
        { time: '14:03', label: `AI triage complete — Priority: ${actualSeverity}`, done: true },
        { time: '14:05', label: 'Rescue team Alpha-3 dispatched', done: true },
        { time: '14:12', label: 'Team en route — ETA 8 min', done: true },
        { time: '14:20', label: 'On-site assessment underway', done: false },
        { time: '—', label: 'Rescue operation complete', done: false },
      ],
    })
  }, [trackingId, submittedIncidents])

  /* Volunteer */
  const updateVolunteerField = useCallback(<K extends keyof VolunteerForm>(field: K, value: VolunteerForm[K]) => {
    setVolunteer(prev => ({ ...prev, [field]: value }))
    setVolunteerSubmitted(false)
  }, [])

  const toggleSkill = useCallback((skill: string) => {
    setVolunteer(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }))
  }, [])

  const submitVolunteer = useCallback(() => {
    setVolunteerSubmitted(true)
    setTimeout(() => setVolunteerSubmitted(false), 5000)
  }, [])

  return {
    /* Static data */
    statCards: STAT_CARDS,
    tickerMessages: TICKER_MESSAGES,
    availableSkills: AVAILABLE_SKILLS,
    districts: DISTRICTS,
    disasterOptions: DISASTER_OPTIONS,

    /* Live data */
    clock,
    helplines,
    activeIncidents,

    /* Tab */
    activeTab,
    setActiveTab,

    /* Incident */
    incidentDraft,
    submittedIncidents,
    lastSubmittedId,
    isSubmitting,
    updateIncidentField,
    submitIncident,

    /* Tracking */
    trackingId,
    setTrackingId,
    trackedReport,
    trackReport,

    /* Volunteer */
    volunteer,
    volunteerSubmitted,
    updateVolunteerField,
    toggleSkill,
    submitVolunteer,
  }
}
