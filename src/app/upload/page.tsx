'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import UploadZone from '@/components/upload/UploadZone'
import UploadHistory from '@/components/upload/UploadHistory'
import type { UploadHistoryRow, UploadResult } from '@/types'

export default function UploadPage() {
  const router = useRouter()
  const [history, setHistory] = useState<UploadHistoryRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/upload-history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleSuccess = useCallback(
    (_result: UploadResult) => {
      fetchHistory()
      // Navigate to dashboard after short delay so user sees success message
      setTimeout(() => router.push('/'), 1500)
    },
    [router, fetchHistory],
  )

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">데이터 업로드</h1>
            <p className="mt-1 text-sm text-gray-500">
              Excel 파일을 업로드하면 대시보드가 즉시 업데이트됩니다.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
          >
            ← 대시보드로
          </Link>
        </div>

        {/* Instructions */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 space-y-2">
          <p className="text-sm font-semibold text-blue-800">업로드 방법</p>
          <ul className="space-y-1.5 text-sm text-blue-700">
            <li>
              <strong>산업재해 데이터:</strong> <code className="bg-blue-100 px-1 rounded">산업재해DB</code> 시트가 포함된
              Excel 파일 (예: data.xlsx)
            </li>
            <li>
              <strong>매장현황 데이터:</strong> <code className="bg-blue-100 px-1 rounded">매장현황</code> 시트가 포함된
              Excel 파일 (예: 매장현황.xlsx)
            </li>
            <li className="text-blue-600">
              각 업로드는 기존 데이터를 완전히 교체합니다. 두 파일을 모두 업로드하면 지도 기능도 활성화됩니다.
            </li>
          </ul>
        </div>

        {/* Drop zones */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">산업재해 데이터 업로드</p>
            <UploadZone onSuccess={handleSuccess} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">매장현황 데이터 업로드</p>
            <UploadZone onSuccess={handleSuccess} />
          </div>
        </div>

        {/* History */}
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-600">업로드 이력</p>
          {loading ? (
            <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
              로딩 중...
            </div>
          ) : (
            <UploadHistory history={history} />
          )}
        </div>
      </div>
    </main>
  )
}
