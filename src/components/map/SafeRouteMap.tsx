import { useState } from 'react'
import { MapContainer, TileLayer, Circle, Polyline } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import { Navigation, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'
import { deriveCoords } from '../../utils/reportUtils'
import { INITIAL_REPORTS } from '../../data/reportData'

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const SafeRouteMap = () => {
  const { t } = useTranslation()
  const [startLoc, setStartLoc] = useState('')
  const [endLoc, setEndLoc] = useState('')
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [routeStatus, setRouteStatus] = useState<'none' | 'safe' | 'warning' | 'error'>('none')
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.5726, 88.3639])
  const [zoom, setZoom] = useState(12)

  // Filter for high risk areas to avoid
  const dangerousReports = INITIAL_REPORTS.filter(r => r.priorityLabel === 'Critical' || r.priorityLabel === 'High')

  const handleRouteSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startLoc || !endLoc) return
    
    setIsCalculating(true)
    setRouteStatus('none')
    try {
      // 1. Convert text to coords using existing utility
      const startC = await deriveCoords(startLoc)
      const endC = await deriveCoords(endLoc)
      
      // 2. Fetch driving route from OSRM
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startC.lng},${startC.lat};${endC.lng},${endC.lat}?overview=full&geometries=geojson`
      const res = await fetch(osrmUrl)
      
      if (!res.ok) throw new Error('OSRM fetched failed')
      const data = await res.json()
      
      if (data.routes && data.routes.length > 0) {
        // Encode to Leaflet [lat, lng] format
        const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]) as [number, number][]
        setRouteCoords(coords)
        setMapCenter(coords[Math.floor(coords.length / 2)])
        setZoom(13)
        
        // 3. Collision detection based on Haversine distance (1.5km danger radius check)
        let safe = true
        for (const pt of coords) {
          for (const rep of dangerousReports) {
            if (getDistance(pt[0], pt[1], rep.coords.lat, rep.coords.lng) < 1500) {
              safe = false
              break
            }
          }
          if (!safe) break
        }
        setRouteStatus(safe ? 'safe' : 'warning')
      } else {
        setRouteStatus('error')
      }
    } catch (err) {
      console.error(err)
      setRouteStatus('error')
    }
    setIsCalculating(false)
  }

  return (
    <div className="relative z-10 w-full py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-brand-950/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Navigation className="text-brand-400" />
              {t('portal.safeRoute.tabTitle')}
            </h3>
            <p className="text-brand-300 text-sm mb-6">{t('portal.safeRoute.subtitle')}</p>
            
            <form onSubmit={handleRouteSearch} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
                  {t('portal.safeRoute.startLocation')}
                </label>
                <input 
                  type="text" 
                  value={startLoc}
                  onChange={e => setStartLoc(e.target.value)}
                  placeholder={t('portal.safeRoute.startPlaceholder')} 
                  className="w-full bg-brand-900 border border-brand-500/20 text-white rounded-xl p-3 focus:ring-2 focus:ring-brand-500/50 outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
                  {t('portal.safeRoute.destination')}
                </label>
                <input 
                  type="text" 
                  value={endLoc}
                  onChange={e => setEndLoc(e.target.value)}
                  placeholder={t('portal.safeRoute.destPlaceholder')} 
                  className="w-full bg-brand-900 border border-brand-500/20 text-white rounded-xl p-3 focus:ring-2 focus:ring-brand-500/50 outline-none" 
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isCalculating}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-6"
              >
                {isCalculating ? (
                  <span className="animate-pulse">{t('portal.safeRoute.calculating')}</span>
                ) : (
                  <>
                    <MapPin size={18} /> {t('portal.safeRoute.findRoute')}
                  </>
                )}
              </button>
            </form>

            {/* Status alerts */}
            {routeStatus === 'safe' && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex flex-col gap-2 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                <CheckCircle2 className="shrink-0" />
                <p className="text-sm font-bold leading-tight">{t('portal.safeRoute.safe')}</p>
              </div>
            )}
            
            {routeStatus === 'warning' && (
              <div className="mt-6 p-4 rounded-xl bg-alert-500/20 border border-alert-500/40 text-alert-400 flex flex-col gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="shrink-0" />
                <p className="text-sm font-bold leading-tight">{t('portal.safeRoute.warning')}</p>
              </div>
            )}

            {routeStatus === 'error' && (
              <div className="mt-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold text-center">
                {t('portal.safeRoute.error')}
              </div>
            )}
          </div>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-3 h-[500px] lg:h-[600px] w-full bg-brand-900 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
          <MapContainer 
            center={mapCenter} 
            zoom={zoom} 
            className="w-full h-full z-0 font-sans"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            
            {/* Draw Danger Zones */}
            {dangerousReports.map((r) => (
              <Circle
                key={r.id}
                center={[r.coords.lat, r.coords.lng]}
                radius={1500}
                pathOptions={{ 
                  color: r.priorityLabel === 'Critical' ? '#ef4444' : '#f97316', 
                  fillColor: r.priorityLabel === 'Critical' ? '#ef4444' : '#f97316',
                  fillOpacity: 0.3,
                  stroke: false
                }}
              />
            ))}

            {/* Draw Route Line */}
            {routeCoords.length > 0 && (
              <Polyline 
                positions={routeCoords} 
                pathOptions={{ 
                  color: routeStatus === 'safe' ? '#34d399' : '#ef4444', 
                  weight: 5,
                  opacity: 0.8,
                  dashArray: routeStatus === 'safe' ? undefined : '10, 10'
                }} 
              />
            )}
          </MapContainer>

          {/* Map Legend */}
          <div className="absolute top-4 right-4 z-[400] bg-brand-950/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">{t('portal.safeRoute.legendTitle')}</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 opacity-50 border border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> 
                <span className="text-xs text-white">Critical (1.5km)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 opacity-50 border border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" /> 
                <span className="text-xs text-white">High (1.5km)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
