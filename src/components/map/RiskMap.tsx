'use client'

/**
 * RiskMap — Leaflet map with marker/heatmap modes and programmatic focus.
 *
 * Props:
 *   storeRisks    — data to plot
 *   selectedStore — store name to fly to and highlight
 *   onStoreClick  — called when user clicks a marker
 *   mode          — 'marker' | 'heatmap' (controlled by parent toolbar)
 *   colorMode     — 'risk' (risk-level colors) | 'type' (top accident type colors)
 *   highlightTop  — if true, top-3 stores by accident count get a gold ring
 *
 * MapController (inner) uses useMap() to fly the viewport and open the popup
 * whenever `selectedStore` changes.
 */
import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from 'react-leaflet'
import type { StoreRisk } from '@/types'
import { KOREA_CENTER, KOREA_ZOOM } from '@/lib/geo-fallback'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface Props {
  storeRisks: StoreRisk[]
  selectedStore?: string | null
  onStoreClick?: (store: StoreRisk) => void
  mode: 'marker' | 'heatmap'
  colorMode: 'risk' | 'type'
  highlightTop: boolean
}

const RISK_COLORS: Record<string, string> = {
  high:   '#ef4444',
  medium: '#f97316',
  low:    '#eab308',
  none:   '#9ca3af',
}

const RISK_LABELS: Record<string, string> = {
  high:   '고위험 (3건+)',
  medium: '중위험 (1-2건)',
  low:    '저위험',
  none:   '재해 없음',
}

const TYPE_MARKER_COLORS: Record<string, string> = {
  '넘어짐':      '#ef4444',
  '무리한 동작': '#f97316',
  '물체에 맞음': '#eab308',
  '출퇴근':      '#8b5cf6',
  '베임':        '#ec4899',
  '떨어짐':      '#3b82f6',
  '부딪힘':      '#06b6d4',
  '끼임':        '#10b981',
}

function getMarkerColor(store: StoreRisk, colorMode: 'risk' | 'type'): string {
  if (colorMode === 'type') {
    const topType = store.top_accident_types[0]?.type
    return topType ? (TYPE_MARKER_COLORS[topType] ?? '#9ca3af') : '#9ca3af'
  }
  return RISK_COLORS[store.risk_level]
}

function getRiskRadius(level: string, selected = false, top = false): number {
  const base = level === 'high' ? 14 : level === 'medium' ? 10 : level === 'low' ? 7 : 5
  return selected ? base + 5 : top ? base + 2 : base
}

// ─── Heatmap layer ────────────────────────────────────────────────────────────

function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    if (points.length === 0) return
    import('leaflet.heat').then(() => {
      if (layerRef.current) map.removeLayer(layerRef.current)
      const layer = (L as unknown as {
        heatLayer: (pts: [number, number, number][], opts: object) => L.Layer
      }).heatLayer(points, { radius: 30, blur: 20, maxZoom: 17, max: 1,
        gradient: { 0.3: '#3b82f6', 0.6: '#f97316', 1.0: '#ef4444' } })
      layer.addTo(map)
      layerRef.current = layer
    })
    return () => {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null }
    }
  }, [map, points])

  return null
}

// ─── Map controller — flies to selectedStore and opens its popup ──────────────

