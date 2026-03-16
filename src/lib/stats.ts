/**
 * Pure computation layer — no HTTP, no Next.js dependencies.
 *
 * Both server pages and API routes import from here.
 * This eliminates HTTP round-trips from server components and removes
 * any dependency on a hardcoded base URL or port number.
 */
import { loadAccidents, loadStores, filterAccidents } from './store'
import { getStoreCoords } from './geo-fallback'
import type {
  AccidentRow,
  StoreRow,
  DashboardStats,
  GroupCount,
  MonthlyTrend,
  StoreRisk,
  AlertItem,
} from '@/types'

export type { DashboardStats }

// ─── Filter params ────────────────────────────────────────────────────────────

export interface StatsFilters {
  year?: string
  month?: string
  department?: string
  team?: string
  accident_type?: string
  store?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupCount(rows: AccidentRow[], key: (r: AccidentRow) => string): GroupCount[] {
  const map = new Map<string, { count: number; work_loss_days: number }>()
  for (const r of rows) {
    const label = key(r) || '미분류'
    const cur = map.get(label) ?? { count: 0, work_loss_days: 0 }
    map.set(label, { count: cur.count + 1, work_loss_days: cur.work_loss_days + (r.work_loss_days ?? 0) })
  }
  return Array.from(map.entries())
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.count - a.count)
}

function tenureGroup(r: AccidentRow): string {
  if (r.tenure_years === null) return '미확인'
  if (r.tenure_years < 1)  return '1년 미만'
  if (r.tenure_years < 3)  return '1-3년'
  if (r.tenure_years < 6)  return '3-6년'
  if (r.tenure_years < 11) return '6-11년'
  return '11년 이상'
}

const TENURE_ORDER = ['1년 미만', '1-3년', '3-6년', '6-11년', '11년 이상', '미확인']

// ─── Alert computation ────────────────────────────────────────────────────────

function computeAlerts(accidents: AccidentRow[]): AlertItem[] {
  const total = accidents.length
  if (total === 0) return []

  const alerts: AlertItem[] = []

  const byDept = groupCount(accidents, (r) => r.department)
  for (const d of byDept) {
    const share = (d.count / total) * 100
    if (share >= 30) {
      alerts.push({
        category: 'department',
        label: d.label,
        count: d.count,
        share: Math.round(share),
        severity: share >= 40 ? 'high' : 'medium',
        message: `전체 재해의 ${Math.round(share)}% 집중`,
      })
    }
  }

  const byTeam = groupCount(accidents, (r) => r.team_name)
  for (const t of byTeam.slice(0, 5)) {
    const share = (t.count / total) * 100
    if (share >= 12) {
      alerts.push({
        category: 'team',
        label: t.label,
        count: t.count,
        share: Math.round(share),
        severity: share >= 18 ? 'high' : 'medium',
        message: `팀 재해 집중 ${t.count}건`,
      })
    }
  }

  const byType = groupCount(accidents, (r) => r.accident_type)
  for (const t of byType.slice(0, 3)) {
    const share = (t.count / total) * 100
    if (share >= 28) {
      alerts.push({
        category: 'accident_type',
        label: t.label,
        count: t.count,
        share: Math.round(share),
        severity: share >= 35 ? 'high' : 'medium',
        message: `주요 재해유형 ${t.count}건 (${Math.round(share)}%)`,
      })
    }
  }

  return alerts
    .sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'high' ? -1 : 1
      return b.count - a.count
    })
    .slice(0, 6)
}

// ─── Main computation ─────────────────────────────────────────────────────────

