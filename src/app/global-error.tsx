'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'sans-serif', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '480px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>서버 오류가 발생했습니다</h1>
          {error.digest && (
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
              Digest: {error.digest}
            </p>
          )}
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            {error.message || '알 수 없는 오류입니다. /api/health 에서 연결 상태를 확인하세요.'}
          </p>
          <button
            onClick={reset}
            style={{ backgroundColor: '#E50012', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
