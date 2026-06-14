import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'
import { z } from 'zod'
import { ingestExamContent } from '@/lib/learn-ingest'

const BodySchema = z.object({
  examId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { examId } = BodySchema.parse(body)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Buscar o exame para obter study_guide
    const { data: exam } = await supabase
      .from('exams')
      .select('id, title, study_guide')
      .eq('id', examId.toUpperCase())
      .single()

    if (!exam) {
      return NextResponse.json({ error: `Exam not found: ${examId}` }, { status: 404 })
    }

    const studyGuideUids = (exam.study_guide as string[]) ?? []

    if (studyGuideUids.length === 0) {
      return NextResponse.json({
        examId: exam.id,
        message: 'Exam has no study guide entries',
        learningPaths: 0,
        modules: 0,
        units: 0,
      })
    }

    const result = await ingestExamContent(exam.id, studyGuideUids)

    return NextResponse.json({
      ...result,
      message: `Ingested: ${result.learningPaths} paths, ${result.modules} modules, ${result.units} units`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 })
    }
    console.error('ingest error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET para verificar o status de ingestão de um exame
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const examId = request.nextUrl.searchParams.get('examId')
    if (!examId) {
      // Listar todos os exames com contagem de conteúdo
      const { data: exams } = await supabase
        .from('exams')
        .select('id, title')

      if (!exams) return NextResponse.json({ exams: [] })

      const status = await Promise.all(
        exams.map(async (exam) => {
          const { count } = await supabase
            .from('learning_content')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', exam.id)
          return { examId: exam.id, title: exam.title, contentCount: count ?? 0 }
        })
      )

      return NextResponse.json({ exams: status })
    }

    const { data, error, count } = await supabase
      .from('learning_content')
      .select('*', { count: 'exact' })
      .eq('exam_id', examId.toUpperCase())

    if (error) throw error

    const unitCount = data?.filter(c => c.source_type === 'unit').length ?? 0
    const moduleCount = data?.filter(c => c.source_type === 'module').length ?? 0
    const pathCount = data?.filter(c => c.source_type === 'learning_path').length ?? 0

    return NextResponse.json({
      examId: examId.toUpperCase(),
      total: count,
      learningPaths: pathCount,
      modules: moduleCount,
      units: unitCount,
    })
  } catch (error) {
    console.error('ingest status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
