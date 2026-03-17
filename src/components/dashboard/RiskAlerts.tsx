import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { AlertItem } from '@/types'

const CATEGORY_LABEL: Record<AlertItem['category'], string> = {
  department: '영업부', team: '팀', accident_type: '재해유형',
}

const SEV: Record<AlertItem['severity'], { dot: string; bg: string }> = {
  high:   { dot: 'bg-red-500',    bg: 'hover:bg-red-50/60' },
  medium: { dot: 'bg-orange-400', bg: 'hover:bg-orange-50/60' },
}

interface Props { alerts: AlertItem[] }

export default function RiskAlerts({ alerts }: Props) {
  if (alerts.length === 0) return null
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">위험 알림</span>
        <Badge variant="destructive" className="ml-1">{alerts.length}</Badge>
      </div>
      <div className="divide-y divide-gray-50">
        {alerts.map((a, i) => {
          const s = SEV[a.severity]
          return (
            <div key={i} className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${s.bg}`}>
              <span className={`shrink-0 h-2 w-2 rounded-full ${s.dot}`} />
              <Badge variant={a.severity === 'high' ? 'default' : 'secondary'} className="shrink-0">
                {CATEGORY_LABEL[a.category]}
              </Badge>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">{a.label}</span>
              <span className="hidden sm:block shrink-0 text-xs text-gray-400">{a.message}</span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-gray-900">{a.count}건</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
