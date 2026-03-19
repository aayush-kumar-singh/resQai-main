import type {
  Coordinates,
  DisasterType,
  PriorityLabel,
  Report,
} from '../types/report'

export const DISASTER_TYPES: DisasterType[] = [
  'Flood',
  'Fire',
  'Earthquake',
  'Storm',
  'Landslide',
  'Medical',
]

export const PRIORITY_LEVELS: PriorityLabel[] = ['Critical', 'High', 'Medium', 'Low']

export const LOCATION_ANCHORS: Array<{ zone: string; coords: Coordinates }> = [
  { zone: 'Salt Lake', coords: { lat: 22.5861, lng: 88.4207 } },
  { zone: 'Howrah East', coords: { lat: 22.5899, lng: 88.3543 } },
  { zone: 'Park Circus', coords: { lat: 22.5432, lng: 88.3668 } },
  { zone: 'Behala', coords: { lat: 22.5036, lng: 88.3247 } },
  { zone: 'Dum Dum', coords: { lat: 22.624, lng: 88.4227 } },
  { zone: 'New Town', coords: { lat: 22.578, lng: 88.472 } },
  { zone: 'Ballygunge', coords: { lat: 22.5272, lng: 88.3665 } },
  { zone: 'Tollygunge', coords: { lat: 22.4943, lng: 88.343 } },
]

export const RESPONSE_PLAYBOOK: Record<DisasterType, string> = {
  Flood: 'Deploy boat units and establish elevated evacuation corridors.',
  Fire: 'Dispatch fire suppression teams and clear surrounding structures.',
  Earthquake: 'Activate structural assessment teams and field medical units.',
  Storm: 'Clear blocked routes and prioritize power restoration corridors.',
  Landslide: 'Send debris-clearing equipment and geo-risk assessment teams.',
  Medical: 'Dispatch emergency medical support and stabilize vulnerable patients.',
}

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString()

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'r-101',
    message:
      'Water level rising rapidly around basement homes. Families trapped with two elderly residents and limited power.',
    location: 'Salt Lake, Sector V',
    peopleAffected: 18,
    priorityScore: 96,
    severity: 'Critical',
    priorityLabel: 'Critical',
    disasterType: 'Flood',
    recommendedAction:
      'Deploy rescue boats and rapid medical triage teams within 10 minutes.',
    priorityExplanation:
      'Score driven by severe flooding, multiple trapped residents, and vulnerable individuals.',
    coords: { lat: 22.5697, lng: 88.4324 },
    createdAt: minutesAgo(4),
    source: 'Citizen',
  },
  {
    id: 'r-102',
    message:
      'Apartment block stairwell filled with smoke. Residents are sheltering on upper floors awaiting evacuation.',
    location: 'Park Circus Connector',
    peopleAffected: 24,
    priorityScore: 89,
    severity: 'Critical',
    priorityLabel: 'Critical',
    disasterType: 'Fire',
    recommendedAction:
      'Route fire brigade support and secure rooftop evacuation corridor immediately.',
    priorityExplanation:
      'Score reflects smoke spread, high occupancy, and limited escape routes.',
    coords: { lat: 22.5416, lng: 88.371 },
    createdAt: minutesAgo(9),
    source: 'Volunteer',
  },
  {
    id: 'r-103',
    message:
      'Bridge approach submerged. Buses halted with stranded commuters and children needing safe extraction.',
    location: 'Howrah East Bus Terminal',
    peopleAffected: 31,
    priorityScore: 84,
    severity: 'High',
    priorityLabel: 'High',
    disasterType: 'Flood',
    recommendedAction:
      'Deploy high-capacity evacuation buses and inflatable support boats.',
    priorityExplanation:
      'Large crowd size and mobility constraints elevate incident urgency.',
    coords: { lat: 22.5853, lng: 88.3564 },
    createdAt: minutesAgo(14),
    source: 'Volunteer',
  },
  {
    id: 'r-104',
    message:
      'Transformer blast caused localized fire and widespread outage. Nearby clinic running on backup power.',
    location: 'Behala Market Road',
    peopleAffected: 12,
    priorityScore: 76,
    severity: 'High',
    priorityLabel: 'High',
    disasterType: 'Fire',
    recommendedAction:
      'Dispatch electrical hazard response and protect nearby health infrastructure.',
    priorityExplanation:
      'Hazardous fire source near critical services creates elevated operational risk.',
    coords: { lat: 22.5031, lng: 88.3185 },
    createdAt: minutesAgo(18),
    source: 'Citizen',
  },
  {
    id: 'r-105',
    message:
      'Strong winds toppled trees over arterial road, blocking ambulance access to southern neighborhoods.',
    location: 'Tollygunge Circular',
    peopleAffected: 9,
    priorityScore: 68,
    severity: 'High',
    priorityLabel: 'High',
    disasterType: 'Storm',
    recommendedAction:
      'Clear route obstruction and stage alternate ambulance corridors.',
    priorityExplanation:
      'Road disruption impacts emergency mobility and healthcare response times.',
    coords: { lat: 22.4948, lng: 88.3473 },
    createdAt: minutesAgo(23),
    source: 'Volunteer',
  },
  {
    id: 'r-106',
    message:
      'Low-lying homes reporting knee-deep water and supply shortages. Residents request relocation support.',
    location: 'New Town Block C',
    peopleAffected: 15,
    priorityScore: 63,
    severity: 'Medium',
    priorityLabel: 'Medium',
    disasterType: 'Flood',
    recommendedAction: 'Stage relief packs and prepare phased evacuation logistics.',
    priorityExplanation:
      'Moderate score due to manageable flooding and no immediate medical red flags.',
    coords: { lat: 22.5789, lng: 88.4743 },
    createdAt: minutesAgo(28),
    source: 'Citizen',
  },
  {
    id: 'r-107',
    message:
      'Aftershock tremor caused wall cracks in a school shelter. Staff requesting structural inspection.',
    location: 'Dum Dum School Shelter',
    peopleAffected: 42,
    priorityScore: 71,
    severity: 'High',
    priorityLabel: 'High',
    disasterType: 'Earthquake',
    recommendedAction:
      'Send structural engineers and move children to fallback shelter zone.',
    priorityExplanation:
      'High occupancy in damaged structure requires fast safety verification.',
    coords: { lat: 22.6244, lng: 88.4314 },
    createdAt: minutesAgo(33),
    source: 'Volunteer',
  },
]

