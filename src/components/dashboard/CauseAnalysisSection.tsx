/**
 * CauseAnalysisSection — three ranked charts for accident cause analysis.
 *
 * Charts:
 *   - by_cause_object  (기인물)
 *   - by_body_part     (상해 부위)
 *   - by_diagnosis     (상해 종류 / 진단)
 *
 * Uses the same BarChartCard already used by the rest of the dashboard.
 */
import BarChartCard from './BarChart'
import type { GroupCount } from '@/types'

interface Props {
  by_cause_object: GroupCount[]
  by_body_part:    GroupCount[]
  by_diagnosis:    GroupCount[]
}

export default function CauseAnalysisSection({ by_cause_object, by_body_part, by_diagnosis }: Props) {
  const hasAny = by_cause_object.length > 0 || by_body_part.length > 0 || by_diagnosis.length > 0
  if (!hasAny) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="inline-block h-5 w-1 rounded-full" style={{ backgroundColor: '#E50012' }} />
        <span className="text-sm font-bold text-gray-800">재해 원인 분석</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
          기인물 · 상해부위 · 진단
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <BarChartCard
          title="기인물별 재해 현황"
          data={by_cause_object}
          color="#0ea5e9"
          maxItems={10}
        />
        <BarChartCard
          title="상해부위별 재해 현황"
          data={by_body_part}
          color="#8b5cf6"
          maxItems={10}
        />
        <BarChartCard
          title="상해종류(진단)별 재해 현황"
          data={by_diagnosis}
          color="#10b981"
          maxItems={10}
        />
      </div>
    </div>
  )
}
