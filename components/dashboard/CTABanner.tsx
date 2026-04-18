import Link from 'next/link'

interface CTABannerProps {
  examId: string
  examTitle: string
  weakTopics: string[]
}

export default function CTABanner({ examId, examTitle, weakTopics }: CTABannerProps) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex items-center justify-between gap-4"
      style={{
        background: 'linear-gradient(135deg, #0078d4 0%, #0063b1 100%)',
        boxShadow: '0 4px 16px rgba(0,120,212,0.3)',
      }}
    >
      <div>
        <h3 className="text-sm font-bold text-white">Continuar preparação — {examId}</h3>
        <p className="text-xs text-white/75 mt-0.5">
          {weakTopics.length > 0
            ? `Motor adaptativo priorizará: ${weakTopics.slice(0, 2).join(', ')}`
            : examTitle}
        </p>
      </div>
      <Link
        href={`/exam/${examId}`}
        className="text-xs font-bold rounded-md px-4 py-2 whitespace-nowrap flex-shrink-0 transition-opacity hover:opacity-90"
        style={{ background: '#fff', color: '#0078d4' }}
      >
        Iniciar simulado →
      </Link>
    </div>
  )
}
