'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { GroupCount } from '@/types'

interface Props {
  title: string
  data: GroupCount[]
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#60a5fa',
]

export default function DonutChart({ title, data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        <p className="mt-4 text-sm text-gray-400">데이터가 없습니다</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.count, 0)
  // Only top 10 slices to reduce legend clutter
  const display = data.slice(0, 10)

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <span className="inline-block h-4 w-1 shrink-0 rounded-full" style={{ backgroundColor: '#E50012' }} />
        <p className="text-sm font-semibold text-gray-700">{title}</p>
      </div>

      {/* Chart — no inline labels (prevents overlap on mobile) */}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={display}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={2}
          >
            {display.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value}건 (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
              '재해 건수',
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend — shows name + count + % in a clean list */}
      <ol className="mt-3 space-y-1.5">
        {display.map((item, i) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
          return (
            <li key={i} className="flex items-center gap-2 text-xs">
              <span
                className="shrink-0 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-gray-600">{item.label}</span>
              <span className="shrink-0 font-medium text-gray-800">{item.count}건</span>
              <span className="shrink-0 w-8 text-right text-gray-400">{pct}%</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
