/**
 * SafeRouteMap.tsx — Premium UI redesign
 *
 * Strategy:
 *  1. Geocode start & end via Nominatim.
 *  2. Fetch real driving route from OSRM.
 *  3. Validate route against Critical/High danger zones (Haversine).
 *  4. If blocked, try 8 perpendicular detour waypoints.
 *  5. Render with premium glass-morphism UI, animated map, and colour-coded zones.
 */
import { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Polyline, Tooltip, useMap } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import {
  Navigation, AlertTriangle, CheckCircle2, MapPin,
  XCircle, Locate, ArrowRight, Shield, ShieldAlert, ShieldOff,
} from 'lucide-react'
import { deriveCoords, haversineDistance } from '../../utils/reportUtils'
import { useSharedReports } from '../../context/ReportsContext'
import type { Coordinates, Report } from '../../types/report'

// ─── Zone constants ──────────────────────────────────────────────────────
const ZONE_RADIUS_M: Record<string, number> = {
  Critical: 1_500,
  High: 1_200,
  Medium: 800,
}
const ZONE_COLOR: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
}
const SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low']

// ─── Helpers ─────────────────────────────────────────────────────────────
function routeCollidesWithZones(
  path: [number, number][],
  dangerReports: Report[],
  severities: string[],
): boolean {
  for (const pt of path) {
    for (const rep of dangerReports) {
      if (!severities.includes(rep.severity)) continue
      const dist = haversineDistance(pt[0], pt[1], rep.coords.lat, rep.coords.lng)
      if (dist < (ZONE_RADIUS_M[rep.severity] ?? 1000)) return true
    }
  }
  return false
}

