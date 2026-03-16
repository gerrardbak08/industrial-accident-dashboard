/**
 * Excel parsing logic for both data sources:
 *   - 산업재해DB sheet  → accidents
 *   - 매장현황 sheet     → stores
 *
 * Excel date serial conversion:
 *   Excel counts days since 1900-01-00 (off-by-2 quirk).
 *   Formula: new Date((serial - 25569) * 86400 * 1000) gives UTC date.
 */
import * as XLSX from 'xlsx'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedAccident {
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
  accident_type: string
  accident_form: string
  age: number | null
  age_group: string
  gender: string
  tenure_years: number | null
  employment_type: string
  work_loss_days: number | null
  body_part: string | null
  causative_object: string | null
  diagnosis: string | null
  branch_office: string | null
  employee_id: string | null
}

export interface ParsedStore {
  store_name: string
  team: string
  type: string
  open_date: string | null
  address: string | null
  area_pyeong: number | null
}

export interface ParseResult<T> {
  rows: T[]
  errors: string[]
}

// ─── Excel date serial → ISO date string ─────────────────────────────────────

function excelSerialToIso(serial: unknown): string | null {
  if (serial === null || serial === undefined || serial === '') return null
  if (typeof serial === 'string') {
    // Already a string date like "2026-01-07"
    const trimmed = serial.trim()
    if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) return trimmed.slice(0, 10)
    return null
  }
  if (typeof serial !== 'number') return null
  // Excel serial: days since 1899-12-30
  const msPerDay = 86400 * 1000
  const date = new Date((serial - 25569) * msPerDay)
  if (isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

/** Parse "7년" → 7, "0년" → 0, "12년" → 12. Returns null if unparseable. */
function parseTenureYears(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const match = value.match(/(\d+(?:\.\d+)?)/)
    if (match) return parseFloat(match[1])
  }
  return null
}

function str(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

// ─── Parse accidents ──────────────────────────────────────────────────────────

/**
 * Column index map for 산업재해DB (0-based):
 * 0  KPI집계현황분류
 * 1  재해유형
 * 2  근로손실일수
 * 3  사고내용
 * 4  이름
 * 5  주민등록번호
 * 6  재해일자
 * 7  요양시작일
 * 8  요양종료일
 * 9  의료기관
 * 10 재해발생형태
 * 11 정밀진단
 * 12 요양관리지사
 * 13 년
 * 14 월
 * 15 반기
 * 16 분기
 * 17 부서
 * 18 팀명
 * 19 매장명
 * 20 파트장
 * 21 사번
 * 22 재해자명
 * 23 생년월일
 * 24 나이
 * 25 나이대
 * 26 성별
 * 27 근로복지공단 제출
 * 28 산업재해조사표 제출
 * 29 재해일자2
 * 30 입사일자
 * 31 근속기간 (년)
 * 32 고용형태
 * 33 신청유형
 * 34 공상 비용 계
 * 35 재해 종류
 * 36 재해 유형
 * 37 상해부위 (근골격계)
 * 38 기인물
 * 39 상병명
 * 40 사고 내용
 * 41 근로손실일수2
 */
/**
 * Two supported column layouts:
 *
 * v1 — Original 42-column format (sheet name: "산업재해DB")
 *   year=13, month=14, quarter=16, half_year=15
 *   accident_date=6, treatment_start=7, treatment_end=8
 *   department=17, team_name=18, store_name=19
 *   accident_type=36 (fallback 1), accident_form=10
 *   age=24, age_group=25, gender=26
 *   tenure_years=31, employment_type=32, work_loss_days=2
 *   body_part=37, causative_object=38, diagnosis=39
 *   branch_office=12, employee_id=21
 *
 * v2 — Simplified 28-column export (any sheet name, header row starts with "년")
 *   year=0, month=1, half_year=2, quarter=3
 *   department=4, team_name=5, store_name=6
 *   employee_id=8, age=11, age_group=12, gender=13
 *   accident_date=16, tenure_years=18, employment_type=19
 *   accident_form=22 (재해 종류), accident_type=23 (재해 유형)
 *   body_part=24, causative_object=25, diagnosis=26
 *   (no treatment dates, no work_loss_days, no branch_office)
 */

/** Find the accident worksheet — by name first, then by header content. */
function findAccidentSheet(wb: XLSX.WorkBook): XLSX.WorkSheet | null {
  if (wb.SheetNames.includes('산업재해DB')) return wb.Sheets['산업재해DB']
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]
    if (rows.length < 2) continue
    const headers = (rows[0] as unknown[]).map(String)
    if (
      headers.includes('팀명') &&
      headers.includes('매장명') &&
      (headers.includes('재해 유형') || headers.includes('재해유형'))
    ) {
      return ws
    }
  }
  return null
}

