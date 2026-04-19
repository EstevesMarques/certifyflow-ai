import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const sb = await createClient()
    const { data, error } = await sb.from('exams').insert({
      id: body.external_id,
      external_id: body.external_id,
      title: body.title,
      description: body.description,
      level: body.level,
      roles: body.roles ?? [],
      products: body.products ?? [],
      is_beta: body.is_beta ?? false,
      source: 'manual',
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
