import { NextResponse } from 'next/server'
import { fetchExams } from '@/lib/catalog'

export async function GET() {
  const exams = await fetchExams()
  return NextResponse.json(exams)
}
