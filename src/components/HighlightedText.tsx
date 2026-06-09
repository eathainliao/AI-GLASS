import type { SentenceResult } from '../types'

interface Props {
  sentences: SentenceResult[]
}

export function HighlightedText({ sentences }: Props) {
  return (
    <p className="leading-relaxed">
      {sentences.map((s, i) => {
        if (s.status === 'NORMAL') {
          return <span key={i}>{s.text}</span>
        }

        if (s.status === 'SAFE_QUOTE') {
          return (
            <span key={i} className="rounded px-0.5 bg-blue-100 text-blue-800">
              {s.text}
            </span>
          )
        }

        // AI_SUSPECT — custom tooltip replaces native title attribute
        return (
          <span key={i} className="relative inline-block group">
            <span className="rounded px-0.5 bg-red-100 text-red-800 cursor-help">{s.text}</span>
            {s.reason && (
              <span className="pointer-events-none absolute bottom-full left-0 z-10 mb-1.5 w-max max-w-[220px] origin-bottom-left scale-95 translate-y-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs leading-snug text-white opacity-0 transition ease-out duration-150 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                {s.reason}
              </span>
            )}
          </span>
        )
      })}
    </p>
  )
}
