'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FilterOptions {
  years: number[]
  departments: string[]
  teams: string[]
  accident_types: string[]
  dept_team_map: Record<string, string[]>
}

interface Props { options: FilterOptions }

export default function FilterBar({ options }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = {
    year:          searchParams.get('year') ?? 'all',
    department:    searchParams.get('department') ?? 'all',
    team:          searchParams.get('team') ?? 'all',
    accident_type: searchParams.get('accident_type') ?? 'all',
  }

  const visibleTeams =
    current.department !== 'all' && options.dept_team_map[current.department]
      ? options.dept_team_map[current.department]
      : options.teams

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    value === 'all' ? params.delete(key) : params.set(key, value)
    if (key === 'department') {
      const newTeams = value !== 'all' ? (options.dept_team_map[value] ?? []) : options.teams
      const cur = searchParams.get('team')
      if (cur && !newTeams.includes(cur)) params.delete('team')
    }
    startTransition(() => router.push(`/?${params.toString()}`, { scroll: false }))
  }, [router, searchParams, options.dept_team_map, options.teams])

  const reset = () => startTransition(() => router.push('/', { scroll: false }))

  const hasFilter = current.year !== 'all' || current.department !== 'all' || current.team !== 'all' || current.accident_type !== 'all'

  const fields = [
    { key: 'year',          label: '연도',    value: current.year,          opts: options.years.map((y) => ({ value: String(y), label: `${y}년` })) },
    { key: 'department',    label: '영업부',  value: current.department,    opts: options.departments.map((d) => ({ value: d, label: d })) },
    { key: 'team',          label: '팀',      value: current.team,          opts: visibleTeams.map((t) => ({ value: t, label: t })) },
    { key: 'accident_type', label: '재해유형', value: current.accident_type, opts: options.accident_types.map((a) => ({ value: a, label: a })) },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-50 px-5 py-2.5">
        <SlidersHorizontal size={13} className="text-gray-400" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">필터</span>
        {isPending && <span className="ml-1 text-[10px] text-gray-400 animate-pulse">업데이트 중…</span>}
        {hasFilter && (
          <button
            onClick={reset}
            className="ml-auto flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            <RotateCcw size={10} />
            초기화
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4">
        {fields.map(({ key, label, value, opts }) => {
          const active = value !== 'all'
          return (
            <div key={key} className={cn('bg-white px-4 py-3', active && 'bg-red-50/70')}>
              <p className={cn('mb-1 text-[10px] font-bold uppercase tracking-widest', active ? 'text-red-500' : 'text-gray-400')}>
                {label}
              </p>
              <select
                value={value}
                onChange={(e) => update(key, e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="all">전체</option>
                {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
