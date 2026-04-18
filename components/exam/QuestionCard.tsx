import { motion } from 'framer-motion'
import { GeneratedQuestion } from '@/types'
import OptionItem from './OptionItem'

interface QuestionCardProps {
  question: GeneratedQuestion
  selectedAnswer?: string
  onAnswer: (letter: string) => void
  disabled?: boolean
  showCorrect?: boolean
}

const LETTERS = ['A', 'B', 'C', 'D'] as const

export default function QuestionCard({
  question, selectedAnswer, onAnswer, disabled, showCorrect,
}: QuestionCardProps) {
  return (
    <motion.div
      key={question.question}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      <p className="text-[15px] font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {question.question}
      </p>
      <div className="space-y-2">
        {LETTERS.map((l) => (
          <OptionItem
            key={l}
            letter={l}
            text={question.options[l]}
            selected={selectedAnswer === l}
            correct={showCorrect && question.correct_answer === l}
            wrong={showCorrect && selectedAnswer === l && selectedAnswer !== question.correct_answer}
            disabled={disabled}
            onClick={() => onAnswer(l)}
          />
        ))}
      </div>
    </motion.div>
  )
}
