import Link from 'next/link'

interface CTABannerProps {
  examId: string
  examTitle: string
  weakTopics: string[]
}

export default function CTABanner({ examId, examTitle, weakTopics }: CTABannerProps) {
  return (
    <div
      className="glass-card-solid flex items-center justify-between gap-4 mb-5"
      style={{ padding: '22px 26px' }}
    >
      <div>
        <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
          Continuar preparação — {examId}
        </h3>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
          {weakTopics.length > 0
            ? `Motor adaptativo priorizará: ${weakTopics.slice(0, 2).join(', ')}`
            : examTitle}
        </p>
      </div>
      <Link
        href={`/exam/${examId}`}
        className="btn-pill whitespace-nowrap flex-shrink-0 no-underline"
      >
        Iniciar simulado →
      </Link>
    </div>
  )
}
