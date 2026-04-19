import { NextResponse } from 'next/server'
import { syncCatalog } from '@/lib/catalog'

export async function POST() {
  try {
    const result = await syncCatalog()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
