import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSharedReports } from '../context/ReportsContext'
import {
  PRIORITY_LEVELS,
  RESPONSE_PLAYBOOK,
} from '../data/reportData'
import type {
  AIInsights,
  DashboardMetrics,
  DisasterFilter,
  DraftReport,
  DisasterType,
  HotspotCluster,
  PriorityFilter,
  Report,
} from '../types/report'
import {
  deriveCoords,
  detectZone,
} from '../utils/reportUtils'

interface DashboardState {
  reports: Report[]
  filteredReports: Report[]
  selectedReport: Report | null
  metrics: DashboardMetrics
  hotspotClusters: HotspotCluster[]
  aiInsights: AIInsights
  draft: DraftReport
  submitStatus: string
  priorityFilter: PriorityFilter
  disasterFilter: DisasterFilter
  lastUpdateAt: string
  setPriorityFilter: (value: PriorityFilter) => void
  setDisasterFilter: (value: DisasterFilter) => void
  selectReport: (reportId: string) => void
  updateDraftField: (field: keyof DraftReport, value: string) => void
  autoDetectLocation: () => void
  submitDraft: () => void
  isSubmitting: boolean
}

export const useResqaiDashboard = (): DashboardState => {
  const { i18n } = useTranslation()
  // Shared reports from context — same array the user page writes to
  const { reports, addReport } = useSharedReports()
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All')
  const [disasterFilter, setDisasterFilter] = useState<DisasterFilter>('All')
  const [selectedReportId, setSelectedReportId] = useState<string>('')
  const [lastUpdateAt, setLastUpdateAt] = useState<string>(
    new Date().toISOString(),
  )
  const [draft, setDraft] = useState<DraftReport>({
    message: '',
    location: '',
    peopleAffected: '',
    imageName: '',
  })
  const [submitStatus, setSubmitStatus] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // NO setInterval — removed auto-injection of fake reports

  useEffect(() => {
    if (!submitStatus) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSubmitStatus('')
    }, 4_500)

    return () => window.clearTimeout(timeoutId)
  }, [submitStatus])

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const matchesPriority =
          priorityFilter === 'All' || report.severity === priorityFilter
        const matchesDisaster =
          disasterFilter === 'All' || report.disasterType === disasterFilter

        return matchesPriority && matchesDisaster
      }),
    [disasterFilter, priorityFilter, reports],
  )

  const selectedReport = useMemo(() => {
    const directMatch = filteredReports.find(
      (report) => report.id === selectedReportId,
    )

    if (directMatch) {
      return directMatch
    }

    return filteredReports[0] ?? null
  }, [filteredReports, selectedReportId])

  const metrics = useMemo<DashboardMetrics>(() => {
    const critical = reports.filter(
      (report) => report.priorityLabel === 'Critical',
    ).length
    const high = reports.filter((report) => report.priorityLabel === 'High').length
    const activeZones = new Set(reports.map((report) => detectZone(report.location)))

    return {
      critical,
      high,
      activeZones: activeZones.size,
      visible: filteredReports.length,
    }
  }, [filteredReports.length, reports])

  const hotspotClusters = useMemo<HotspotCluster[]>(() => {
    const grouped = new Map<string, Report[]>()

    filteredReports.forEach((report) => {
      const zone = detectZone(report.location)
      const current = grouped.get(zone) ?? []
      current.push(report)
      grouped.set(zone, current)
    })

    return Array.from(grouped.entries())
      .filter(([, group]) => group.length > 1)
      .map(([zone, group]) => {
        const averageLat =
          group.reduce((total, item) => total + item.coords.lat, 0) / group.length
        const averageLng =
          group.reduce((total, item) => total + item.coords.lng, 0) / group.length

        const dominantPriority =
          PRIORITY_LEVELS.find((priority) =>
            group.some((item) => item.priorityLabel === priority),
          ) ?? 'Medium'

        return {
          zone,
          count: group.length,
          lat: averageLat,
          lng: averageLng,
          dominantPriority,
        }
      })
  }, [filteredReports])

  const aiInsights = useMemo<AIInsights>(() => {
    const zoneRisk = new Map<string, { count: number; weightedRisk: number }>()
    const disasterCounts = new Map<DisasterType, number>()

    reports.forEach((report) => {
      const zone = detectZone(report.location)
      const riskWeight =
        report.priorityLabel === 'Critical'
          ? 3
          : report.priorityLabel === 'High'
            ? 2
            : 1

      const zoneSnapshot = zoneRisk.get(zone) ?? { count: 0, weightedRisk: 0 }
      zoneSnapshot.count += 1
      zoneSnapshot.weightedRisk += riskWeight
      zoneRisk.set(zone, zoneSnapshot)

      disasterCounts.set(
        report.disasterType,
        (disasterCounts.get(report.disasterType) ?? 0) + 1,
      )
    })

    const highestRiskZone = Array.from(zoneRisk.entries()).sort((a, b) => {
      if (b[1].weightedRisk !== a[1].weightedRisk) {
        return b[1].weightedRisk - a[1].weightedRisk
      }

      return b[1].count - a[1].count
    })[0]

    const topIssue = Array.from(disasterCounts.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0]

    return {
      zone: highestRiskZone?.[0] ?? 'No dominant zone',
      zoneCount: highestRiskZone?.[1].count ?? 0,
      topIssue: topIssue?.[0] ?? 'Flood',
      topIssueCount: topIssue?.[1] ?? 0,
      recommendation: topIssue
        ? RESPONSE_PLAYBOOK[topIssue[0]]
        : 'Continue monitoring and validate field communications.',
    }
  }, [reports])

  const updateDraftField = (field: keyof DraftReport, value: string): void => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const autoDetectLocation = (): void => {
    if (!navigator.geolocation) {
      setSubmitStatus('Geolocation is unavailable on this device.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const formatted = `Near ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
        updateDraftField('location', formatted)
        setSubmitStatus('Location captured. You can still refine it manually.')
      },
      () => {
        setSubmitStatus('Location permission denied. Enter location manually.')
      },
      { enableHighAccuracy: true, timeout: 8_000 },
    )
  }

  /**
   * submitDraft — generates exactly ONE unique ID per submission.
   * Uses crypto.randomUUID() called once inside the handler.
   * isSubmitting guard prevents double-click / duplicate submissions.
   */
  const submitDraft = useCallback(async (): Promise<void> => {
    if (isSubmitting) return  // prevent duplicate submissions

    const message = draft.message.trim()
    const location = draft.location.trim()
    const peopleAffected = Number.parseInt(draft.peopleAffected, 10)

    if (!message || !location || Number.isNaN(peopleAffected) || peopleAffected <= 0) {
      setSubmitStatus('Add the message, location, and people affected to continue.')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('\u{1F916} AI is analyzing the distress report...')

    // Generate ONE unique ID
    const reportId = crypto.randomUUID()

    // ─── Call Gemini AI for severity analysis ───
    const { analyzeDisasterReport } = await import('../services/geminiService')

    console.log('[DEBUG][submitDraft] \u{1F916} Calling Gemini API...')

    const aiResult = await analyzeDisasterReport(
      message,
      location,
      'Unknown',
      peopleAffected,
      i18n.language
    )

    const createdAt = new Date().toISOString()

    console.log('[DEBUG][submitDraft] AI Result:', JSON.stringify(aiResult, null, 2))

    const userReport: Report = {
      id: reportId,
      message,
      location,
      peopleAffected,
      severity: aiResult.priorityLabel,
      priorityScore: aiResult.priorityScore,
      priorityLabel: aiResult.priorityLabel,
      disasterType: aiResult.disasterType,
      recommendedAction: aiResult.recommendedAction,
      priorityExplanation: aiResult.priorityExplanation,
      coords: await deriveCoords(location),
      createdAt,
      source: 'Citizen',
      imageName: draft.imageName || undefined,
    }

    console.log('[DEBUG][submitDraft] Report:', JSON.stringify(userReport, null, 2))

    // Add to shared context
    addReport(userReport)
    setSelectedReportId(userReport.id)
    setLastUpdateAt(createdAt)
    setSubmitStatus(`\u2705 Report analyzed by AI — Severity: ${aiResult.priorityLabel} (Score: ${aiResult.priorityScore}/100)`)

    setDraft({
      message: '',
      location,
      peopleAffected: '',
      imageName: '',
    })

    setTimeout(() => setIsSubmitting(false), 600)
  }, [isSubmitting, draft])

  return {
    reports,
    filteredReports,
    selectedReport,
    metrics,
    hotspotClusters,
    aiInsights,
    draft,
    submitStatus,
    priorityFilter,
    disasterFilter,
    lastUpdateAt,
    isSubmitting,
    setPriorityFilter,
    setDisasterFilter,
    selectReport: setSelectedReportId,
    updateDraftField,
    autoDetectLocation,
    submitDraft,
  }
}
