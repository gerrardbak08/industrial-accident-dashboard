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
      <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-600">월별 재해 발생 추이</p>
        <p className="mt-4 text-sm text-gray-400">데이터가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-semibold text-gray-700">월별 재해 발생 추이</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            formatter={(value: number) => [`${value}건`, '재해 건수']}
            labelFormatter={(label) => `${label}`}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#E50012"
            strokeWidth={2}
            dot={{ r: 4, fill: '#E50012' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
