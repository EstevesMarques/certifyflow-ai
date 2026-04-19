import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const sb = createClient()
    const { data, error } = await sb.from('exams').update({
      title: body.title,
      description: body.description,
      level: body.level,
      roles: body.roles ?? [],
      products: body.products ?? [],
      is_beta: body.is_beta ?? false,
    }).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const sb = createClient()
    const { error } = await sb.from('exams').delete().eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
