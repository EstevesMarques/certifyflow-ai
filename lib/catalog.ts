import { Exam } from '@/types'
export { STATIC_EXAMS } from '@/lib/static-exams'
import { STATIC_EXAMS } from '@/lib/static-exams'

interface MicrosoftCatalogItem {
  uid: string
  examNumber?: string
  title: string
  summary?: string
  levels?: string[]
  roles?: string[]
  products?: string[]
  isBeta?: boolean
  last_modified?: string
}

export async function fetchFromMicrosoft(): Promise<MicrosoftCatalogItem[]> {
  const res = await fetch('https://learn.microsoft.com/api/catalog/?type=exams', {
    next: { revalidate: 0 },
    headers: { 'Accept': 'application/json' },
  } as RequestInit)
  if (!res.ok) throw new Error(`Microsoft Catalog API error: ${res.status}`)
  const data = await res.json()
  const items = data?.items
  if (!Array.isArray(items)) throw new Error('Invalid Microsoft Catalog response')
  return items.filter((item: MicrosoftCatalogItem) => item.uid?.startsWith('exam.'))
}

export function processExamItem(item: MicrosoftCatalogItem): Omit<Exam, 'id'> {
  const externalId = item.uid?.replace('exam.', '') ?? ''
  return {
    external_id: externalId,
    title: item.title ?? '',
    description: item.summary ?? '',
    level: (item.levels?.[0] as Exam['level']) ?? 'Associate',
    roles: item.roles ?? [],
    products: item.products ?? [],
    is_beta: item.isBeta ?? false,
    source: 'api',
    updated_at: item.last_modified ?? new Date().toISOString(),
  }
}

export function saveSnapshot(items: MicrosoftCatalogItem[]): string {
  const fs = require('fs')
  const path = require('path')
  const date = new Date().toISOString().split('T')[0]
  const dir = path.join(process.cwd(), 'data', 'catalog')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, `catalog-${date}.json`)
  fs.writeFileSync(filePath, JSON.stringify({ timestamp: new Date().toISOString(), items }, null, 2))
  return filePath
}

export async function syncCatalog(): Promise<{ total: number; inserted: number; updated: number }> {
  const { createClient } = await import('@/lib/supabase/server-client')
  const sb = await createClient()
  const items = await fetchFromMicrosoft()
  saveSnapshot(items)
  let inserted = 0, updated = 0
  for (const item of items) {
    const processed = processExamItem(item)
    const { data: existing } = await sb
      .from('exams')
      .select('source')
      .eq('external_id', processed.external_id)
      .maybeSingle()
    if (!existing) {
      const { error } = await sb.from('exams').insert({
        id: processed.external_id,
        ...processed,
      })
      if (!error) inserted++
    } else if (existing.source === 'api') {
      const { error } = await sb
        .from('exams')
        .update(processed)
        .eq('external_id', processed.external_id)
      if (!error) updated++
    }
  }
  return { total: items.length, inserted, updated }
}

export async function fetchExams(): Promise<Exam[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server-client')
    const sb = await createClient()
    const { data, error } = await sb.from('exams').select('*').order('title')
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(e => ({
        id: e.external_id ?? e.id,
        title: e.title,
        description: e.description ?? '',
        level: e.level,
        updated_at: e.updated_at,
        source: e.source,
        is_beta: e.is_beta,
        roles: e.roles ?? [],
        products: e.products ?? [],
        external_id: e.external_id,
      }))
    }
  } catch { /* fall through */ }
  // fallback to Microsoft API
  try {
    const res = await fetch(
      'https://learn.microsoft.com/api/catalog/?type=exams',
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return STATIC_EXAMS
    const data = await res.json()
    const items = data?.items
    if (!Array.isArray(items) || items.length === 0) return STATIC_EXAMS
    return items
      .filter((e: MicrosoftCatalogItem) => e.uid?.startsWith('exam.'))
      .map((e: MicrosoftCatalogItem) => ({
        id: e.examNumber ?? e.uid?.replace('exam.', '') ?? '',
        title: e.title,
        description: e.summary ?? '',
        level: (e.levels?.[0] as Exam['level']) ?? 'Associate',
      }))
  } catch {
    return STATIC_EXAMS
  }
}
