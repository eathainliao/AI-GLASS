import { useState } from 'react'
import type { AnalysisResult, SentenceResult } from '../types'
import { HighlightedText } from './HighlightedText'
import { verdictMeta } from './StudentReport'

function FocusView({ sentences }: { sentences: SentenceResult[] }) {
  const suspects = sentences.filter((s) => s.status === 'AI_SUSPECT')
  if (suspects.length === 0) {
    return <p className="text-sm text-gray-400">無可疑句子</p>
  }
  return (
    <ul className="space-y-2">
      {suspects.map((s, i) => (
        <li key={i} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
          <p className="text-sm text-red-800">{s.text}</p>
          {s.reason && <p className="mt-1 text-xs text-red-400">{s.reason}</p>}
        </li>
      ))}
    </ul>
  )
}

/** Stats line + full/focus toggle + body. Shared by card and table expand. */
export function ReportDetail({ result }: { result: AnalysisResult }) {
  const [viewMode, setViewMode] = useState<'full' | 'focus'>('full')

  return (
    <div>
      {/* 整篇總評 — 補足逐句判定漏掉的整體訊號 */}
      {result.verdict && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${verdictMeta(result.verdict.aiLikelihood).cls}`}
            >
              {verdictMeta(result.verdict.aiLikelihood).label}
            </span>
            <span className="text-xs font-medium text-gray-500">整篇總評</span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{result.verdict.summary}</p>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          共 {result.totalCount} 句 ｜ 紅色 {result.aiSuspectCount} 句 ｜ 藍色{' '}
          {result.safeQuoteCount} 句
        </p>
        <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs">
          <button
            onClick={() => setViewMode('full')}
            className={`px-3 py-1 outline-none transition ease-out duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300 active:scale-[0.97] ${
              viewMode === 'full' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            全文
          </button>
          <button
            onClick={() => setViewMode('focus')}
            className={`border-l border-gray-200 px-3 py-1 outline-none transition ease-out duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300 active:scale-[0.97] ${
              viewMode === 'focus' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            只看可疑句
          </button>
        </div>
      </div>

      {viewMode === 'full' ? (
        <HighlightedText sentences={result.sentences} />
      ) : (
        <FocusView sentences={result.sentences} />
      )}
    </div>
  )
}
