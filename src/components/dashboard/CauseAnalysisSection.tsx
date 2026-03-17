import BarChartCard from './BarChart'
import { Badge } from '@/components/ui/badge'
import type { GroupCount } from '@/types'

interface Props {
  by_cause_object: GroupCount[]
  by_body_part:    GroupCount[]
  by_diagnosis:    GroupCount[]
}

export default function CauseAnalysisSection({ by_cause_object, by_body_part, by_diagnosis }: Props) {
  if (!by_cause_object.length && !by_body_part.length && !by_diagnosis.length) return null
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1 rounded-full" style={{ backgroundColor: '#E50012' }} />
        <span className="text-sm font-bold text-gray-800">재해 원인 분석</span>
        <Badge variant="secondary">기인물 · 상해부위 · 진단</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <BarChartCard title="기인물별 재해 현황" data={by_cause_object} color="#0ea5e9" maxItems={10} />
        <BarChartCard title="상해부위별 재해 현황" data={by_body_part} color="#8b5cf6" maxItems={10} />
        <BarChartCard title="상해종류(진단)별 재해 현황" data={by_diagnosis} color="#10b981" maxItems={10} />
      </div>
    </div>
  )
}
