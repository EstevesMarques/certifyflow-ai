// types/index.ts
export type ExamLevel = 'Fundamentals' | 'Associate' | 'Expert'

export interface Exam {
  id: string
  title: string
  description: string
  level: ExamLevel
  updated_at?: string
}

export interface Profile {
  id: string
  full_name: string | null
  created_at: string
}

export interface ExamSession {
  id: string
  user_id: string
  exam_id: string
  score: number
  total_q: number
  started_at: string
  completed_at: string | null
}

export interface QuestionAttempt {
  id: string
  session_id: string
  user_id: string
  exam_id: string
  topic_tag: string
  is_correct: boolean
  question_text: string
  correct_answer: string
  user_answer: string
  attempted_at: string
}

export interface GeneratedQuestion {
  question: string
  options: { A: string; B: string; C: string; D: string }
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  topic_tag: string
}

export interface SessionAnswer {
  question_text: string
  topic_tag: string
  correct_answer: string
  user_answer: string
  is_correct: boolean
}

export interface TopicStat {
  topic_tag: string
  total: number
  correct: number
  pct: number
}
