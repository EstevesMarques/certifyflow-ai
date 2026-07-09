import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_provider, ai_api_key')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    provider: profile?.ai_provider ?? 'openai',
    hasKey: !!profile?.ai_api_key,
    // Never return the actual key — just whether it's configured
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { provider, apiKey } = body

  const update: Record<string, string> = {}
  if (provider) update.ai_provider = provider
  if (apiKey !== undefined) update.ai_api_key = apiKey || null

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)

  if (error) {
    console.error('AI settings update error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
