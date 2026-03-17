'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
]

export default function BarChartCard({ title, description, data, color, maxItems = 10, layout = 'vertical' }: Props) {
  const display = data.slice(0, maxItems)

  if (display.length === 0) {
    return (
      <Card className="flex h-64 flex-col items-center justify-center">
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        <p className="mt-2 text-sm text-gray-400">데이터가 없습니다</p>
      </Card>
    )
  }

  const accentColor = color ?? '#E50012'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 h-4 w-1 shrink-0 rounded-full" style={{ backgroundColor: accentColor }} />
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(180, display.length * 34)}>
          <BarChart data={display} layout="vertical" margin={{ left: 0, right: 20, top: 2, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category" dataKey="label"
              tick={{ fontSize: 11, fill: '#374151' }}
              width={108} axisLine={false} tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(v: number, n: string) => n === 'count' ? [`${v}건`, '재해 건수'] : [`${v}일`, '근로손실']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {display.map((_, i) => (
                <Cell key={i} fill={color ?? COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
