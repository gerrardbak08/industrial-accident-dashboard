// ─── Database row shapes (as returned by SQLite) ────────────────────────────

export interface AccidentRow {
  id: number
  year: number
  month: number
  quarter: number
  half_year: string
  accident_date: string | null
  treatment_start: string | null
  treatment_end: string | null
  department: string
  team_name: string
  store_name: string
  accident_type: string        // 재해유형
  accident_form: string        // 재해발생형태
  age: number | null
  age_group: string
  gender: string
  tenure_years: number | null  // parsed from "7년" → 7.0
  employment_type: string
  work_loss_days: number | null
  body_part: string | null
  causative_object: string | null
  diagnosis: string | null
  branch_office: string | null
  employee_id: string | null
  uploaded_at: string
}

export interface StoreRow {
  store_name: string
  team: string                 // 지역 (팀 단위)
  type: string                 // 형태: 직영점 / 유통점 / 유통행사
  open_date: string | null
  address: string | null       // 신주소
  lat: number | null
  lng: number | null
  area_pyeong: number | null
}

export interface UploadHistoryRow {
  id: number
  filename: string
  upload_type: 'accidents' | 'stores'
  rows_inserted: number
  uploaded_at: string
  status: 'success' | 'error'
  error_message: string | null
}

// ─── API response shapes ─────────────────────────────────────────────────────

export interface KpiStats {
  total_accidents: number
  total_work_loss_days: number
  avg_age: number | null
  avg_tenure: number | null
  affected_stores: number
  affected_teams: number
}

export interface GroupCount {
  label: string
  count: number
  work_loss_days: number
}

export interface MonthlyTrend {
  year: number
  month: number
  label: string   // "2024-01"
  count: number
}

export interface AccidentTypeCount {
  type: string
  count: number
}

export interface StoreRisk {
  store_name: string
  team: string
  address: string | null
  lat: number | null
  lng: number | null
  accident_count: number
  risk_level: 'high' | 'medium' | 'low' | 'none'
  top_accident_types: AccidentTypeCount[]
  last_accident_label: string | null   // "2024-03" — for sorting by recency
}

export interface AlertItem {
  category: 'department' | 'team' | 'accident_type'
  label: string
  count: number
  share: number    // percentage of total (0-100)
  severity: 'high' | 'medium'
  message: string
}

export interface DashboardStats {
  kpi: KpiStats
  by_department: GroupCount[]
  by_team: GroupCount[]
  by_accident_type: GroupCount[]
  by_age_group: GroupCount[]
  by_tenure_group: GroupCount[]
  by_month: MonthlyTrend[]
  by_cause_object: GroupCount[]
  by_body_part: GroupCount[]
  by_diagnosis: GroupCount[]
  store_risks: StoreRisk[]
  alerts: AlertItem[]
}

// ─── Filter params (shared between client and API) ───────────────────────────

export interface DashboardFilters {
  year?: string
  department?: string
  team?: string
  accident_type?: string
}

// ─── Upload response ─────────────────────────────────────────────────────────

export interface UploadResult {
  success: boolean
  upload_type: 'accidents' | 'stores'
  rows_inserted: number
  message: string
  error?: string
}
