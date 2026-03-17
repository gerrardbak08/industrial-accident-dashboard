import type { AlertItem } from '@/types'

const CATEGORY_LABEL: Record<AlertItem['category'], string> = {
  department:    '영업부',
  team:          '팀',
  accident_type: '재해유형',
}

const SEV: Record<AlertItem['severity'], { row: string; badge: string; dot: string }> = {
  high:   { row: 'bg-red-50 border-red-200',    badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
  medium: { row: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
}

interface Props {
  alerts: AlertItem[]
}

export default function RiskAlerts({ alerts }: Props) {
  if (alerts.length === 0) return null

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">위험 알림</span>
        <span
          className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
          style={{ backgroundColor: '#E50012' }}
        >
          {alerts.length}
        </span>
      </div>

      {/* Alert rows */}
      <div className="divide-y divide-gray-50">
        {alerts.map((a, i) => {
          const s = SEV[a.severity]
          return (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 ${s.row} border-l-2`}>
              <span className={`shrink-0 h-2 w-2 rounded-full ${s.dot}`} />
              <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${s.badge}`}>
                {CATEGORY_LABEL[a.category]}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">{a.label}</span>
              <span className="shrink-0 text-xs text-gray-500">{a.message}</span>
              <span className="shrink-0 text-sm font-bold text-gray-800 tabular-nums">{a.count}건</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
