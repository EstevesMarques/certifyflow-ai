import { Exam } from '@/types'
export { STATIC_EXAMS } from '@/lib/static-exams'

interface MicrosoftCatalogItem {
  uid: string
  title: string
  subtitle?: string
  display_name?: string
  url?: string
  icon_url?: string
  pdf_download_url?: string
  levels?: string[]
  roles?: string[]
  products?: string[]
  providers?: string[]
  courses?: string[]
  study_guide?: string[]
  is_beta?: boolean
  last_modified?: string
}

export async function fetchFromMicrosoft(): Promise<MicrosoftCatalogItem[]> {
  const res = await fetch('https://learn.microsoft.com/api/catalog/?type=exams', {
    next: { revalidate: 0 },
    headers: { 'Accept': 'application/json' },
  } as RequestInit)
  if (!res.ok) throw new Error(`Microsoft Catalog API error: ${res.status}`)
  const data = await res.json()
  const items = data?.exams
  if (!Array.isArray(items)) throw new Error('Invalid Microsoft Catalog response')
  return items.filter((item: MicrosoftCatalogItem) => item.uid?.startsWith('exam.'))
}

function mapLevel(level: string): Exam['level'] {
  if (level === 'fundamental') return 'Fundamentals'
  if (level === 'intermediate') return 'Associate'
  if (level === 'advanced') return 'Expert'
  return 'Associate'
}

export function processExamItem(item: MicrosoftCatalogItem) {
  const externalId = item.uid?.replace('exam.', '').toUpperCase() ?? ''
  return {
    id: externalId,
    external_id: externalId,
    exam_code: externalId,
    provider: 'Microsoft',
    title: item.title ?? '',
    subtitle: item.subtitle ?? '',
    description: item.subtitle ?? '',
    display_name: item.display_name ?? '',
    url: item.url ?? '',
    icon_url: item.icon_url ?? '',
    pdf_download_url: item.pdf_download_url ?? '',
    exam_level: mapLevel(item.levels?.[0] ?? ''),
    roles: item.roles ?? [],
    products: item.products ?? [],
    providers: item.providers ?? [],
    courses: item.courses ?? [],
    study_guide: item.study_guide ?? [],
    is_beta: item.is_beta ?? false,
    source: 'api',
    last_updated: item.last_modified ?? new Date().toISOString(),
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
    const examRecord = processed
    if (!existing) {
      const { error } = await sb.from('exams').insert(examRecord)
      if (!error) inserted++
    } else if (existing.source === 'api') {
      const { error } = await sb
        .from('exams')
        .update(examRecord)
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
        external_id: e.external_id ?? e.id,
        title: e.title ?? '',
        description: e.subtitle ?? e.description ?? '',
        subtitle: e.subtitle ?? '',
        display_name: e.display_name ?? '',
        level: e.exam_level ?? e.level ?? 'Associate',
        roles: e.roles ?? [],
        products: e.products ?? [],
        providers: e.providers ?? [],
        courses: e.courses ?? [],
        study_guide: e.study_guide ?? [],
        is_beta: e.is_beta ?? false,
        source: e.source,
        updated_at: e.last_updated ?? e.updated_at,
        url: e.url ?? '',
        icon_url: e.icon_url ?? '',
        pdf_download_url: e.pdf_download_url ?? '',
      }))
    }
  } catch { /* fall through */ }
  return []
}