export function parseAccidents(buffer: Buffer): ParseResult<ParsedAccident> {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const ws = findAccidentSheet(wb)

  if (!ws) {
    return {
      rows: [],
      errors: [`사고 데이터 시트를 찾을 수 없습니다. "산업재해DB" 시트 또는 팀명/매장명/재해 유형 컬럼이 포함된 시트가 필요합니다. 발견된 시트: ${wb.SheetNames.join(', ')}`],
    }
  }

  const raw: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]
  const headerRow = (raw[0] ?? []).map(String)
  const dataRows = raw.slice(1)

  // Detect layout by first header cell
  const isV2 = headerRow[0] === '년'

  const rows: ParsedAccident[] = []
  const errors: string[] = []

  dataRows.forEach((row, i) => {
    if (!row || row.length === 0) return
    if (row.every((c) => c === null || c === undefined || c === '')) return

    try {
      let accident: ParsedAccident

      if (isV2) {
        // v2: simplified 28-column export (e.g. data.xlsx / Sheet1)
        accident = {
          year:            num(row[0])  ?? 0,
          month:           num(row[1])  ?? 0,
          half_year:       str(row[2]),
          quarter:         num(row[3])  ?? 0,
          accident_date:   excelSerialToIso(row[16]),
          treatment_start: null,
          treatment_end:   null,
          department:      str(row[4]),
          team_name:       str(row[5]),
          store_name:      str(row[6]),
          employee_id:     str(row[8])  || null,
          age:             num(row[11]),
          age_group:       str(row[12]),
          gender:          str(row[13]),
          tenure_years:    parseTenureYears(row[18]),
          employment_type: str(row[19]),
          accident_form:   str(row[22]),
          accident_type:   str(row[23]) || str(row[22]),
          work_loss_days:  null,
          body_part:       str(row[24]) || null,
          causative_object: str(row[25]) || null,
          diagnosis:       str(row[26]) || null,
          branch_office:   null,
        }
      } else {
        // v1: original 42-column format (sheet: 산업재해DB)
        accident = {
          year:            num(row[13]) ?? 0,
          month:           num(row[14]) ?? 0,
          quarter:         num(row[16]) ?? 0,
          half_year:       str(row[15]),
          accident_date:   excelSerialToIso(row[6]),
          treatment_start: excelSerialToIso(row[7]),
          treatment_end:   excelSerialToIso(row[8]),
          department:      str(row[17]),
          team_name:       str(row[18]),
          store_name:      str(row[19]),
          accident_type:   str(row[36]) || str(row[1]),
          accident_form:   str(row[10]),
          age:             num(row[24]),
          age_group:       str(row[25]),
          gender:          str(row[26]),
          tenure_years:    parseTenureYears(row[31]),
          employment_type: str(row[32]),
          work_loss_days:  num(row[2]),
          body_part:       str(row[37]) || null,
          causative_object: str(row[38]) || null,
          diagnosis:       str(row[39]) || null,
          branch_office:   str(row[12]) || null,
          employee_id:     str(row[21]) || null,
        }
      }

      rows.push(accident)
    } catch (err) {
      errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : String(err)}`)
    }
  })

  return { rows, errors }
}

// ─── Parse stores ─────────────────────────────────────────────────────────────

/**
 * Column index map for 매장현황 (0-based):
 * 0 매장명
 * 1 지역 (team)
 * 2 형태 (type)
 * 3 단품관리
 * 4 오픈일
 * 5 평수
 * 6 실평수
 * 7 창고
 * 8 계약면적(㎡)
 * 9 진열평수
 * 10 신주소
 */
export function parseStores(buffer: Buffer): ParseResult<ParsedStore> {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = '매장현황'

  if (!wb.SheetNames.includes(sheetName)) {
    return {
      rows: [],
      errors: [`Sheet "${sheetName}" not found. Found: ${wb.SheetNames.join(', ')}`],
    }
  }

  const ws = wb.Sheets[sheetName]
  const raw: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]
  const dataRows = raw.slice(1)

  const rows: ParsedStore[] = []
  const errors: string[] = []
  const seen = new Set<string>()

  dataRows.forEach((row, i) => {
    if (!row || row.length === 0) return
    if (row.every((c) => c === null || c === undefined || c === '')) return

    try {
      const storeName = str(row[0])
      if (!storeName) return

      if (seen.has(storeName)) {
        // Duplicate store name — keep first occurrence
        return
      }
      seen.add(storeName)

      rows.push({
        store_name: storeName,
        team: str(row[1]),
        type: str(row[2]),
        open_date: excelSerialToIso(row[4]),
        address: str(row[10]) || null,
        area_pyeong: num(row[5]),
      })
    } catch (err) {
      errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : String(err)}`)
    }
  })

  return { rows, errors }
}

/**
 * Auto-detect which parser to use.
 * Primary: exact sheet name match.
 * Fallback: header-content scan of every sheet.
 */
export function detectFileType(buffer: Buffer): 'accidents' | 'stores' | null {
  try {
    const wb = XLSX.read(buffer, { type: 'buffer' })

    // Primary: exact sheet name
    if (wb.SheetNames.includes('산업재해DB')) return 'accidents'
    if (wb.SheetNames.includes('매장현황')) return 'stores'

    // Fallback: inspect each sheet's header row
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name]
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]
      if (rows.length < 2) continue
      const headers = (rows[0] as unknown[]).map(String)

      // Accident indicators: team + store + accident-type column
      if (
        headers.includes('팀명') &&
        headers.includes('매장명') &&
        (headers.includes('재해 유형') || headers.includes('재해유형'))
      ) {
        return 'accidents'
      }

      // Store indicators: store name + type + address column
      if (
        headers.includes('매장명') &&
        headers.includes('형태') &&
        headers.includes('신주소')
      ) {
        return 'stores'
      }
    }

    return null
  } catch {
    return null
  }
}
