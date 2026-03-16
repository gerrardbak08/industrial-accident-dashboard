'use client'

/**
 * MapPageClient — advanced two-column interactive map page.
 *
 * Toolbar row 1: org filters (영업부/팀/매장) + time filters (연도/월) + 재해유형 + 초기화
 * Toolbar row 2: map mode (마커/히트맵) | color mode (위험도/유형별) | 상위3강조 | 반복재해만 | 최근N개월
 *
 * Right column: StoreDetailPanel when a store is selected, else RepeatedSidebar.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, Cell } from 'recharts'
import type { StoreRisk, AccidentTypeCount, MonthlyTrend, GroupCount, DashboardStats } from '@/types'

const RiskMap = dynamic(() => import('./RiskMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
      <p className="text-sm text-gray-400">지도 로딩 중...</p>
    </div>
  ),
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface HierarchyMaps {
  departments: string[]
  dept_team_map: Record<string, string[]>
  team_store_map: Record<string, string[]>
  all_teams: string[]
  all_stores: string[]
  years: number[]
  accident_types: string[]
}

interface Props {
  initialStoreRisks: StoreRisk[]
  hierarchy: HierarchyMaps
}

interface MapFilters {
  department: string
  team: string
  store: string
  year: string
  month: string
  accident_type: string
}

const EMPTY: MapFilters = {
  department: 'all', team: 'all', store: 'all',
  year: 'all', month: 'all', accident_type: 'all',
}

type SortKey = 'count' | 'recent' | 'alpha'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  '넘어짐':      'bg-red-100 text-red-700',
  '무리한 동작': 'bg-orange-100 text-orange-700',
  '물체에 맞음': 'bg-yellow-100 text-yellow-700',
  '출퇴근':      'bg-purple-100 text-purple-700',
  '베임':        'bg-pink-100 text-pink-700',
  '떨어짐':      'bg-blue-100 text-blue-700',
  '부딪힘':      'bg-cyan-100 text-cyan-700',
}
const typeColor = (t: string) => TYPE_COLOR[t] ?? 'bg-gray-100 text-gray-600'

const CHART_COLORS = ['#3b82f6','#ef4444','#f97316','#eab308','#8b5cf6','#ec4899','#06b6d4','#10b981']

function isRecent(label: string | null, months: number): boolean {
  if (!label) return false
  const [y, m] = label.split('-').map(Number)
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  return new Date(y, m - 1) >= cutoff
}

function sortRepeated(stores: StoreRisk[], key: SortKey): StoreRisk[] {
  return [...stores].sort((a, b) => {
    if (key === 'count')  return b.accident_count - a.accident_count
    if (key === 'recent') return (b.last_accident_label ?? '').localeCompare(a.last_accident_label ?? '')
    return a.store_name.localeCompare(b.store_name, 'ko')
  })
}

function AccidentTypeBadges({ types }: { types: AccidentTypeCount[] }) {
  const visible = types.slice(0, 2)
  const rest    = types.length - 2
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map(({ type, count }) => (
        <span key={type} className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${typeColor(type)}`}>
          {type}{count > 1 && <span className="opacity-70">·{count}</span>}
        </span>
      ))}
      {rest > 0 && (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">+{rest}</span>
      )}
    </div>
  )
}

function RiskBadge({ level }: { level: string }) {
  const cls: Record<string, string> = {
    high: 'bg-red-100 text-red-700', medium: 'bg-orange-100 text-orange-700',
    low: 'bg-yellow-100 text-yellow-700', none: 'bg-gray-100 text-gray-500',
  }
  const lbl: Record<string, string> = { high: '고위험', medium: '중위험', low: '저위험', none: '없음' }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls[level] ?? cls.none}`}>
      {lbl[level] ?? level}
    </span>
  )
}

// ─── Store detail panel ───────────────────────────────────────────────────────

function StoreDetailPanel({
  store,
  detailStats,
  loading,
  filterLabel,
  onClose,
}: {
  store: StoreRisk
  detailStats: { by_month: MonthlyTrend[]; by_accident_type: GroupCount[] } | null
  loading: boolean
  filterLabel: string | null
  onClose: () => void
}) {
  const RISK_COLORS: Record<string, string> = {
    high: '#ef4444', medium: '#f97316', low: '#eab308', none: '#9ca3af',
  }

  return (
    <div className="flex h-full flex-col rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between border-b px-4 py-3 shrink-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-800 truncate">{store.store_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{store.team}</p>
          {store.address && <p className="text-xs text-gray-400 mt-0.5 leading-snug truncate">{store.address}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-2 shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Active filter context — tells user which slice of data the charts show */}
      {filterLabel && (
        <div className="border-b bg-blue-50 px-4 py-1.5 shrink-0">
          <p className="text-xs text-blue-600">
            <span className="font-medium">조회 조건:</span> {filterLabel}
          </p>
        </div>
      )}

      {/* KPI row */}
      <div className="flex items-center gap-3 border-b px-4 py-2.5 shrink-0">
        <span className="text-xl font-bold" style={{ color: RISK_COLORS[store.risk_level] }}>
          {store.accident_count}건
        </span>
        <RiskBadge level={store.risk_level} />
        {store.last_accident_label && (
          <span className="text-xs text-gray-400">최근: {store.last_accident_label}</span>
        )}
      </div>

      {/* Accident types */}
      <div className="border-b px-4 py-3 shrink-0">
        <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">재해유형</p>
        <AccidentTypeBadges types={store.top_accident_types} />
      </div>

      {/* Detail from API */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-gray-400 animate-pulse">데이터 로딩 중...</p>
          </div>
        )}

        {!loading && detailStats && (
          <>
            {/* Monthly trend mini chart */}
            {detailStats.by_month.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">월별 발생 추이</p>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={detailStats.by_month} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                    <ReTooltip
                      formatter={(val: number) => [`${val}건`, '재해']}
                      labelFormatter={(l: string) => l}
                      contentStyle={{ fontSize: 11 }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Accident type breakdown */}
            {detailStats.by_accident_type.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">유형별 분포</p>
                <ResponsiveContainer width="100%" height={Math.min(detailStats.by_accident_type.length * 24 + 10, 160)}>
                  <BarChart
                    data={detailStats.by_accident_type.slice(0, 6)}
                    layout="vertical"
                    margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 9 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 9 }} width={60} />
                    <ReTooltip formatter={(val: number) => [`${val}건`, '재해']} contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                      {detailStats.by_accident_type.slice(0, 6).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Repeated accident sidebar ────────────────────────────────────────────────

function RepeatedSidebar({
  stores,
  selectedStore,
  onSelect,
}: {
  stores: StoreRisk[]
  selectedStore: string | null
  onSelect: (s: StoreRisk) => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>('count')
  const sorted = sortRepeated(stores, sortKey)
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const setCardRef = (name: string) => (el: HTMLButtonElement | null) => {
    if (el) cardRefs.current.set(name, el)
    else cardRefs.current.delete(name)
  }

  return (
    <div className="flex h-full flex-col rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-red-700">반복 재해 매장</span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{stores.length}</span>
        </div>
        <p className="text-xs text-gray-400">3건 이상 발생</p>
      </div>

      <div className="flex gap-1 border-b px-3 py-2 shrink-0">
        {([['count', '건수순'], ['recent', '최근순'], ['alpha', '가나다']] as [SortKey, string][]).map(([k, lbl]) => (
          <button
            key={k}
            onClick={() => setSortKey(k)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              sortKey === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sorted.map((s) => {
          const isActive = selectedStore === s.store_name
          return (
            <button
              key={s.store_name}
              ref={setCardRef(s.store_name)}
              onClick={() => onSelect(s)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                isActive
                  ? 'border-blue-400 bg-blue-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-red-200 hover:bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate leading-snug">{s.store_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.team}</p>
                  {s.last_accident_label && (
                    <p className="text-xs text-gray-400 mt-0.5">{s.last_accident_label}</p>
                  )}
                  <div className="mt-1.5">
                    <AccidentTypeBadges types={s.top_accident_types} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                    {s.accident_count}건
                  </span>
                  {isActive && <p className="mt-1 text-xs text-blue-500">지도 보기 ↗</p>}
                </div>
              </div>
            </button>
          )
        })}
        {sorted.length === 0 && (
          <p className="py-6 text-center text-xs text-gray-400">해당 조건의 반복 재해 매장이 없습니다.</p>
        )}
      </div>
    </div>
  )
}

// ─── Select helper ────────────────────────────────────────────────────────────

function MapSelect({ label, value, options, onChange }: {
  label: string; value: string; options: (string | number)[]; onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <label className="text-xs text-gray-500 whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="all">전체</option>
        {options.map((o) => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
      </select>
    </div>
  )
}

function ToggleGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { v: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs font-medium">
      {options.map(({ v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-3 py-1.5 transition-colors ${value === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function CheckToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
        checked ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className={`h-3.5 w-3.5 rounded border text-center leading-3 text-xs ${checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
        {checked ? '✓' : ''}
      </span>
      {label}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MapPageClient({ initialStoreRisks, hierarchy }: Props) {
  const [storeRisks, setStoreRisks]     = useState<StoreRisk[]>(initialStoreRisks)
  const [filters, setFilters]           = useState<MapFilters>(EMPTY)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [isPending, startTransition]    = useTransition()

  // Map display controls
  const [mapMode, setMapMode]           = useState<'marker' | 'heatmap'>('marker')
  const [colorMode, setColorMode]       = useState<'risk' | 'type'>('risk')
  const [highlightTop, setHighlightTop] = useState(false)
  const [showOnlyRepeated, setShowOnlyRepeated] = useState(false)
  const [recentMonths, setRecentMonths] = useState<number | null>(null)

  // Store detail
  const [detailStats, setDetailStats]   = useState<{ by_month: MonthlyTrend[]; by_accident_type: GroupCount[] } | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Fetch store detail — includes current filter context so charts match the map
  useEffect(() => {
    if (!selectedStore) { setDetailStats(null); return }
    setDetailLoading(true)
    const p = new URLSearchParams({ store: selectedStore })
    if (filters.year          !== 'all') p.set('year',          filters.year)
    if (filters.month         !== 'all') p.set('month',         filters.month)
    if (filters.department    !== 'all') p.set('department',    filters.department)
    if (filters.team          !== 'all') p.set('team',          filters.team)
    if (filters.accident_type !== 'all') p.set('accident_type', filters.accident_type)
    fetch(`/api/stats?${p}`)
      .then((r) => r.json())
      .then((d: DashboardStats) => {
        setDetailStats({ by_month: d.by_month, by_accident_type: d.by_accident_type })
      })
      .catch(() => {})
      .finally(() => setDetailLoading(false))
  }, [selectedStore, filters])

  // Cascading dropdown visibility
  const visibleTeams =
    filters.department !== 'all' && hierarchy.dept_team_map[filters.department]
      ? hierarchy.dept_team_map[filters.department]
      : hierarchy.all_teams
  const visibleStores =
    filters.team !== 'all' && hierarchy.team_store_map[filters.team]
      ? hierarchy.team_store_map[filters.team]
      : filters.department !== 'all'
        ? visibleTeams.flatMap((t) => hierarchy.team_store_map[t] ?? []).sort()
        : hierarchy.all_stores

  // Client-side display filters
  const displayedStores = useMemo(() => {
    let s = storeRisks
    if (showOnlyRepeated) s = s.filter((x) => x.accident_count >= 3)
    if (recentMonths)     s = s.filter((x) => isRecent(x.last_accident_label, recentMonths))
    return s
  }, [storeRisks, showOnlyRepeated, recentMonths])

  const repeatedStores = useMemo(
    () => displayedStores.filter((s) => s.accident_count >= 3),
    [displayedStores],
  )

  const high   = displayedStores.filter((s) => s.risk_level === 'high').length
  const medium = displayedStores.filter((s) => s.risk_level === 'medium').length
  const total  = displayedStores.length

  const selectedStoreObj = useMemo(
    () => storeRisks.find((s) => s.store_name === selectedStore) ?? null,
    [storeRisks, selectedStore],
  )

  // Human-readable summary of active data filters — shown in the store detail panel
  const filterLabel = useMemo(() => {
    const parts: string[] = []
    if (filters.year          !== 'all') parts.push(`${filters.year}년`)
    if (filters.month         !== 'all') parts.push(`${filters.month}월`)
    if (filters.department    !== 'all') parts.push(filters.department)
    if (filters.team          !== 'all') parts.push(filters.team)
    if (filters.accident_type !== 'all') parts.push(filters.accident_type)
    return parts.length > 0 ? parts.join(' · ') : null
  }, [filters])

  const fetchData = useCallback((next: MapFilters) => {
    startTransition(async () => {
      const params = new URLSearchParams()
      if (next.department    !== 'all') params.set('department',    next.department)
      if (next.team          !== 'all') params.set('team',          next.team)
      if (next.store         !== 'all') params.set('store',         next.store)
      if (next.year          !== 'all') params.set('year',          next.year)
      if (next.month         !== 'all') params.set('month',         next.month)
      if (next.accident_type !== 'all') params.set('accident_type', next.accident_type)
      try {
        const res = await fetch(`/api/stats?${params.toString()}`)
        if (!res.ok) return
        const data = await res.json() as { store_risks: StoreRisk[] }
        setStoreRisks(data.store_risks ?? [])
        setSelectedStore(null)
      } catch { /* keep existing data */ }
    })
  }, [])

  const updateFilter = (key: keyof MapFilters, value: string) => {
    let next = { ...filters, [key]: value }
    if (key === 'department') {
      const newTeams = value !== 'all' ? (hierarchy.dept_team_map[value] ?? []) : hierarchy.all_teams
      if (!newTeams.includes(next.team)) next = { ...next, team: 'all', store: 'all' }
      else if (next.store !== 'all') {
        const newStores = next.team !== 'all' ? (hierarchy.team_store_map[next.team] ?? []) : []
        if (!newStores.includes(next.store)) next = { ...next, store: 'all' }
      }
    }
    if (key === 'team') {
      const newStores = value !== 'all' ? (hierarchy.team_store_map[value] ?? []) : []
      if (value !== 'all' && !newStores.includes(next.store)) next = { ...next, store: 'all' }
    }
    // Time-dimension server filters make last_accident_label historical, so the
    // client-side "recent N months" display filter would produce an empty map.
    // Clear recentMonths whenever the user pins to a specific year or month.
    if ((key === 'year' || key === 'month') && value !== 'all') {
      setRecentMonths(null)
    }
    setFilters(next)
    fetchData(next)
  }

  const reset = () => { setFilters(EMPTY); fetchData(EMPTY); setRecentMonths(null) }
  const hasFilter = Object.entries(filters).some(([, v]) => v !== 'all')

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rounded-xl bg-white shadow-sm divide-y divide-gray-100">
        {/* Row 1: data filters */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <span className="text-xs font-semibold text-gray-500">필터</span>
          <MapSelect label="영업부" value={filters.department} options={hierarchy.departments} onChange={(v) => updateFilter('department', v)} />
          <MapSelect label="팀"     value={filters.team}       options={visibleTeams}          onChange={(v) => updateFilter('team', v)} />
          <MapSelect label="매장"   value={filters.store}      options={visibleStores}         onChange={(v) => updateFilter('store', v)} />
          <MapSelect
            label="연도"
            value={filters.year}
            options={hierarchy.years}
            onChange={(v) => updateFilter('year', v)}
          />
          <MapSelect
            label="월"
            value={filters.month}
            options={Array.from({ length: 12 }, (_, i) => i + 1)}
            onChange={(v) => updateFilter('month', v)}
          />
          <MapSelect
            label="재해유형"
            value={filters.accident_type}
            options={hierarchy.accident_types}
            onChange={(v) => updateFilter('accident_type', v)}
          />
          {hasFilter && (
            <button onClick={reset} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200">
              초기화
            </button>
          )}
          {isPending && <span className="text-xs text-gray-400 animate-pulse">불러오는 중...</span>}
        </div>

        {/* Row 2: display controls */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
          <ToggleGroup
            value={mapMode}
            options={[{ v: 'marker', label: '마커' }, { v: 'heatmap', label: '히트맵' }]}
            onChange={setMapMode}
          />
          {mapMode === 'marker' && (
            <ToggleGroup
              value={colorMode}
              options={[{ v: 'risk', label: '위험도별' }, { v: 'type', label: '유형별' }]}
              onChange={setColorMode}
            />
          )}
          {mapMode === 'marker' && (
            <CheckToggle checked={highlightTop} onChange={setHighlightTop} label="상위 3 강조" />
          )}
          <CheckToggle checked={showOnlyRepeated} onChange={setShowOnlyRepeated} label="반복재해만" />

          {/* Recent months filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">최근</span>
            <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs font-medium">
              {([null, 3, 6, 12] as const).map((m) => (
                <button
                  key={m ?? 'all'}
                  onClick={() => setRecentMonths(m)}
                  className={`px-2.5 py-1.5 transition-colors ${recentMonths === m ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {m ? `${m}개월` : '전체'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">고위험 매장 (3건 이상)</p>
          <p className="text-2xl font-bold text-red-600">{high}</p>
        </div>
        <div className="rounded-xl border-l-4 border-orange-500 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">중위험 매장 (1-2건)</p>
          <p className="text-2xl font-bold text-orange-600">{medium}</p>
        </div>
        <div className="rounded-xl border-l-4 border-gray-400 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">재해 발생 매장 합계</p>
          <p className="text-2xl font-bold text-gray-700">{total}</p>
        </div>
      </div>

      {/* Two-column: map (left) + sidebar/detail (right) */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        {/* Map — ~65% */}
        <div className="min-w-0 lg:flex-[65]">
          <RiskMap
            storeRisks={displayedStores}
            selectedStore={selectedStore}
            onStoreClick={(s) => setSelectedStore(s.store_name)}
            mode={mapMode}
            colorMode={colorMode}
            highlightTop={highlightTop}
          />
        </div>

        {/* Right column — ~35% */}
        {(selectedStoreObj || repeatedStores.length > 0) && (
          <div className="lg:flex-[35] lg:min-h-[600px]">
            {selectedStoreObj ? (
              <StoreDetailPanel
                store={selectedStoreObj}
                detailStats={detailStats}
                loading={detailLoading}
                filterLabel={filterLabel}
                onClose={() => setSelectedStore(null)}
              />
            ) : (
              <RepeatedSidebar
                stores={repeatedStores}
                selectedStore={selectedStore}
                onSelect={(s) => setSelectedStore(s.store_name)}
              />
            )}
          </div>
        )}
      </div>

      {/* Full-width store table */}
      {displayedStores.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">재해 발생 매장 목록</p>
            <p className="text-xs text-gray-400">{displayedStores.length}개 매장</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">매장명</th>
                  <th className="px-4 py-3 text-left">팀</th>
                  <th className="px-4 py-3 text-left">주소</th>
                  <th className="px-4 py-3 text-left">재해유형</th>
                  <th className="px-4 py-3 text-center">건수</th>
                  <th className="px-4 py-3 text-center">위험도</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedStores.map((s) => (
                  <tr
                    key={s.store_name}
                    className={`cursor-pointer ${selectedStore === s.store_name ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedStore(s.store_name)}
                  >
                    <td className="px-4 py-3 font-medium">{s.store_name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.team}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{s.address ?? '-'}</td>
                    <td className="px-4 py-3"><AccidentTypeBadges types={s.top_accident_types} /></td>
                    <td className="px-4 py-3 text-center font-semibold">{s.accident_count}</td>
                    <td className="px-4 py-3 text-center"><RiskBadge level={s.risk_level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
