'use client'

import type { UploadHistoryRow } from '@/types'

interface Props {
  history: UploadHistoryRow[]
}

const TYPE_LABEL: Record<string, string> = {
  accidents: '산업재해 데이터',
  stores:    '매장현황 데이터',
}

export default function UploadHistory({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-400">업로드 이력이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b">
        <p className="text-sm font-semibold text-gray-700">업로드 이력 (최근 20건)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">파일명</th>
              <th className="px-4 py-3 text-left">종류</th>
              <th className="px-4 py-3 text-center">처리 건수</th>
              <th className="px-4 py-3 text-left">업로드 시각</th>
              <th className="px-4 py-3 text-center">결과</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-700 max-w-xs truncate">
                  {row.filename}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {TYPE_LABEL[row.upload_type] ?? row.upload_type}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.rows_inserted.toLocaleString()}건
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(row.uploaded_at).toLocaleString('ko-KR')}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.status === 'success' ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      성공
                    </span>
                  ) : (
                    <span
                      className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"
                      title={row.error_message ?? ''}
                    >
                      실패
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
