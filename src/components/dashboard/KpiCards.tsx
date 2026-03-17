'use client'

import type { KpiStats } from '@/types'

interface Props {
  kpi: KpiStats
}

interface CardProps {
  label: string
  value: string
  sub?: string
  accent: string
  primary?: boolean
}

function Card({ label, value, sub, accent, primary }: CardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ${primary ? 'ring-red-100' : 'ring-gray-100'}`}>
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl" style={{ backgroundColor: accent }} />
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p
        className="mt-2 text-2xl font-extrabold leading-none tracking-tight sm:text-3xl"
        style={{ color: primary ? accent : '#111827' }}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-gray-400">{sub}</p>}
    </div>
  )
}

export default function KpiCards({ kpi }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Card label="총 재해 건수" value={kpi.total_accidents.toLocaleString()} sub="승인 건 기준" accent="#E50012" primary />
      <Card label="근로손실일수" value={kpi.total_work_loss_days.toLocaleString()} sub="일 합계" accent="#f97316" />
      <Card label="평균 연령" value={kpi.avg_age != null ? `${kpi.avg_age}세` : '—'} accent="#eab308" />
      <Card label="평균 근속연수" value={kpi.avg_tenure != null ? `${kpi.avg_tenure}년` : '—'} accent="#10b981" />
      <Card label="재해 매장" value={kpi.affected_stores.toLocaleString()} sub="개 매장" accent="#3b82f6" />
      <Card label="재해 팀" value={kpi.affected_teams.toLocaleString()} sub="개 팀" accent="#8b5cf6" />
    </div>
  )
}