function computeStats(accidents: AccidentRow[], stores: StoreRow[]): DashboardStats {
  const storeMap = new Map(stores.map((s) => [s.store_name, s]))

  const total_accidents = accidents.length
  const total_work_loss = accidents.reduce((s, r) => s + (r.work_loss_days ?? 0), 0)
  const ages    = accidents.map((r) => r.age).filter((a): a is number => a !== null)
  const tenures = accidents.map((r) => r.tenure_years).filter((t): t is number => t !== null)
  const avg_age    = ages.length    > 0 ? Math.round(ages.reduce((a, b) => a + b)    / ages.length    * 10) / 10 : null
  const avg_tenure = tenures.length > 0 ? Math.round(tenures.reduce((a, b) => a + b) / tenures.length * 10) / 10 : null
  const affected_stores = new Set(accidents.map((r) => r.store_name)).size
  const affected_teams  = new Set(accidents.map((r) => r.team_name)).size

  const by_department    = groupCount(accidents, (r) => r.department)
  const by_team          = groupCount(accidents, (r) => r.team_name).slice(0, 20)
  const by_accident_type = groupCount(accidents, (r) => r.accident_type)
  const by_age_group     = groupCount(accidents, (r) => r.age_group).sort((a, b) => a.label.localeCompare(b.label))
  const by_tenure_group  = groupCount(accidents, tenureGroup).sort(
    (a, b) => TENURE_ORDER.indexOf(a.label) - TENURE_ORDER.indexOf(b.label),
  )

  const by_cause_object = groupCount(accidents, (r) => r.causative_object ?? '').filter((g) => g.label !== '미분류').slice(0, 12)
  const by_body_part    = groupCount(accidents, (r) => r.body_part ?? '').filter((g) => g.label !== '미분류').slice(0, 12)
  const by_diagnosis    = groupCount(accidents, (r) => r.diagnosis ?? '').filter((g) => g.label !== '미분류').slice(0, 12)

  const monthMap = new Map<string, MonthlyTrend>()
  for (const r of accidents) {
    if (!r.year || !r.month) continue
    const label = `${r.year}-${String(r.month).padStart(2, '0')}`
    const cur = monthMap.get(label) ?? { year: r.year, month: r.month, label, count: 0 }
    monthMap.set(label, { ...cur, count: cur.count + 1 })
  }
  const by_month = Array.from(monthMap.values()).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  )

  const storeTypeMap      = new Map<string, Map<string, number>>()
  const storeLastMonthMap = new Map<string, { year: number; month: number }>()
  const accidentsByStore  = new Map<string, number>()

  for (const r of accidents) {
    accidentsByStore.set(r.store_name, (accidentsByStore.get(r.store_name) ?? 0) + 1)
    if (r.accident_type) {
      if (!storeTypeMap.has(r.store_name)) storeTypeMap.set(r.store_name, new Map())
      const tm = storeTypeMap.get(r.store_name)!
      tm.set(r.accident_type, (tm.get(r.accident_type) ?? 0) + 1)
    }
    if (r.year && r.month) {
      const cur = storeLastMonthMap.get(r.store_name)
      if (!cur || r.year > cur.year || (r.year === cur.year && r.month > cur.month)) {
        storeLastMonthMap.set(r.store_name, { year: r.year, month: r.month })
      }
    }
  }

  const store_risks: StoreRisk[] = Array.from(accidentsByStore.entries())
    .map(([store_name, accident_count]) => {
      const store = storeMap.get(store_name)
      const team = store?.team ?? accidents.find((a) => a.store_name === store_name)?.team_name ?? ''
      const coords = getStoreCoords(store?.lat ?? null, store?.lng ?? null, team)
      const risk_level: StoreRisk['risk_level'] = accident_count >= 3 ? 'high' : accident_count >= 1 ? 'medium' : 'none'
      const typeMap = storeTypeMap.get(store_name) ?? new Map()
      const top_accident_types = Array.from(typeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
      const lm = storeLastMonthMap.get(store_name)
      const last_accident_label = lm
        ? `${lm.year}-${String(lm.month).padStart(2, '0')}`
        : null
      return {
        store_name,
        team,
        address: store?.address ?? null,
        lat: coords?.[0] ?? null,
        lng: coords?.[1] ?? null,
        accident_count,
        risk_level,
        top_accident_types,
        last_accident_label,
      }
    })
    .sort((a, b) => b.accident_count - a.accident_count)

  const alerts = computeAlerts(accidents)

  return {
    kpi: { total_accidents, total_work_loss_days: total_work_loss, avg_age, avg_tenure, affected_stores, affected_teams },
    by_department, by_team, by_accident_type, by_age_group, by_tenure_group, by_month,
    by_cause_object, by_body_part, by_diagnosis,
    store_risks, alerts,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getDashboardStats(filters: StatsFilters = {}): Promise<DashboardStats> {
  const [allAccidents, stores] = await Promise.all([loadAccidents(), loadStores()])
  const accidents = filterAccidents(allAccidents, filters)
  return computeStats(accidents, stores)
}

export interface FilterOptions {
  years: number[]
  departments: string[]
  teams: string[]
  accident_types: string[]
  stores: string[]
  dept_team_map: Record<string, string[]>
  team_store_map: Record<string, string[]>
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const accidents = await loadAccidents()

  const deptTeamMap: Record<string, Set<string>> = {}
  const teamStoreMap: Record<string, Set<string>> = {}

  for (const a of accidents) {
    if (a.department && a.team_name) {
      if (!deptTeamMap[a.department]) deptTeamMap[a.department] = new Set()
      deptTeamMap[a.department].add(a.team_name)
    }
    if (a.team_name && a.store_name) {
      if (!teamStoreMap[a.team_name]) teamStoreMap[a.team_name] = new Set()
      teamStoreMap[a.team_name].add(a.store_name)
    }
  }

  const dept_team_map: Record<string, string[]> = {}
  for (const [dept, teams] of Object.entries(deptTeamMap)) {
    dept_team_map[dept] = Array.from(teams).sort()
  }

  const team_store_map: Record<string, string[]> = {}
  for (const [team, stores] of Object.entries(teamStoreMap)) {
    team_store_map[team] = Array.from(stores).sort()
  }

  return {
    years:          Array.from(new Set(accidents.map((a) => a.year).filter((y) => y > 0))).sort((a, b) => b - a),
    departments:    Array.from(new Set(accidents.map((a) => a.department).filter(Boolean))).sort(),
    teams:          Array.from(new Set(accidents.map((a) => a.team_name).filter(Boolean))).sort(),
    accident_types: Array.from(new Set(accidents.map((a) => a.accident_type).filter(Boolean))).sort(),
    stores:         Array.from(new Set(accidents.map((a) => a.store_name).filter(Boolean))).sort(),
    dept_team_map,
    team_store_map,
  }
}
