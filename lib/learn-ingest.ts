import { createClient } from '@/lib/supabase/server-client'

const BASE = 'https://learn.microsoft.com/api'

// ── Tipos da API Microsoft Learn ──────────────────────────────────────

interface LearnApiLearningPath {
  uid: string
  title: string
  summary?: string
  modules: string[]          // UIDs dos módulos
  duration_in_minutes?: number
  url?: string
}

interface LearnApiModule {
  uid: string
  title: string
  summary?: string
  units: string[]            // UIDs das unidades
  duration_in_minutes?: number
  url?: string
}

interface LearnApiUnit {
  uid: string
  title: string
  summary?: string
  content?: string           // Conteúdo markdown completo
  duration_in_minutes?: number
}

interface IngestResult {
  examId: string
  learningPaths: number
  modules: number
  units: number
  errors: string[]
}

// ── Helpers de fetch ──────────────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`)
  return res.json()
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Resolvedores da API ───────────────────────────────────────────────

async function fetchLearningPath(uid: string): Promise<LearnApiLearningPath> {
  return fetchJSON<LearnApiLearningPath>(`${BASE}/learn/learningpaths/${uid}`)
}

async function fetchModule(uid: string): Promise<LearnApiModule> {
  return fetchJSON<LearnApiModule>(`${BASE}/learn/modules/${uid}`)
}

async function fetchUnit(uid: string): Promise<LearnApiUnit> {
  return fetchJSON<LearnApiUnit>(`${BASE}/learn/units/${uid}`)
}

// ── Extrai skills_tags do título/summary da unidade ───────────────────

function extractSkillTags(title: string, summary?: string): string[] {
  const text = `${title} ${summary ?? ''}`.toLowerCase()
  const tags: string[] = []

  // Mapeamento de palavras-chave para tags de tópicos
  const keywordMap: Record<string, string> = {
    'compute': 'compute',
    'virtual machine': 'compute',
    'vm': 'compute',
    'container': 'containers',
    'kubernetes': 'containers',
    'aks': 'containers',
    'app service': 'compute',
    'function app': 'compute',
    'serverless': 'compute',
    'networking': 'networking',
    'vnet': 'networking',
    'virtual network': 'networking',
    'load balancer': 'networking',
    'dns': 'networking',
    'vpn': 'networking',
    'firewall': 'networking',
    'storage': 'storage',
    'blob': 'storage',
    'cosmos': 'database',
    'sql': 'database',
    'database': 'database',
    'identity': 'identity',
    'azure ad': 'identity',
    'entra': 'identity',
    'rbac': 'identity',
    'authentication': 'identity',
    'authorization': 'identity',
    'monitoring': 'monitoring',
    'monitor': 'monitoring',
    'log analytics': 'monitoring',
    'alert': 'monitoring',
    'security': 'security',
    'defender': 'security',
    'key vault': 'security',
    'encryption': 'security',
    'governance': 'governance',
    'policy': 'governance',
    'compliance': 'governance',
    'cost': 'cost-management',
    'pricing': 'cost-management',
    'openai': 'ai',
    'cognitive': 'ai',
    'machine learning': 'ai',
    'ml': 'ai',
    'ai': 'ai',
    'devops': 'devops',
    'ci/cd': 'devops',
    'pipeline': 'devops',
    'github': 'devops',
    'arm': 'iac',
    'bicep': 'iac',
    'terraform': 'iac',
    'template': 'iac',
  }

  for (const [keyword, tag] of Object.entries(keywordMap)) {
    if (text.includes(keyword) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }

  return tags
}

// ── Pipeline principal ────────────────────────────────────────────────

export async function ingestExamContent(
  examId: string,
  studyGuideUids: string[]
): Promise<IngestResult> {
  const result: IngestResult = {
    examId,
    learningPaths: 0,
    modules: 0,
    units: 0,
    errors: [],
  }

  if (!studyGuideUids || studyGuideUids.length === 0) {
    result.errors.push(`Nenhum study_guide para o exame ${examId}`)
    return result
  }

  const supabase = await createClient()

  for (const lpUid of studyGuideUids) {
    try {
      await sleep(100) // Rate limiting

      // 1. Buscar Learning Path
      const lp = await fetchLearningPath(lpUid)
      console.log(`[ingest] Learning Path: ${lp.title} (${lp.modules?.length ?? 0} modules)`)

      // Inserir learning path
      const { error: lpError } = await supabase.from('learning_content').upsert({
        exam_id: examId,
        source_type: 'learning_path',
        source_uid: lp.uid,
        title: lp.title,
        summary: lp.summary ?? '',
        duration_minutes: lp.duration_in_minutes,
        url: lp.url ?? '',
        sort_order: result.learningPaths,
      }, { onConflict: 'exam_id, source_uid' })

      if (lpError) {
        result.errors.push(`LP ${lp.uid}: ${lpError.message}`)
        continue
      }
      result.learningPaths++

      // 2. Resolver módulos
      for (const modUid of (lp.modules ?? [])) {
        try {
          await sleep(100)

          const mod = await fetchModule(modUid)
          console.log(`[ingest]   Module: ${mod.title} (${mod.units?.length ?? 0} units)`)

          const { error: modError } = await supabase.from('learning_content').upsert({
            exam_id: examId,
            source_type: 'module',
            source_uid: mod.uid,
            title: mod.title,
            summary: mod.summary ?? '',
            parent_uid: lp.uid,
            duration_minutes: mod.duration_in_minutes,
            url: mod.url ?? '',
            sort_order: result.modules,
          }, { onConflict: 'exam_id, source_uid' })

          if (modError) {
            result.errors.push(`Module ${mod.uid}: ${modError.message}`)
            continue
          }
          result.modules++

          // 3. Resolver unidades
          for (const unitUid of (mod.units ?? [])) {
            try {
              await sleep(100)

              const unit = await fetchUnit(unitUid)
              const skillsTags = extractSkillTags(unit.title, unit.summary)

              const { error: unitError } = await supabase.from('learning_content').upsert({
                exam_id: examId,
                source_type: 'unit',
                source_uid: unit.uid,
                title: unit.title,
                summary: unit.summary ?? '',
                content: unit.content ?? '',
                parent_uid: mod.uid,
                duration_minutes: unit.duration_in_minutes,
                skills_tags: skillsTags,
                sort_order: result.units,
              }, { onConflict: 'exam_id, source_uid' })

              if (unitError) {
                result.errors.push(`Unit ${unit.uid}: ${unitError.message}`)
                continue
              }
              result.units++

              if (result.units % 10 === 0) {
                console.log(`[ingest]   ... ${result.units} units ingeridas`)
              }
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err)
              result.errors.push(`Unit ${unitUid}: ${msg}`)
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          result.errors.push(`Module ${modUid}: ${msg}`)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      result.errors.push(`LP ${lpUid}: ${msg}`)
    }
  }

  console.log(`[ingest] ${examId}: ${result.learningPaths} paths, ${result.modules} modules, ${result.units} units, ${result.errors.length} errors`)
  return result
}