async function fetchOSRMRoute(waypoints: Coordinates[]): Promise<[number, number][] | null> {
  const coordStr = waypoints.map(w => `${w.lng},${w.lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (!data.routes?.length) return null
    return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number])
  } catch { return null }
}

function buildDetourWaypoints(dangerReports: Report[]): Coordinates[] {
  const sorted = [...dangerReports].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  )
  const main = sorted[0]
  if (!main) return []
  const offset = 0.03
  return [
    { lat: main.coords.lat + offset, lng: main.coords.lng },
    { lat: main.coords.lat - offset, lng: main.coords.lng },
    { lat: main.coords.lat, lng: main.coords.lng + offset },
    { lat: main.coords.lat, lng: main.coords.lng - offset },
    { lat: main.coords.lat + offset, lng: main.coords.lng + offset },
    { lat: main.coords.lat + offset, lng: main.coords.lng - offset },
    { lat: main.coords.lat - offset, lng: main.coords.lng + offset },
    { lat: main.coords.lat - offset, lng: main.coords.lng - offset },
  ]
}

// ─── RouteBoundsAdjuster ──────────────────────────────────────────────────
const RouteBoundsAdjuster = ({ path }: { path: [number, number][] }) => {
  const map = useMap()
  useEffect(() => {
    if (path.length > 0) {
      map.fitBounds(path, { padding: [50, 50], maxZoom: 15 })
    }
  }, [path, map])
  return null
}

// ─── Status config ─────────────────────────────────────────────────────
type RouteStatus = 'none' | 'safe' | 'warning' | 'no_route' | 'error'
const STATUS_MAP = {
  safe:     { icon: CheckCircle2, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/30', badge: 'bg-emerald-500', shieldIcon: Shield },
  warning:  { icon: AlertTriangle, color: 'text-orange-400', bg: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/30', badge: 'bg-orange-500', shieldIcon: ShieldAlert },
  no_route: { icon: XCircle, color: 'text-red-400', bg: 'from-red-500/20 to-red-500/5', border: 'border-red-500/30', badge: 'bg-red-500', shieldIcon: ShieldOff },
  error:    { icon: XCircle, color: 'text-red-400', bg: 'from-red-500/20 to-red-500/5', border: 'border-red-500/30', badge: 'bg-red-500', shieldIcon: ShieldOff },
}

// ─── Main component ───────────────────────────────────────────────────────
export const SafeRouteMap = () => {
  const { t } = useTranslation()
  const { reports } = useSharedReports()

  const [startLoc, setStartLoc] = useState('')
  const [endLoc, setEndLoc] = useState('')
  const [routePath, setRoutePath] = useState<[number, number][]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [status, setStatus] = useState<RouteStatus>('none')
  const [statusMsg, setStatusMsg] = useState('')

  const dangerReports = useMemo(
    () => reports.filter(r => r.severity in ZONE_RADIUS_M),
    [reports],
  )

  const handleRouteSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCalculating(true)
    setRoutePath([])
    setStatus('none')
    setStatusMsg('')

    try {
      const [startC, endC] = await Promise.all([
        deriveCoords(startLoc),
        deriveCoords(endLoc),
      ])

      if (!Number.isFinite(startC.lat) || !Number.isFinite(endC.lat)) {
        setStatus('error')
        setStatusMsg('Could not resolve one or both locations. Please be more specific.')
        return
      }

      let bestPath = await fetchOSRMRoute([startC, endC])
      if (!bestPath) {
        setStatus('error')
        setStatusMsg('Could not fetch a driving route. Check your internet connection.')
        return
      }

      const criticalHigh = ['Critical', 'High']
      const directSafe = !routeCollidesWithZones(bestPath, dangerReports, criticalHigh)

      if (directSafe) {
        setRoutePath(bestPath)
        setStatus('safe')
        setStatusMsg('Safe route calculated — avoiding all Critical and High-risk zones.')
      } else {
        const candidates = buildDetourWaypoints(dangerReports.filter(r => criticalHigh.includes(r.severity)))
        let safeFound = false
        for (const wp of candidates) {
          const altPath = await fetchOSRMRoute([startC, wp, endC])
          if (altPath && !routeCollidesWithZones(altPath, dangerReports, criticalHigh)) {
            bestPath = altPath
            safeFound = true
            break
          }
        }
        setRoutePath(bestPath)
        if (safeFound) {
          setStatus('safe')
          setStatusMsg('Safe detour found — rerouted around all Critical and High-risk zones.')
        } else {
          setStatus('warning')
          setStatusMsg('No fully safe path found. Route passes near high-risk areas — proceed with extreme caution.')
        }
      }
    } catch (err) {
      console.error('[SafeRouteMap]', err)
      setStatus('error')
      setStatusMsg('An unexpected error occurred. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  // Use GPS for start location
  const handleGPS = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setStartLoc(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`)
    })
  }

  const active = status !== 'none' ? STATUS_MAP[status] : null
  const isSafe = status === 'safe'
  const routeColor = isSafe ? '#34d399' : '#f97316'

  // Counts for zone summary
  const criticalCount = dangerReports.filter(r => r.severity === 'Critical').length
  const highCount = dangerReports.filter(r => r.severity === 'High').length
  const mediumCount = dangerReports.filter(r => r.severity === 'Medium').length

  return (
    <div className="relative z-10 w-full py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Control Panel ────────────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-5">

          {/* Header card */}
          <div className="bg-gradient-to-br from-brand-800/80 to-brand-900/80 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Glow blob */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <Shield className="text-brand-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    {t('portal.safeRoute.tabTitle')}
                  </h3>
                  <p className="text-xs text-brand-400">{t('portal.safeRoute.subtitle')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Route form */}
          <div className="bg-brand-900/70 border border-white/8 rounded-3xl p-6 shadow-xl backdrop-blur-lg">
            <form onSubmit={handleRouteSearch} className="space-y-4">
              {/* Start */}
              <div>
                <label className="block text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  {t('portal.safeRoute.startLocation')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={startLoc}
                    onChange={e => setStartLoc(e.target.value)}
                    placeholder={t('portal.safeRoute.startPlaceholder')}
                    className="w-full bg-brand-950/80 border border-brand-500/20 text-white rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-brand-500/40 outline-none placeholder:text-brand-500/40 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGPS}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-200 transition-colors"
                    title="Use my location"
                  >
                    <Locate size={16} />
                  </button>
                </div>
              </div>

              {/* Arrow divider */}
              <div className="flex items-center justify-center">
                <div className="flex-1 h-px bg-white/5" />
                <div className="mx-3 w-7 h-7 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <ArrowRight size={14} className="text-brand-400" />
                </div>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* End */}
              <div>
                <label className="block text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]" />
                  {t('portal.safeRoute.destination')}
                </label>
                <input
                  type="text"
                  value={endLoc}
                  onChange={e => setEndLoc(e.target.value)}
                  placeholder={t('portal.safeRoute.destPlaceholder')}
                  className="w-full bg-brand-950/80 border border-brand-500/20 text-white rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand-500/40 outline-none placeholder:text-brand-500/40 transition-all"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isCalculating || !startLoc || !endLoc}
                className="w-full mt-2 relative overflow-hidden bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 disabled:from-brand-700 disabled:to-brand-800 disabled:opacity-50 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 group"
              >
                {isCalculating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="animate-pulse">{t('portal.safeRoute.calculating')}</span>
                  </>
                ) : (
                  <>
                    <Navigation size={16} className="group-hover:rotate-12 transition-transform" />
                    {t('portal.safeRoute.findRoute')}
                  </>
                )}
              </button>
            </form>

            {/* Status message */}
            {active && statusMsg && (
              <div className={`mt-5 p-4 rounded-2xl bg-gradient-to-br ${active.bg} border ${active.border} flex items-start gap-3`}>
                <active.icon size={18} className={`${active.color} shrink-0 mt-0.5`} />
                <p className={`text-sm font-semibold leading-snug ${active.color}`}>{statusMsg}</p>
              </div>
            )}
          </div>

          {/* Zone summary card */}
          <div className="bg-brand-900/70 border border-white/8 rounded-3xl p-5 shadow-xl backdrop-blur-lg">
            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-4">Active Danger Zones</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Critical', count: criticalCount, color: '#ef4444', dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]' },
                { label: 'High', count: highCount, color: '#f97316', dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]' },
                { label: 'Medium', count: mediumCount, color: '#eab308', dot: 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.7)]' },
              ].map(z => (
                <div key={z.label} className="bg-brand-950/60 rounded-2xl p-3 text-center border border-white/5">
                  <div className={`w-2.5 h-2.5 rounded-full ${z.dot} mx-auto mb-2`} />
                  <p className="text-xl font-extrabold text-white">{z.count}</p>
                  <p className="text-[10px] text-brand-400 mt-0.5">{z.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legend card */}
          <div className="bg-brand-900/70 border border-white/8 rounded-3xl p-5 shadow-xl backdrop-blur-lg">
            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-4">{t('portal.safeRoute.legendTitle')}</p>
            <div className="space-y-3">
              {[
                { label: 'Critical zone — blocked (1.5km)', color: '#ef4444', type: 'circle' },
                { label: 'High-risk zone — detour (1.2km)', color: '#f97316', type: 'circle' },
                { label: 'Medium-risk zone (0.8km)', color: '#eab308', type: 'circle' },
                { label: 'Safe route', color: '#34d399', type: 'line' },
                { label: 'Warning — near danger', color: '#f97316', type: 'dash' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  {item.type === 'circle' ? (
                    <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 opacity-80" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}60` }} />
                  ) : (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-[3px] w-2 rounded-full" style={{ backgroundColor: item.color, opacity: item.type === 'dash' && i % 2 !== 0 ? 0.1 : 1 }} />
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-brand-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Map Panel ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 relative">
          {/* Map container */}
          <div className="h-[600px] lg:h-[720px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-brand-950">
            <MapContainer
              center={[22.5726, 88.3639]}
              zoom={12}
              className="w-full h-full z-0"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              />
              <RouteBoundsAdjuster path={routePath} />

              {/* Danger zone circles */}
              {dangerReports.map(r => {
                const color = ZONE_COLOR[r.severity] ?? '#eab308'
                return (
                  <Circle
                    key={r.id}
                    center={[r.coords.lat, r.coords.lng]}
                    radius={ZONE_RADIUS_M[r.severity] ?? 800}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.18, weight: 1.5, opacity: 0.8 }}
                  >
                    <Tooltip sticky className="!text-xs">
                      <span className="font-bold">{r.severity}</span> — {r.disasterType}<br />
                      📍 {r.location}<br />
                      👥 {r.peopleAffected} people affected
                    </Tooltip>
                  </Circle>
                )
              })}

              {/* Route polyline */}
              {routePath.length > 0 && (
                <>
                  <Polyline positions={routePath} pathOptions={{ color: routeColor, weight: 18, opacity: 0.12 }} />
                  <Polyline positions={routePath} pathOptions={{ color: routeColor, weight: 5, opacity: 1, dashArray: isSafe ? undefined : '14,8', lineCap: 'round', lineJoin: 'round' }} />
                </>
              )}
            </MapContainer>

            {/* Map overlay — top-left info pill */}
            {routePath.length > 0 && active && (
              <div className={`absolute top-4 left-4 z-[500] flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md shadow-lg ${active.badge} bg-opacity-90 text-white text-xs font-bold`}>
                <active.shieldIcon size={14} />
                {isSafe ? 'Route is SAFE' : 'Route WARNING'}
              </div>
            )}

            {/* Map overlay — bottom badge */}
            {isCalculating && (
              <div className="absolute inset-0 z-[500] flex items-center justify-center bg-brand-950/60 backdrop-blur-sm">
                <div className="bg-brand-900 border border-brand-500/30 rounded-2xl px-8 py-6 shadow-2xl flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
                  <p className="text-brand-200 text-sm font-bold">Calculating safe route…</p>
                  <p className="text-brand-400 text-xs">Checking danger zones</p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {routePath.length === 0 && !isCalculating && (
              <div className="absolute inset-0 z-[400] flex items-end justify-center pb-8 pointer-events-none">
                <div className="bg-brand-950/80 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3 text-brand-300">
                  <MapPin size={18} className="text-brand-400" />
                  <p className="text-sm font-medium">Enter start and destination to find a safe route</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
