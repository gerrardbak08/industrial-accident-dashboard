'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, BarChart2, Map, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',       label: '대시보드', icon: BarChart2 },
  { href: '/map',    label: '위험지도',  icon: Map },
]

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-6" onClick={() => setOpen(false)}>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white select-none"
              style={{ backgroundColor: '#E50012' }}
            >
              D
            </span>
            <div className="hidden sm:block leading-tight">
              <p className="text-[13px] font-black tracking-tight" style={{ color: '#E50012' }}>DAISO</p>
              <p className="text-[10px] text-gray-400 font-medium -mt-0.5">산업안전 운영 분석 시스템</p>
            </div>
            <p className="sm:hidden text-[13px] font-black tracking-tight" style={{ color: '#E50012' }}>DAISO 산업안전</p>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-0.5 flex-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-red-50 text-red-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop upload button */}
          <Link
            href="/upload"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 ml-auto"
            style={{ backgroundColor: '#E50012' }}
          >
            <Upload size={14} />
            데이터 업로드
          </Link>

          {/* Mobile: upload icon + hamburger */}
          <div className="sm:hidden flex items-center gap-2 ml-auto">
            <Link
              href="/upload"
              className="flex items-center justify-center h-9 w-9 rounded-lg text-white"
              style={{ backgroundColor: '#E50012' }}
            >
              <Upload size={16} />
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="메뉴"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Slide-down menu */}
          <div className="fixed top-14 inset-x-0 z-40 bg-white border-b border-gray-100 shadow-lg sm:hidden">
            <nav className="mx-auto max-w-7xl divide-y divide-gray-50 px-4">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 py-4 text-sm font-medium transition-colors',
                    pathname === href ? 'text-red-600' : 'text-gray-700',
                  )}
                >
                  <Icon size={18} className={pathname === href ? 'text-red-500' : 'text-gray-400'} />
                  {label}
                  {pathname === href && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-500" />
                  )}
                </Link>
              ))}
              <Link
                href="/upload"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-4 text-sm font-semibold"
                style={{ color: '#E50012' }}
              >
                <Upload size={18} style={{ color: '#E50012' }} />
                데이터 업로드
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
