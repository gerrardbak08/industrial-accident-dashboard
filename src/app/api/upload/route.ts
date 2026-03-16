/**
 * POST /api/upload
 * Accepts a multipart Excel file upload.
 * Auto-detects file type by sheet name (산업재해DB → accidents, 매장현황 → stores).
 * Fully replaces the previous dataset for that type.
 */
import { NextRequest, NextResponse } from 'next/server'
import { detectFileType, parseAccidents, parseStores } from '@/lib/excel-parser'
import { saveAccidents, saveStores, appendHistory } from '@/lib/store'
import type { AccidentRow, StoreRow, UploadResult } from '@/types'

export async function POST(req: NextRequest): Promise<NextResponse<UploadResult>> {
  let filename = 'unknown'

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, upload_type: 'accidents', rows_inserted: 0, message: '', error: '파일이 없습니다.' },
        { status: 400 },
      )
    }

    filename = file.name
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadType = detectFileType(buffer)

    if (!uploadType) {
      return NextResponse.json(
        {
          success: false,
          upload_type: 'accidents',
          rows_inserted: 0,
          message: '',
          error: `파일 형식을 인식할 수 없습니다. "산업재해DB" 또는 "매장현황" 시트가 필요합니다.`,
        },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()

    if (uploadType === 'accidents') {
      const { rows, errors } = parseAccidents(buffer)

      if (rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            upload_type: 'accidents',
            rows_inserted: 0,
            message: '',
            error: `파싱된 데이터가 없습니다. ${errors.join('; ')}`,
          },
          { status: 400 },
        )
      }

      const withIds: AccidentRow[] = rows.map((r, i) => ({
        id: i + 1,
        ...r,
        uploaded_at: now,
      }))

      await saveAccidents(withIds)
      await appendHistory({ filename, upload_type: 'accidents', rows_inserted: withIds.length, uploaded_at: now, status: 'success', error_message: null })

      return NextResponse.json({
        success: true,
        upload_type: 'accidents',
        rows_inserted: withIds.length,
        message: `산업재해 데이터 ${withIds.length}건이 업로드되었습니다.${errors.length > 0 ? ` (경고 ${errors.length}건)` : ''}`,
      })
    }

    // stores
    const { rows, errors } = parseStores(buffer)

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, upload_type: 'stores', rows_inserted: 0, message: '', error: `파싱된 데이터가 없습니다. ${errors.join('; ')}` },
        { status: 400 },
      )
    }

    const storeRows: StoreRow[] = rows.map((r) => ({ ...r, lat: null, lng: null }))
    await saveStores(storeRows)
    await appendHistory({ filename, upload_type: 'stores', rows_inserted: storeRows.length, uploaded_at: now, status: 'success', error_message: null })

    return NextResponse.json({
      success: true,
      upload_type: 'stores',
      rows_inserted: storeRows.length,
      message: `매장 데이터 ${storeRows.length}건이 업로드되었습니다.${errors.length > 0 ? ` (경고 ${errors.length}건)` : ''}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[upload] error:', message)
    await appendHistory({ filename, upload_type: 'accidents', rows_inserted: 0, uploaded_at: new Date().toISOString(), status: 'error', error_message: message })
    return NextResponse.json(
      { success: false, upload_type: 'accidents', rows_inserted: 0, message: '', error: message },
      { status: 500 },
    )
  }
}
