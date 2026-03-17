export const dynamic = 'force-dynamic'

/**
 * /map — Risk map page (server component shell).
 *
 * Fetches initial store_risks and hierarchy maps server-side,
 * then hands off to MapPageClient for interactive filtering.
 */
import Link from 'next/link'
import { getDashboardStats, getFilterOptions } from '@/lib/stats'
import MapPageClient from '@/components/map/MapPageClient'

export default async function MapPage() {
  const [mapStats, options] = await Promise.all([getDashboardStats(), getFilterOptions()])
  const initialStoreRisks = mapStats.store_risks

  const hierarchy = {
    departments:    options.departments,
    dept_team_map:  options.dept_team_map,
    team_store_map: options.team_store_map,
    all_teams:      options.teams,
    all_stores:     options.stores,
    years:          options.years,
    accident_types: options.accident_types,
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">지역별 재해 위험도 지도</h1>
            <p className="mt-1 text-sm text-gray-500">
              영업부 · 팀 · 매장별로 필터링하여 재해 위험도를 확인하세요.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
          >
            ← 대시보드로
          </Link>
        </div>

        <MapPageClient initialStoreRisks={initialStoreRisks} hierarchy={hierarchy} />
      </div>
    </main>
  )
}
