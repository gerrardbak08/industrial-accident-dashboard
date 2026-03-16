'use client'

/**
 * Client-side wrapper for RiskMap.
 * dynamic() with ssr:false must live in a Client Component in Next.js 15+.
 */
import dynamic from 'next/dynamic'
import type { StoreRisk } from '@/types'

const RiskMap = dynamic(() => import('./RiskMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
      <p className="text-sm text-gray-400">지도 로딩 중...</p>
    </div>
  ),
})

interface Props {
  storeRisks: StoreRisk[]
}

export default function RiskMapClient({ storeRisks }: Props) {
  return <RiskMap storeRisks={storeRisks} mode="marker" colorMode="risk" highlightTop={false} />
}
