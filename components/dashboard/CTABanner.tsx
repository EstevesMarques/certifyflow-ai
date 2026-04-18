import Link from 'next/link'

interface CTABannerProps {
  examId: string
  examTitle: string
  weakTopics: string[]
}

export default function CTABanner({ examId, examTitle, weakTopics }: CTABannerProps) {
  return (
    <div
      className="rounded-[10px] px-5.5 py-5 flex items-center justify-between gap-4 mb-5"
      style={{
        background: 'linear-gradient(135deg, #0078d4 0%, #0063b1 100%)',
        boxShadow: '0 4px 16px rgba(0,120,212,0.3)',
      }}
    >
      <div>
        <h3 className="text-[15px] font-bold text-white">Continuar preparação — {examId}</h3>
        <p className="text-xs text-white/75 mt-0.75">
          {weakTopics.length > 0
            ? `Motor adaptativo priorizará: ${weakTopics.slice(0, 2).join(', ')}`
            : examTitle}
        </p>
      </div>
      <Link
        href={`/exam/${examId}`}
        className="text-sm font-bold rounded px-4.5 py-2.25 whitespace-nowrap flex-shrink-0 transition-opacity hover:opacity-90"
        style={{ background: '#fff', color: '#0078d4' }}
      >
        Iniciar simulado →
      </Link>
    </div>
  )
}
