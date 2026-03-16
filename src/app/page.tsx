/**
 * Main dashboard page — server component.
 */
import { Suspense } from 'react'
import Link from 'next/link'
import { getDashboardStats, getFilterOptions } from '@/lib/stats'
import { loadHistory } from '@/lib/store'
import KpiCards from '@/components/dashboard/KpiCards'
import FilterBar from '@/components/dashboard/FilterBar'
import BarChartCard from '@/components/dashboard/BarChart'
import DonutChart from '@/components/dashboard/DonutChart'
import MonthlyTrendChart from '@/components/dashboard/MonthlyTrendChart'
import RiskAlerts from '@/components/dashboard/RiskAlerts'
import CauseAnalysisSection from '@/components/dashboard/CauseAnalysisSection'

interface SearchParams {
  year?: string
  department?: string
  team?: string
  accident_type?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [stats, filterOptions, history] = await Promise.all([
    getDashboardStats(params),
    getFilterOptions(),
    loadHistory(),
  ])
  const lastUpload = history.find((h) => h.status === 'success')
  const lastUploadLabel = lastUpload
    ? `${lastUpload.uploaded_at.slice(0, 10)} (${lastUpload.upload_type === 'accidents' ? '재해 데이터' : '매장 현황'})`
    : null

  const isEmpty = !stats || stats.kpi.total_accidents === 0

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              산업재해 승인 현황
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              산업안전 운영 분석 시스템&nbsp;·&nbsp;근로복지공단 산업재해 승인 데이터 기반
            </p>
            {lastUploadLabel && (
              <p className="mt-1.5 text-xs text-gray-400">
                최종 업데이트: {lastUploadLabel}
              </p>
            )}
          </div>
          <Link
            href="/upload"
            className="shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#E50012' }}
          >
            <span>⬆</span> Excel 업로드
          </Link>
        </div>

        {/* No data state */}
        {isEmpty && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-16 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FEF2F2' }}
            >
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-lg font-bold text-gray-800">데이터가 없습니다</p>
            <p className="mt-2 text-sm text-gray-500">
              Excel 업로드 버튼을 눌러 산업재해 데이터를 등록하세요.
            </p>
            <Link
              href="/upload"
              className="mt-5 inline-block rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#E50012' }}
            >
              데이터 업로드하기
            </Link>
          </div>
        )}

        {/* Filter bar */}
        {!isEmpty && (
          <Suspense fallback={<div className="h-14 rounded-xl bg-white shadow-sm animate-pulse" />}>
            <FilterBar options={filterOptions} />
          </Suspense>
        )}

        {/* Risk alerts */}
        {stats && !isEmpty && stats.alerts.length > 0 && (
          <RiskAlerts alerts={stats.alerts} />
        )}

        {/* KPI cards */}
        {stats && !isEmpty && <KpiCards kpi={stats.kpi} />}

        {/* Charts — 2-column grid */}
        {stats && !isEmpty && (
          <div className="grid gap-6 lg:grid-cols-2">
            <BarChartCard
              title="부서별 재해 현황"
              description="영업부 단위 재해 건수 분포"
              data={stats.by_department}
              color="#E50012"
            />
            <BarChartCard
              title="팀별 재해 현황"
              description="상위 20개 팀 기준"
              data={stats.by_team}
              color="#374151"
            />
            <DonutChart
              title="재해유형별 분포"
              data={stats.by_accident_type}
            />
            <BarChartCard
              title="연령대별 재해 현황"
              data={stats.by_age_group}
              color="#E50012"
              layout="horizontal"
            />
            <BarChartCard
              title="근속기간별 재해 현황"
              data={stats.by_tenure_group}
              color="#374151"
              layout="horizontal"
            />
            <MonthlyTrendChart data={stats.by_month} />
          </div>
        )}

        {/* Cause analysis */}
        {stats && !isEmpty && (
          <CauseAnalysisSection
            by_cause_object={stats.by_cause_object}
            by_body_part={stats.by_body_part}
            by_diagnosis={stats.by_diagnosis}
          />
        )}

        {/* Map shortcut */}
        {stats && !isEmpty && stats.store_risks.length > 0 && (
          <Link
            href="/map"
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50"
          >
            <div>
              <p className="font-bold text-gray-800">지역별 위험도 지도</p>
              <p className="mt-0.5 text-sm text-gray-500">
                재해 발생 매장 {stats.store_risks.length}개&nbsp;·&nbsp;고위험 {stats.store_risks.filter((s) => s.risk_level === 'high').length}개 포함
              </p>
            </div>
            <span className="text-xl font-light" style={{ color: '#E50012' }}>→</span>
          </Link>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400 pb-4">
          데이터 업로드 시 기존 데이터가 전체 교체됩니다.
          새 Excel 파일을 업로드하면 이 페이지가 자동으로 업데이트됩니다.
        </div>
      </div>
    </main>
  )
}
