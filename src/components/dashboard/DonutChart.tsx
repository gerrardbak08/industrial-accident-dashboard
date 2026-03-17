'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { GroupCount } from '@/types'

interface Props { title: string; data: GroupCount[] }

const COLORS = [
  '#E50012','#3b82f6','#10b981','#f59e0b','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
]

export default function DonutChart({ title, data }: Props) {
  if (data.length === 0) {
    return (
      <Card className="flex h-64 flex-col items-center justify-center">
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        <p className="mt-2 text-sm text-gray-400">데이터가 없습니다</p>
      </Card>
    )
  }

  const display = data.slice(0, 10)
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-1 shrink-0 rounded-full" style={{ backgroundColor: '#E50012' }} />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Donut chart — NO inline labels (prevents mobile overlap) */}
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={display} dataKey="count" nameKey="label"
              cx="50%" cy="50%"
              innerRadius={46} outerRadius={72} paddingAngle={2}
            >
              {display.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(v: number) => [`${v}건 (${total > 0 ? Math.round((v / total) * 100) : 0}%)`, '재해 건수']}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Custom legend — list format, never overlaps */}
        <ol className="mt-3 space-y-1.5 border-t border-gray-50 pt-3">
          {display.map((item, i) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <li key={i} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="min-w-0 flex-1 truncate text-gray-600">{item.label}</span>
                <span className="shrink-0 tabular-nums font-medium text-gray-800">{item.count}건</span>
                <span className="shrink-0 w-7 text-right text-gray-400">{pct}%</span>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
