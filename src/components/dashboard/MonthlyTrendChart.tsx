'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyTrend } from '@/types'

interface Props {
  data: MonthlyTrend[]
}

export default function MonthlyTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-semibold text-gray-600">월별 재해 발생 추이</p>
        <p className="mt-4 text-sm text-gray-400">데이터가 없습니다</p>
      </div>
    )
  }

  // Shorten labels for mobile: "2024-01" → "24.01"
  const display = data.map((d) => ({
    ...d,
    shortLabel: d.label.replace(/^20(\d{2})-(\d{2})$/, '$1.$2'),
  }))

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="inline-block h-4 w-1 shrink-0 rounded-full" style={{ backgroundColor: '#E50012' }} />
        <p className="text-sm font-semibold text-gray-700">월별 재해 발생 추이</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={display} margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="shortLabel"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={28}
          />
          <Tooltip
            formatter={(value: number) => [`${value}건`, '재해 건수']}
            labelFormatter={(label) => `${label}`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#E50012"
            strokeWidth={2}
            dot={{ r: 3, fill: '#E50012', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
