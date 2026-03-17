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
        <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
            {/* Brand */}
            <a href="/" className="flex items-center gap-2 shrink-0">
              <span
                className="flex h-6 w-6 items-center justify-center rounded text-xs font-black text-white"
                style={{ backgroundColor: '#E50012' }}
              >
                D
              </span>
              <span className="font-black tracking-tight text-sm" style={{ color: '#E50012' }}>DAISO</span>
              <span className="hidden sm:block text-xs text-gray-400 font-medium">산업안전 운영 분석</span>
            </a>

            {/* Nav */}
            <div className="flex items-center gap-1 text-sm">
              <a href="/" className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors">
                대시보드
              </a>
              <a href="/map" className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors">
                위험지도
              </a>
              <a
                href="/upload"
                className="ml-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#E50012' }}
              >
                <span className="hidden sm:inline">데이터 </span>업로드
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
