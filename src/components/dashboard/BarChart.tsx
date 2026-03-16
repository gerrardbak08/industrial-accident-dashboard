'use client'

/**
 * Generic horizontal bar chart used by department, team, accident-type views.
 */
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
      <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        <p className="mt-4 text-sm text-gray-400">데이터가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-2.5">
        <span className="mt-0.5 inline-block h-4 w-1 shrink-0 rounded-full" style={{ backgroundColor: color ?? '#E50012' }} />
        <div>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          {description && <p className="mt-0.5 text-xs text-gray-400">{description}</p>}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(180, display.length * 36)}>
        {layout === 'vertical' ? (
          <BarChart data={display} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11 }}
              width={120}
            />
            <Tooltip
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
        ) : (
          <BarChart data={display} margin={{ left: 4, right: 4, top: 4, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              angle={-35}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === 'count' ? [`${value}건`, '재해 건수'] : [`${value}일`, '근로손실일수']
              }
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {display.map((_, i) => (
                <Cell key={i} fill={color ?? COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
