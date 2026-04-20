// types/index.ts

/** Difficulty level for Microsoft certification exams */
export type ExamLevel = 'Fundamentals' | 'Associate' | 'Expert'

/** Source of the exam record */
export type ExamSource = 'api' | 'manual'

/** Skill topic with weight and subtopics from exam skills measured */
export interface SkillItem {
  topic: string
  weight: string
  subtopics: string[]
}

/** Represents a Microsoft certification exam */
export interface Exam {
  /** Unique identifier for the exam */
  id: string
  /** Title of the exam */
  title: string
  /** Short description/subtitle from Microsoft catalog */
  subtitle?: string
  /** Description of the exam content and objectives */
  description: string
  /** Short code/name (e.g. AZ-104, AI-103) */
  display_name?: string
  /** Difficulty level of the exam */
  level: ExamLevel
  /** Microsoft Learn certification URL */
  url?: string
  /** Badge icon URL */
  icon_url?: string
  /** PDF skills assessment download URL */
  pdf_download_url?: string
  /** Associated role certifications */
  roles?: string[]
  /** Associated product names */
  products?: string[]
  /** Associated provider names */
  providers?: string[]
  /** Associated course IDs */
  courses?: string[]
  /** Study guide sections */
  study_guide?: string[]
  /** Structured skills measured with topic weights */
  skills_measured?: SkillItem[]
  /** Whether the exam is in beta */
  is_beta?: boolean
  /** Source of the exam record */
  source?: ExamSource
  /** External Microsoft Learn UID (without 'exam.' prefix) */
  external_id?: string
  /** Timestamp of last update */
  updated_at?: string
}

/** User profile information */
export interface Profile {
  /** Unique identifier for the user */
  id: string
  /** Full name of the user */
  full_name: string | null
  /** Timestamp when profile was created */
  created_at: string
}

/** Represents an exam study session */
export interface ExamSession {
  /** Unique identifier for the session */
  id: string
  /** ID of the user taking the exam */
  user_id: string
  /** ID of the exam being taken */
  exam_id: string
  /** Score achieved in the session */
  score: number
  /** Total number of questions in the session */
  total_q: number
  /** Timestamp when the session started */
  started_at: string
  /** Timestamp when the session was completed, null if still ongoing */
  completed_at: string | null
}

/** Records an individual question attempt within a session */
export interface QuestionAttempt {
  /** Unique identifier for the attempt */
  id: string
  /** ID of the exam session this attempt belongs to */
  session_id: string
  /** ID of the user attempting the question */
  user_id: string
  /** ID of the exam this question belongs to */
  exam_id: string
  /** Topic or category tag for the question */
  topic_tag: string
  /** Whether the answer was correct */
  is_correct: boolean
  /** The question text */
  question_text: string
  /** The correct answer */
  correct_answer: string
  /** The answer provided by the user */
  user_answer: string
  /** Timestamp when the question was attempted */
  attempted_at: string
}

/** A generated exam question with multiple choice options */
export interface GeneratedQuestion {
  /** The question text */
  question: string
  /** Multiple choice options labeled A, B, C, D */
  options: { A: string; B: string; C: string; D: string }
  /** The correct answer option */
  correct_answer: 'A' | 'B' | 'C' | 'D'
  /** Explanation for the correct answer */
  explanation: string
  /** Topic or category tag for the question */
  topic_tag: string
}

/** Summary of a user's answer in a session */
export interface SessionAnswer {
  /** The question text */
  question_text: string
  /** Topic or category tag for the question */
  topic_tag: string
  /** The correct answer */
  correct_answer: string
  /** The answer provided by the user */
  user_answer: string
  /** Whether the answer was correct */
  is_correct: boolean
}

/** Statistics for a specific topic across all attempts */
export interface TopicStat {
  /** The topic or category tag */
  topic_tag: string
  /** Total number of questions attempted for this topic */
  total: number
  /** Number of correct answers for this topic */
  correct: number
  /** Percentage of correct answers (0-100) */
  pct: number
}
