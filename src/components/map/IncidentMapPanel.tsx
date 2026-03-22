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
import { Brain, Sparkles, Navigation } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Map Styling: we use a beautiful dark matter Mapbox-like style
const DEFAULT_CENTER: [number, number] = [22.5726, 88.3639]
const MAP_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const MAP_ATTRIBUTION = '&copy; OpenStreetMap &copy; CARTO'

interface MapFocusControllerProps {
  selectedReport: Report | null
  filteredReports: Report[]
}

const getClusterColor = (priorityClass: string): string => {
  if (priorityClass === 'critical') return '#ef4444' // red-500
  if (priorityClass === 'high') return '#f97316' // orange-500
  return '#eab308' // yellow-500
}

const createPriorityIcon = (
  score: number,
  priorityClass: string,
  isActive: boolean,
): DivIcon => {
  const bg = priorityClass === 'critical' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' :
             priorityClass === 'high' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]' :
             priorityClass === 'medium' ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)]' : 
             'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]'

  const border = isActive ? 'border-4 border-white scale-125' : 'border-2 border-brand-950'

  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div class="w-8 h-8 rounded-full ${bg} ${border} flex items-center justify-center text-white font-black text-[10px] transform transition-all shadow-xl">${score}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

const MapFocusController = ({
  selectedReport,
  filteredReports,
}: MapFocusControllerProps) => {
  const map = useMap()

  useEffect(() => {
    if (selectedReport) {
      const target: [number, number] = [selectedReport.coords.lat, selectedReport.coords.lng]
      map.flyTo(target, Math.max(map.getZoom(), 14), { duration: 1.2 })
      return
    }

    if (filteredReports.length === 1) {
      const only = filteredReports[0]
      map.setView([only.coords.lat, only.coords.lng], 13)
      return
    }

    if (filteredReports.length > 1) {
      const bounds = L.latLngBounds(
        filteredReports.map((report) => [report.coords.lat, report.coords.lng]),
      )

      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 13,
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
}: IncidentMapPanelProps) => {
  const { t } = useTranslation()
  return (
    <article className="w-full h-full flex flex-col relative bg-brand-950">
      {/* Map Overlay Header */}
      <div className="absolute top-4 left-4 right-4 z-[400] pointer-events-none flex flex-col items-end gap-3">
        <div className="bg-brand-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto max-w-sm w-full">
           <div className="flex items-center gap-2 mb-3">
             <Brain className="text-indigo-400 animate-pulse" size={20}/>
             <h3 className="text-white font-bold text-sm tracking-wide uppercase">{t('admin.map.title')}</h3>
           </div>
           <div className="space-y-3">
             <div>
               <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block mb-1">{t('admin.map.highRisk')}</span>
               <p className="text-sm text-red-400 font-bold flex items-center gap-2"><Sparkles size={12}/> {aiInsights.zone} ({aiInsights.zoneCount} {t('admin.map.incidents')})</p>
             </div>
             <div>
               <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block mb-1">{t('admin.map.threat')}</span>
               <p className="text-sm text-white font-medium">{aiInsights.topIssue} <span className="text-brand-300 ml-1">({aiInsights.topIssueCount} {t('admin.map.reports')})</span></p>
             </div>
             <div>
               <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block mb-1">{t('admin.map.suggested')}</span>
               <p className="text-xs text-emerald-300 font-bold leading-relaxed border-l-2 border-emerald-500/50 pl-2 ml-1">{aiInsights.recommendation}</p>
             </div>
           </div>
        </div>

        <div className="bg-brand-950/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-4 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"/> <span className="text-xs text-white font-bold">{t('portal.severity.critical')}</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"/> <span className="text-xs text-white font-bold">{t('portal.severity.high')}</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"/> <span className="text-xs text-white font-bold">{t('portal.severity.medium')}</span></div>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative group">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={11}
          scrollWheelZoom={true}
          className="w-full h-full outline-none z-0"
          zoomControl={false}
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
                radius={Math.min(15 + cluster.count * 2, 40)}
                pathOptions={{
                  color: hotspotColor,
                  fillColor: hotspotColor,
                  fillOpacity: 0.15,
                  weight: 1,
                  className: 'animate-pulse'
                }}
                eventHandlers={{
                  click: () => {
                    if (zoneRepresentative) onSelectReport(zoneRepresentative.id)
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} className="!bg-brand-950 !text-white !border-white/10 !font-bold">
                  {cluster.zone} HOTSPOT ({cluster.count} signals)
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
                <Popup className="custom-popup">
                  <style>{`
                    .leaflet-popup-content-wrapper { background: #0f172a; color: white; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
                    .leaflet-popup-tip { background: #0f172a; }
                    .custom-popup .leaflet-popup-content { margin: 12px; }
                  `}</style>
                  <div className="w-[200px]">
                    <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider mb-1">{report.location}</p>
                    <p className="text-sm text-white font-medium mb-3 leading-snug line-clamp-2">"{report.message}"</p>
                    <div className="grid grid-cols-2 gap-2 mb-3 bg-white/5 rounded-lg p-2">
                      <div className="text-center"><p className="text-[10px] text-brand-400">{t('admin.map.score')}</p><p className="font-bold text-white text-xs">{report.priorityScore}/100</p></div>
                      <div className="text-center"><p className="text-[10px] text-brand-400">{t('admin.map.impact')}</p><p className="font-bold text-white text-xs">{report.peopleAffected} {t('admin.map.pax')}</p></div>
                    </div>
                    <p className="text-xs text-amber-300 font-bold flex items-start gap-1"><Navigation size={12} className="shrink-0 mt-0.5"/> {report.recommendedAction}</p>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>

        {filteredReports.length === 0 && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none">
            <div className="bg-brand-950/80 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 text-brand-300 font-bold text-sm shadow-xl">
              {t('admin.map.empty')}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
