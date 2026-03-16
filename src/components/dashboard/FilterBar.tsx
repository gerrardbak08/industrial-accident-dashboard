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

  // When a department is selected, only show teams belonging to that department.
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
      // When department changes, clear team if it no longer belongs to the new department.
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
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
      <span className="text-sm font-semibold text-gray-600">필터</span>

      <Select
        label="연도"
        value={current.year}
        options={options.years.map((y) => ({ value: String(y), label: `${y}년` }))}
        onChange={(v) => update('year', v)}
      />

      <Select
        label="부서"
        value={current.department}
        options={options.departments.map((d) => ({ value: d, label: d }))}
        onChange={(v) => update('department', v)}
      />

      <Select
        label="팀"
        value={current.team}
        options={visibleTeams.map((t) => ({ value: t, label: t }))}
        onChange={(v) => update('team', v)}
      />

      <Select
        label="재해유형"
        value={current.accident_type}
        options={options.accident_types.map((a) => ({ value: a, label: a }))}
        onChange={(v) => update('accident_type', v)}
      />

      {hasFilter && (
        <button
          onClick={reset}
          className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          초기화
        </button>
      )}

      {isPending && (
        <span className="text-xs text-gray-400 animate-pulse">로딩 중...</span>
      )}
    </div>
  )
}

interface SelectProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}

function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="text-xs text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400"
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
