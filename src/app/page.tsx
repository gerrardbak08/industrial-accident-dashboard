export const dynamic = 'force-dynamic'

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
    ? `${lastUpload.uploaded_at.slice(0, 10)} · ${lastUpload.upload_type === 'accidents' ? '재해 데이터' : '매장 현황'}`
    : null

  const isEmpty = !stats || stats.kpi.total_accidents === 0

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 space-y-4">

        {/* Page header */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
              산업재해 승인 현황
            </h1>
            <p className="mt-0.5 text-xs text-gray-400">
              산업안전 운영 분석 시스템 · 근로복지공단 산업재해 승인 데이터
              {lastUploadLabel && <> · 최종 업데이트 {lastUploadLabel}</>}
            </p>
          </div>
          <Link
            href="/upload"
            className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:px-4 sm:text-sm"
            style={{ backgroundColor: '#E50012' }}
          >
            ⬆ 업로드
          </Link>
        </div>

        {/* No data */}
        {isEmpty && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center">
            <p className="text-base font-bold text-gray-700">데이터가 없습니다</p>
            <p className="mt-2 text-sm text-gray-400">
              Excel 업로드 버튼을 눌러 산업재해 데이터를 등록하세요.
            </p>
            <Link
              href="/upload"
              className="mt-5 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#E50012' }}
            >
              데이터 업로드하기
            </Link>
          </div>
        )}

        {/* Filter */}
        {!isEmpty && (
          <Suspense fallback={<div className="h-20 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 animate-pulse" />}>
            <FilterBar options={filterOptions} />
          </Suspense>
        )}

        {/* Alerts */}
        {stats && !isEmpty && stats.alerts.length > 0 && (
          <RiskAlerts alerts={stats.alerts} />
        )}

        {/* KPI cards */}
        {stats && !isEmpty && <KpiCards kpi={stats.kpi} />}

        {/* Charts — 2-col grid */}
        {stats && !isEmpty && (
          <div className="grid gap-4 lg:grid-cols-2">
            <BarChartCard
              title="부서별 재해 현황"
              description="영업부 단위 재해 건수"
              data={stats.by_department}
              color="#E50012"
            />
            <BarChartCard
              title="팀별 재해 현황"
              description="상위 20개 팀"
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

        {/* Map link */}
        {stats && !isEmpty && stats.store_risks.length > 0 && (
          <Link
            href="/map"
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50"
          >
            <div>
              <p className="font-semibold text-gray-800">지역별 위험도 지도</p>
              <p className="mt-0.5 text-xs text-gray-500">
                재해 발생 매장 {stats.store_risks.length}개 · 고위험 {stats.store_risks.filter((s) => s.risk_level === 'high').length}개
              </p>
            </div>
            <span className="text-lg font-light" style={{ color: '#E50012' }}>→</span>
          </Link>
        )}

        {/* Footer */}
        <p className="border-t border-gray-100 pt-4 pb-4 text-center text-xs text-gray-400">
          데이터 업로드 시 기존 데이터가 전체 교체됩니다.
        </p>
      </div>
    </main>
  )
}
