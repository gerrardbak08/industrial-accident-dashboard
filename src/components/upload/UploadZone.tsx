'use client'

import { useCallback, useState } from 'react'
import type { UploadResult } from '@/types'

interface Props {
  onSuccess: (result: UploadResult) => void
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export default function UploadZone({ onSuccess }: Props) {
  const [state, setState] = useState<UploadState>('idle')
  const [message, setMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const upload = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xlsm|xls)$/i)) {
      setMessage('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.')
      setState('error')
      return
    }

    setState('uploading')
    setMessage(`"${file.name}" 업로드 중...`)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const result: UploadResult = await res.json()

      if (result.success) {
        setState('success')
        setMessage(result.message)
        onSuccess(result)
      } else {
        setState('error')
        setMessage(result.error ?? '업로드 실패')
      }
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : '알 수 없는 오류')
    }
  }, [onSuccess])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) upload(file)
    },
    [upload],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) upload(file)
      e.target.value = ''
    },
    [upload],
  )

  const borderClass =
    dragOver
      ? 'border-blue-400 bg-blue-50'
      : state === 'success'
      ? 'border-green-400 bg-green-50'
      : state === 'error'
      ? 'border-red-400 bg-red-50'
      : 'border-gray-300 bg-white hover:bg-gray-50'

  return (
    <label
      className={`block cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${borderClass}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".xlsx,.xlsm,.xls"
        className="hidden"
        onChange={handleChange}
        disabled={state === 'uploading'}
      />

      {state === 'uploading' ? (
        <div className="space-y-2">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-blue-600">{message}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-4xl">
            {state === 'success' ? '✅' : state === 'error' ? '❌' : '📂'}
          </div>
          <p className="font-medium text-gray-700">
            {state === 'success'
              ? '업로드 완료'
              : state === 'error'
              ? '업로드 실패'
              : 'Excel 파일을 드래그하거나 클릭하여 선택'}
          </p>
          {message && (
            <p className={`text-sm ${state === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          <p className="text-xs text-gray-400">
            지원 파일: 산업재해DB (data.xlsx) · 매장현황 (매장현황.xlsx)
          </p>
        </div>
      )}
    </label>
  )
}