function MapController({
  target,
  markerRefs,
}: {
  target: string | null
  markerRefs: React.RefObject<Map<string, L.CircleMarker>>
}) {
  const map = useMap()
  const prevTarget = useRef<string | null>(null)

  useEffect(() => {
    if (!target || target === prevTarget.current) return
    prevTarget.current = target
    const marker = markerRefs.current?.get(target)
    if (!marker) return
    const { lat, lng } = marker.getLatLng()
    map.flyTo([lat, lng], 14, { duration: 1.0 })
    const t = setTimeout(() => marker.openPopup(), 1100)
    return () => clearTimeout(t)
  }, [map, target, markerRefs])

  return null
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RiskMap({ storeRisks, selectedStore, onStoreClick, mode, colorMode, highlightTop }: Props) {
  const markerRefs = useRef<Map<string, L.CircleMarker>>(new Map())

  const plotStores  = storeRisks.filter((s) => s.lat !== null && s.lng !== null)
  const noCoordCount = storeRisks.length - plotStores.length

  const maxCount = Math.max(...plotStores.map((s) => s.accident_count), 1)
  const heatPoints: [number, number, number][] = plotStores.map((s) => [
    s.lat!, s.lng!, s.accident_count / maxCount,
  ])

  const topStoreNames = useMemo(() => {
    if (!highlightTop) return new Set<string>()
    return new Set(
      [...storeRisks]
        .sort((a, b) => b.accident_count - a.accident_count)
        .slice(0, 3)
        .map((s) => s.store_name),
    )
  }, [storeRisks, highlightTop])

  // For the type legend: only show entries present in current data, plus "기타" if any
  // top accident type isn't in the color map.
  const typeLegendEntries = useMemo(() => {
    const presentTypes = new Set(
      storeRisks.map((s) => s.top_accident_types[0]?.type).filter(Boolean) as string[],
    )
    const mapped = Object.entries(TYPE_MARKER_COLORS).filter(([t]) => presentTypes.has(t))
    const hasOther = [...presentTypes].some((t) => !TYPE_MARKER_COLORS[t])
    return { mapped, hasOther }
  }, [storeRisks])

  // Clear stale refs when data changes
  useEffect(() => { markerRefs.current.clear() }, [storeRisks])

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {mode === 'marker' && colorMode === 'risk' && (
          <div className="flex flex-wrap gap-3">
            {Object.entries(RISK_LABELS).map(([level, label]) => (
              <div key={level} className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: RISK_COLORS[level] }} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
            {highlightTop && (
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-100" />
                <span className="text-xs text-gray-500">상위 3 매장</span>
              </div>
            )}
          </div>
        )}
        {mode === 'marker' && colorMode === 'type' && (
          <div className="flex flex-wrap gap-3">
            {typeLegendEntries.mapped.map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-500">{type}</span>
              </div>
            ))}
            {typeLegendEntries.hasOther && (
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
                <span className="text-xs text-gray-500">기타</span>
              </div>
            )}
          </div>
        )}
        {mode === 'heatmap' && (
          <span className="text-xs text-gray-500">파란색→주황색→빨간색 순으로 밀도가 높아집니다</span>
        )}
      </div>

      {noCoordCount > 0 && (
        <p className="mb-2 rounded bg-yellow-50 px-3 py-1.5 text-xs text-yellow-700">
          {noCoordCount}개 매장은 팀 지역 중심점으로 표시됩니다.
        </p>
      )}

      <div className="h-[500px] w-full overflow-hidden rounded-lg border border-gray-200">
        <MapContainer center={KOREA_CENTER} zoom={KOREA_ZOOM} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController target={selectedStore ?? null} markerRefs={markerRefs} />

          {mode === 'heatmap' && <HeatmapLayer points={heatPoints} />}

          {mode === 'marker' && plotStores.map((store) => {
            const isSelected = selectedStore === store.store_name
            const isTop      = topStoreNames.has(store.store_name)
            const color      = getMarkerColor(store, colorMode)
            return (
              <CircleMarker
                key={store.store_name}
                center={[store.lat!, store.lng!]}
                radius={getRiskRadius(store.risk_level, isSelected, isTop)}
                pathOptions={{
                  color:       isSelected ? '#1d4ed8' : isTop ? '#d97706' : color,
                  fillColor:   color,
                  fillOpacity: isSelected ? 0.95 : 0.75,
                  weight:      isSelected ? 3 : isTop ? 3.5 : 1.5,
                  dashArray:   isTop && !isSelected ? '5 3' : undefined,
                }}
                eventHandlers={{ click: () => onStoreClick?.(store) }}
                ref={(m) => {
                  if (m) markerRefs.current.set(store.store_name, m)
                  else markerRefs.current.delete(store.store_name)
                }}
              >
                <Tooltip>
                  <div className="text-sm">
                    <p className="font-semibold">{store.store_name}</p>
                    <p className="text-gray-600">{store.team}</p>
                    <p className="mt-0.5" style={{ color }}>
                      재해 {store.accident_count}건
                    </p>
                    {isTop && <p className="text-xs text-amber-600">★ 상위 위험 매장</p>}
                  </div>
                </Tooltip>
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <p className="font-bold text-gray-800 mb-1">{store.store_name}</p>
                    <p className="text-gray-500 text-xs">{store.team}</p>
                    {store.address && <p className="text-gray-400 text-xs mt-0.5 leading-snug">{store.address}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-semibold" style={{ color }}>
                        재해 {store.accident_count}건
                      </span>
                      {store.last_accident_label && (
                        <span className="text-xs text-gray-400">({store.last_accident_label})</span>
                      )}
                    </div>
                    {store.top_accident_types.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {store.top_accident_types.slice(0, 3).map(({ type, count }) => (
                          <span key={type} className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                            {type}{count > 1 ? `·${count}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>

      {plotStores.length === 0 && (
        <div className="mt-3 text-center text-sm text-gray-400">
          매장현황.xlsx를 업로드하면 지도에 위험도가 표시됩니다.
        </div>
      )}
    </div>
  )
}
