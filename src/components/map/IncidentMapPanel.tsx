import { useEffect } from 'react'
import L, { type DivIcon } from 'leaflet'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import type { AIInsights, HotspotCluster, Report } from '../../types/report'
import { detectZone, getPriorityClass } from '../../utils/reportUtils'

const DEFAULT_CENTER: [number, number] = [22.5726, 88.3639]
const MAP_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const MAP_ATTRIBUTION =
  '&copy; OpenStreetMap contributors &copy; CARTO'

interface MapFocusControllerProps {
  selectedReport: Report | null
  filteredReports: Report[]
}

const getClusterColor = (priorityClass: string): string => {
  if (priorityClass === 'critical') {
    return '#ff5f5f'
  }

  if (priorityClass === 'high') {
    return '#ff9f45'
  }

  return '#ffd257'
}

const createPriorityIcon = (
  score: number,
  priorityClass: string,
  isActive: boolean,
): DivIcon =>
  L.divIcon({
    className: 'resqai-div-icon',
    html: `<div class="map-priority-pin ${priorityClass}${
      isActive ? ' active' : ''
    }"><span>${score}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })

const MapFocusController = ({
  selectedReport,
  filteredReports,
}: MapFocusControllerProps) => {
  const map = useMap()

  useEffect(() => {
    if (selectedReport) {
      const target: [number, number] = [
        selectedReport.coords.lat,
        selectedReport.coords.lng,
      ]
      map.flyTo(target, Math.max(map.getZoom(), 12), { duration: 0.75 })
      return
    }

    if (filteredReports.length === 1) {
      const only = filteredReports[0]
      map.setView([only.coords.lat, only.coords.lng], 12)
      return
    }

    if (filteredReports.length > 1) {
      const bounds = L.latLngBounds(
        filteredReports.map((report) => [report.coords.lat, report.coords.lng]),
      )

      map.fitBounds(bounds, {
        padding: [42, 42],
        maxZoom: 12,
      })
      return
    }

    map.setView(DEFAULT_CENTER, 11)
  }, [filteredReports, map, selectedReport])

  return null
}

interface IncidentMapPanelProps {
  filteredReports: Report[]
  selectedReport: Report | null
  hotspotClusters: HotspotCluster[]
  aiInsights: AIInsights
  onSelectReport: (reportId: string) => void
}

export const IncidentMapPanel = ({
  filteredReports,
  selectedReport,
  hotspotClusters,
  aiInsights,
  onSelectReport,
}: IncidentMapPanelProps) => (
  <article className="panel-card map-card">
    <div className="map-header">
      <div className="card-heading">
        <h2>Real-Time Incident Map</h2>
        <p>Mapbox-style situational overlay with hotspot clustering</p>
      </div>
    </div>

    <div className="ai-insights" aria-live="polite">
      <h3>AI Insights</h3>
      <ul>
        <li>
          <span className="insight-label">High-risk zone detected</span>
          <span>
            {aiInsights.zone} ({aiInsights.zoneCount} reports)
          </span>
        </li>
        <li>
          <span className="insight-label">Most common issue</span>
          <span>
            {aiInsights.topIssue} + impacted individuals ({aiInsights.topIssueCount})
          </span>
        </li>
        <li>
          <span className="insight-label">Recommended action</span>
          <span>{aiInsights.recommendation}</span>
        </li>
      </ul>
    </div>

    <div className="map-legend">
      <span className="legend-item critical">Critical</span>
      <span className="legend-item high">High</span>
      <span className="legend-item medium">Medium</span>
    </div>

    <div className="map-stage">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={11}
        scrollWheelZoom
        className="leaflet-map"
      >
        <TileLayer attribution={MAP_ATTRIBUTION} url={MAP_TILE_URL} />

        <MapFocusController
          selectedReport={selectedReport}
          filteredReports={filteredReports}
        />

        {hotspotClusters.map((cluster) => {
          const zoneRepresentative = filteredReports.find(
            (report) => detectZone(report.location) === cluster.zone,
          )
          const priorityClass = getPriorityClass(cluster.dominantPriority)
          const hotspotColor = getClusterColor(priorityClass)

          return (
            <CircleMarker
              key={`hotspot-${cluster.zone}`}
              center={[cluster.lat, cluster.lng]}
              radius={Math.min(11 + cluster.count * 1.8, 24)}
              pathOptions={{
                color: hotspotColor,
                fillColor: hotspotColor,
                fillOpacity: 0.22,
                weight: 2,
              }}
              eventHandlers={{
                click: () => {
                  if (zoneRepresentative) {
                    onSelectReport(zoneRepresentative.id)
                  }
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {cluster.zone} hotspot ({cluster.count})
              </Tooltip>
            </CircleMarker>
          )
        })}

        {filteredReports.map((report) => {
          const isActive = selectedReport?.id === report.id
          const priorityClass = getPriorityClass(report.priorityLabel)

          return (
            <Marker
              key={report.id}
              position={[report.coords.lat, report.coords.lng]}
              icon={createPriorityIcon(report.priorityScore, priorityClass, isActive)}
              eventHandlers={{
                click: () => onSelectReport(report.id),
              }}
            >
              <Popup>
                <div className="leaflet-popup-content-custom">
                  <p className="leaflet-popup-title">{report.location}</p>
                  <p className="leaflet-popup-message">{report.message}</p>
                  <div className="leaflet-popup-grid">
                    <span>{report.priorityScore}/100</span>
                    <span>{report.peopleAffected} people</span>
                    <span>{report.disasterType}</span>
                    <span>{report.priorityLabel}</span>
                  </div>
                  <p className="leaflet-popup-action">{report.recommendedAction}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {filteredReports.length === 0 ? (
        <p className="map-empty">No matching reports on the map.</p>
      ) : null}
    </div>
  </article>
)
