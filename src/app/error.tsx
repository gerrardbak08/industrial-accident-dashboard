'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isEnvError = error.message?.includes('SUPABASE_URL') || error.message?.includes('environment variables')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="mx-auto max-w-md text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: '#FEF2F2' }}
        >
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {isEnvError ? '서버 설정 오류' : '페이지를 불러올 수 없습니다'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {isEnvError
            ? 'Vercel 환경변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다.'
            : error.message || '알 수 없는 오류가 발생했습니다.'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#E50012' }}
        >
          다시 시도
        </button>
      </div>
    </main>
  )
}
