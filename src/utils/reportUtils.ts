import {
  LOCATION_ANCHORS,
  RESPONSE_PLAYBOOK,
} from '../data/reportData'
import type { Coordinates, DisasterType, PriorityLabel, Report } from '../types/report'
import { haversineDistance } from './routeUtils'

// Re-export so components only need to import from one place
export { haversineDistance } from './routeUtils'

/** Radius in metres within which two reports are considered the same incident */
export const DUPLICATE_RADIUS_M = 200

const KOLKATA_CENTER: Coordinates = {
  lat: 22.5726,
  lng: 88.3639,
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const detectZone = (location: string): string => {
  const normalized = location.toLowerCase()

  for (const anchor of LOCATION_ANCHORS) {
    if (normalized.includes(anchor.zone.toLowerCase())) {
      return anchor.zone
    }
  }

  return 'Central Grid'
}

const parseCoordinatesFromLocation = (location: string): Coordinates | null => {
  const coordinatePattern = /(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/
  const matched = location.match(coordinatePattern)

  if (!matched) {
    return null
  }

  const lat = Number.parseFloat(matched[1])
  const lng = Number.parseFloat(matched[2])

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null
  }

  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null
  }

  return { lat, lng }
}


export const deriveCoords = async (location: string): Promise<Coordinates> => {
 
  const parsed = parseCoordinatesFromLocation(location)
  if (parsed) return parsed

 
  const normalized = location.toLowerCase()
  const anchor = LOCATION_ANCHORS.find((item) =>
    normalized.includes(item.zone.toLowerCase()),
  )
  if (anchor) {
    return {
      lat: clamp(anchor.coords.lat + (Math.random() - 0.5) * 0.012, -90, 90),
      lng: clamp(anchor.coords.lng + (Math.random() - 0.5) * 0.012, -180, 180),
    }
  }

  
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      }
    }
  } catch {
  
  }

  
  return {
    lat: clamp(KOLKATA_CENTER.lat + (Math.random() - 0.5) * 0.012, -90, 90),
    lng: clamp(KOLKATA_CENTER.lng + (Math.random() - 0.5) * 0.012, -180, 180),
  }
}

export const inferDisasterType = (message: string): DisasterType => {
  const normalized = message.toLowerCase()

  if (/(flood|water|submerged|boat|drainage)/.test(normalized)) {
    return 'Flood'
  }

  if (/(fire|smoke|burn|blast)/.test(normalized)) {
    return 'Fire'
  }

  if (/(quake|tremor|aftershock|crack)/.test(normalized)) {
    return 'Earthquake'
  }

  if (/(storm|cyclone|wind|tree)/.test(normalized)) {
    return 'Storm'
  }

  if (/(landslide|mudslide|hill)/.test(normalized)) {
    return 'Landslide'
  }

  return 'Medical'
}

export const calculatePriorityScore = (
  message: string,
  peopleAffected: number,
  disasterType: DisasterType,
): number => {
  const severityBoost: Record<DisasterType, number> = {
    Flood: 16,
    Fire: 22,
    Earthquake: 20,
    Storm: 14,
    Landslide: 19,
    Medical: 17,
  }

  let score = 34 + Math.min(peopleAffected * 4.8, 40) + severityBoost[disasterType]

  if (/(trapped|injured|collapsed|stranded|blocked)/i.test(message)) {
    score += 12
  }

  if (/(children|elderly|pregnant|oxygen|critical)/i.test(message)) {
    score += 8
  }

  if (peopleAffected >= 25) {
    score += 6
  }

  return Math.round(clamp(score, 28, 100))
}

export const getPriorityLabel = (score: number): PriorityLabel => {
  if (score >= 85) {
    return 'Critical'
  }

  if (score >= 65) {
    return 'High'
  }

  if (score >= 50) {
    return 'Medium'
  }

  return 'Low'
}

export const getPriorityClass = (priority: PriorityLabel): string =>
  priority.toLowerCase()

export const getRelativeTime = (isoTimestamp: string): string => {
  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(isoTimestamp).getTime()) / 60_000,
  )

  if (elapsedMinutes <= 0) {
    return 'Just now'
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`
  }

  const elapsedDays = Math.floor(elapsedHours / 24)
  return `${elapsedDays}d ago`
}

export const truncateMessage = (message: string, maxLength = 84): string => {
  if (message.length <= maxLength) {
    return message
  }

  return `${message.slice(0, maxLength - 3)}...`
}

export const buildRecommendation = (
  disasterType: DisasterType,
  priority: PriorityLabel,
): string => {
  const basePlan = RESPONSE_PLAYBOOK[disasterType]

  if (priority === 'Critical') {
    return `${basePlan} Activate district incident command immediately.`
  }

  if (priority === 'High') {
    return `${basePlan} Dispatch first-response units within 20 minutes.`
  }

  return `${basePlan} Monitor conditions and pre-stage additional support.`
}

export const buildPriorityExplanation = (
  score: number,
  peopleAffected: number,
  disasterType: DisasterType,
  message: string,
): string => {
  const factors = [
    `${disasterType.toLowerCase()} severity`,
    `${peopleAffected} people affected`,
  ]

  if (/(trapped|injured|collapsed|blocked)/i.test(message)) {
    factors.push('direct rescue risk indicators')
  }

  if (/(children|elderly|pregnant|oxygen|critical)/i.test(message)) {
    factors.push('vulnerable individuals mentioned')
  }

  return `Score ${score}/100 computed from ${factors.join(', ')}.`
}

// ─── Duplicate / Merge Detection ────────────────────────────────────────────

export interface MergeResult {
  /** The existing report that was found nearby, if any */
  existingReport: Report | null
  /** Whether a nearby duplicate was found */
  isDuplicate: boolean
}

/**
 * Check if a new report overlaps with any existing incident within DUPLICATE_RADIUS_M.
 * Returns the nearest existing report if found.
 */
export const mergeIncidentsByLocation = (
  newCoords: Coordinates,
  existingReports: Report[],
  radiusM: number = DUPLICATE_RADIUS_M,
): MergeResult => {
  for (const report of existingReports) {
    const dist = haversineDistance(
      newCoords.lat,
      newCoords.lng,
      report.coords.lat,
      report.coords.lng,
    )
    if (dist <= radiusM) {
      return { existingReport: report, isDuplicate: true }
    }
  }
  return { existingReport: null, isDuplicate: false }
}
