'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
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
]

export default function DonutChart({ title, data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        <p className="mt-4 text-sm text-gray-400">데이터가 없습니다</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="mb-2 text-sm font-semibold text-gray-700">{title}</p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            label={({ label, count }) =>
              total > 0 ? `${Math.round((count / total) * 100)}%` : ''
            }
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value}건`, '재해 건수']} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
