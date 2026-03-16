import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DAISO 산업안전 운영 분석 시스템',
  description: '근로복지공단 산업재해 승인 데이터 기반 안전 운영 분석 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {/* Top navigation */}
        <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
            {/* Brand */}
            <a href="/" className="flex items-center py-3.5">
              <span
                className="mr-2.5 flex h-7 w-7 items-center justify-center rounded font-black text-white text-sm leading-none"
                style={{ backgroundColor: '#E50012' }}
              >
                D
              </span>
              <span className="font-black tracking-tight" style={{ color: '#E50012' }}>DAISO</span>
              <span className="mx-2.5 h-4 w-px bg-gray-200" />
              <span className="text-sm font-medium text-gray-400">산업안전 운영 분석 시스템</span>
            </a>
            {/* Nav links */}
            <div className="flex items-center gap-1 text-sm font-medium">
              <a href="/"    className="rounded-md px-3 py-2 text-gray-600 transition-colors hover:text-gray-900">대시보드</a>
              <a href="/map" className="rounded-md px-3 py-2 text-gray-600 transition-colors hover:text-gray-900">위험 지도</a>
              <a
                href="/upload"
                className="ml-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#E50012' }}
              >
                데이터 업로드
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
