/**
 * RiskAlerts — shows threshold-based alert banners above the KPI cards.
 * Triggered when a department/team/type captures a disproportionate share
 * of total accidents.
 */
import type { AlertItem } from '@/types'

const CATEGORY_LABEL: Record<AlertItem['category'], string> = {
  department:    '영업부',
  team:          '팀',
  accident_type: '재해유형',
}

const SEVERITY_STYLE: Record<AlertItem['severity'], { bar: string; badge: string; icon: string }> = {
  high:   { bar: 'border-red-300 bg-red-50',    badge: 'bg-red-100 text-red-700',    icon: '🔴' },
  medium: { bar: 'border-orange-300 bg-orange-50', badge: 'bg-orange-100 text-orange-700', icon: '🟠' },
}

interface Props {
  alerts: AlertItem[]
}

export default function RiskAlerts({ alerts }: Props) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="inline-block h-5 w-1 rounded-full" style={{ backgroundColor: '#E50012' }} />
        <span className="text-sm font-bold text-gray-800">위험 알림</span>
        <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: '#E50012' }}>
          {alerts.length}건
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {alerts.map((a, i) => {
          const style = SEVERITY_STYLE[a.severity]
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${style.bar}`}
            >
              <span className="mt-0.5 text-base leading-none">{style.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                    {CATEGORY_LABEL[a.category]}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 truncate">{a.label}</span>
                </div>
                <p className="mt-0.5 text-xs text-gray-600">{a.message}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-gray-800 leading-tight">{a.count}</p>
                <p className="text-xs text-gray-500">건</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
