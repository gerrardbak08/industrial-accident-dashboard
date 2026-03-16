'use client'

import type { KpiStats } from '@/types'

interface Props {
  kpi: KpiStats
}

interface CardProps {
  title: string
  value: string
  sub?: string
  borderColor: string
  valueColor?: string
}

function Card({ title, value, sub, borderColor, valueColor = '#111827' }: CardProps) {
  return (
    <div className="rounded-xl border-t-4 bg-white px-5 py-4 shadow-sm" style={{ borderTopColor: borderColor }}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <p className="mt-2 text-4xl font-black leading-none" style={{ color: valueColor }}>{value}</p>
      {sub && <p className="mt-1.5 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default function KpiCards({ kpi }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <Card
        title="총 재해 건수"
        value={kpi.total_accidents.toLocaleString()}
        sub="승인 건 기준"
        borderColor="#E50012"
        valueColor="#E50012"
      />
      <Card
        title="총 근로손실일수"
        value={kpi.total_work_loss_days.toLocaleString()}
        sub="일 (합계)"
        borderColor="#f97316"
      />
      <Card
        title="평균 연령"
        value={kpi.avg_age != null ? `${kpi.avg_age}세` : '-'}
        borderColor="#eab308"
      />
      <Card
        title="평균 근속연수"
        value={kpi.avg_tenure != null ? `${kpi.avg_tenure}년` : '-'}
        borderColor="#10b981"
      />
      <Card
        title="재해 발생 매장"
        value={kpi.affected_stores.toLocaleString()}
        sub="개 매장"
        borderColor="#3b82f6"
      />
      <Card
        title="재해 발생 팀"
        value={kpi.affected_teams.toLocaleString()}
        sub="개 팀"
        borderColor="#8b5cf6"
      />
    </div>
  )
}
