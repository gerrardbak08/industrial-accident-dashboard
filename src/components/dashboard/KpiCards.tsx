'use client'

import { cn } from '@/lib/utils'
import type { KpiStats } from '@/types'

interface Props { kpi: KpiStats }

const METRICS = (kpi: KpiStats) => [
  { label: '총 재해 건수',   value: kpi.total_accidents.toLocaleString(),           sub: '승인 건 기준', accent: '#E50012', primary: true },
  { label: '근로손실일수',   value: kpi.total_work_loss_days.toLocaleString(),       sub: '일 합계',     accent: '#f97316' },
  { label: '평균 연령',     value: kpi.avg_age != null ? `${kpi.avg_age}세` : '—',  sub: '',            accent: '#eab308' },
  { label: '평균 근속연수', value: kpi.avg_tenure != null ? `${kpi.avg_tenure}년` : '—', sub: '',      accent: '#10b981' },
  { label: '재해 매장',     value: kpi.affected_stores.toLocaleString(),             sub: '개 매장',    accent: '#3b82f6' },
  { label: '재해 팀',       value: kpi.affected_teams.toLocaleString(),              sub: '개 팀',      accent: '#8b5cf6' },
]

export default function KpiCards({ kpi }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {METRICS(kpi).map(({ label, value, sub, accent, primary }) => (
        <div
          key={label}
          className={cn(
            'relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1',
            primary ? 'ring-red-100' : 'ring-gray-100',
          )}
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: accent }} />

          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{label}</p>
          <p
            className="mt-2 text-2xl font-extrabold leading-none tabular-nums sm:text-3xl"
            style={{ color: primary ? accent : '#111827' }}
          >
            {value}
          </p>
          {sub && <p className="mt-1.5 text-[11px] text-gray-400">{sub}</p>}
        </div>
      ))}
    </div>
  )
}
