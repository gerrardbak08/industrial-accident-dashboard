'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface FilterOptions {
  years: number[]
  departments: string[]
  teams: string[]
  accident_types: string[]
  dept_team_map: Record<string, string[]>
}

interface Props {
  options: FilterOptions
}

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

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      if (key === 'department') {
        const newTeams = value !== 'all' ? (options.dept_team_map[value] ?? []) : options.teams
        const currentTeam = searchParams.get('team')
        if (currentTeam && !newTeams.includes(currentTeam)) {
          params.delete('team')
        }
      }
      startTransition(() => {
        router.push(`/?${params.toString()}`, { scroll: false })
      })
    },
    [router, searchParams, options.dept_team_map, options.teams],
  )

  const reset = () => {
    startTransition(() => {
      router.push('/', { scroll: false })
    })
  }

  const hasFilter =
    current.year !== 'all' ||
    current.department !== 'all' ||
    current.team !== 'all' ||
    current.accident_type !== 'all'

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-2 border-b border-gray-50 px-4 py-2.5">
        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" />
        </svg>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">필터</span>
        {isPending && <span className="ml-1 text-[10px] text-gray-400 animate-pulse">업데이트 중…</span>}
        {hasFilter && (
          <button
            onClick={reset}
            className="ml-auto flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4">
        <SelectCell
          label="연도"
          value={current.year}
          options={options.years.map((y) => ({ value: String(y), label: `${y}년` }))}
          onChange={(v) => update('year', v)}
          active={current.year !== 'all'}
        />
        <SelectCell
          label="영업부"
          value={current.department}
          options={options.departments.map((d) => ({ value: d, label: d }))}
          onChange={(v) => update('department', v)}
          active={current.department !== 'all'}
        />
        <SelectCell
          label="팀"
          value={current.team}
          options={visibleTeams.map((t) => ({ value: t, label: t }))}
          onChange={(v) => update('team', v)}
          active={current.team !== 'all'}
        />
        <SelectCell
          label="재해유형"
          value={current.accident_type}
          options={options.accident_types.map((a) => ({ value: a, label: a }))}
          onChange={(v) => update('accident_type', v)}
          active={current.accident_type !== 'all'}
        />
      </div>
    </div>
  )
}

interface SelectCellProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  active: boolean
}

function SelectCell({ label, value, options, onChange, active }: SelectCellProps) {
  return (
    <div className={`bg-white px-4 py-3 ${active ? 'bg-red-50' : ''}`}>
      <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${active ? 'text-red-500' : 'text-gray-400'}`}>
        {label}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
      >
        <option value="all">전체</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
