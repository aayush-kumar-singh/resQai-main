export type PriorityLabel = 'Critical' | 'High' | 'Medium' | 'Low'

export type DisasterType =
  | 'Flood'
  | 'Fire'
  | 'Earthquake'
  | 'Storm'
  | 'Landslide'
  | 'Medical'

export type PriorityFilter = 'All' | PriorityLabel
export type DisasterFilter = 'All' | DisasterType
export type ReportSource = 'Citizen' | 'Volunteer'

export interface Coordinates {
  lat: number
  lng: number
}

export interface Report {
  id: string
  message: string
  location: string
  peopleAffected: number
  severity: PriorityLabel
  priorityScore: number
  priorityLabel: PriorityLabel
  disasterType: DisasterType
  recommendedAction: string
  priorityExplanation: string
  coords: Coordinates
  createdAt: string
  source: ReportSource
  imageName?: string
}

export interface DraftReport {
  message: string
  location: string
  peopleAffected: string
  imageName: string
}

export interface HotspotCluster {
  zone: string
  count: number
  lat: number
  lng: number
  dominantPriority: PriorityLabel
}

export interface DashboardMetrics {
  critical: number
  high: number
  activeZones: number
  visible: number
}

export interface AIInsights {
  zone: string
  zoneCount: number
  topIssue: DisasterType
  topIssueCount: number
  recommendation: string
}
