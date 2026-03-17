'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { GroupCount } from '@/types'

interface Props {
  title: string
  description?: string
  data: GroupCount[]
  color?: string
  maxItems?: number
  layout?: 'horizontal' | 'vertical'
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
]

export default function BarChartCard({
  title,
  description,
  data,
  color,
  maxItems = 10,
  layout = 'vertical',
}: Props) {
  const display = data.slice(0, maxItems)

  if (display.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        <p className="mt-4 text-sm text-gray-400">데이터가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-4 flex items-start gap-2.5">
        <span className="mt-0.5 inline-block h-4 w-1 shrink-0 rounded-full" style={{ backgroundColor: color ?? '#E50012' }} />
        <div>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          {description && <p className="mt-0.5 text-xs text-gray-400">{description}</p>}
        </div>
      </div>

      {layout === 'vertical' ? (
        <ResponsiveContainer width="100%" height={Math.max(180, display.length * 34)}>
          <BarChart data={display} layout="vertical" margin={{ left: 0, right: 24, top: 2, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: '#374151' }}
              width={110}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              formatter={(value: number, name: string) =>
                name === 'count' ? [`${value}건`, '재해 건수'] : [`${value}일`, '근로손실일수']
              }
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {display.map((_, i) => (
                <Cell key={i} fill={color ?? COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        /* Horizontal layout: use vertical bar list instead of rotated X labels on mobile */
        <ResponsiveContainer width="100%" height={Math.max(180, display.length * 34)}>
          <BarChart data={display} layout="vertical" margin={{ left: 0, right: 24, top: 2, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: '#374151' }}
              width={110}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              formatter={(value: number, name: string) =>
                name === 'count' ? [`${value}건`, '재해 건수'] : [`${value}일`, '근로손실일수']
              }
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {display.map((_, i) => (
                <Cell key={i} fill={color ?? COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