export const INCOMING_REPORT_TEMPLATES: Array<Omit<Report, 'id' | 'createdAt'>> = [
  {
    message:
      'Residents stuck on rooftops after rapid drainage failure; two families waving for rescue.',
    location: 'Salt Lake, Tank No. 6',
    peopleAffected: 11,
    priorityScore: 87,
    severity: 'Critical',
    priorityLabel: 'Critical',
    disasterType: 'Flood',
    recommendedAction: 'Prioritize rooftop extraction with inflatable units.',
    priorityExplanation:
      'Critical due to isolation risk and rising water levels around access lanes.',
    coords: { lat: 22.5893, lng: 88.4192 },
    source: 'Citizen',
  },
  {
    message:
      'Community center shelter reached capacity; volunteers reporting shortage of blankets and food.',
    location: 'Ballygunge Shelter Complex',
    peopleAffected: 29,
    priorityScore: 66,
    severity: 'High',
    priorityLabel: 'High',
    disasterType: 'Storm',
    recommendedAction: 'Dispatch relief supplies and rotate support staff.',
    priorityExplanation:
      'Resource stress across a dense shelter population raises urgency.',
    coords: { lat: 22.5286, lng: 88.3694 },
    source: 'Volunteer',
  },
  {
    message:
      'Injured person with breathing difficulty reported near submerged underpass; access route unclear.',
    location: 'Howrah East Underpass',
    peopleAffected: 3,
    priorityScore: 79,
    severity: 'High',
    priorityLabel: 'High',
    disasterType: 'Medical',
    recommendedAction: 'Dispatch medics with portable oxygen and route scouts.',
    priorityExplanation:
      'Medical vulnerability and route obstruction combine into elevated risk.',
    coords: { lat: 22.5908, lng: 88.3535 },
    source: 'Citizen',
  },
]
