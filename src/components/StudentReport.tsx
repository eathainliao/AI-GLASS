import { useState } from 'react'
import type { AiLikelihood, AnalysisResult } from '../types'
import { ReportDetail } from './ReportDetail'
import { StudentAnnotation } from './StudentAnnotation'

interface Props {
  result: AnalysisResult
  index?: number
}

export function ratioBadgeClass(ratio: number) {
  if (ratio >= 0.4) return 'bg-red-100 text-red-700'
  if (ratio >= 0.2) return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-500'
}

/** 整篇 AI 可能性徽章的文案與配色（新的主要信號） */
export function verdictMeta(likelihood: AiLikelihood) {
  switch (likelihood) {
    case 'HIGH':
      return { label: 'AI 可能性高', short: '高', cls: 'bg-red-100 text-red-700' }
    case 'MEDIUM':
      return { label: 'AI 可能性中', short: '中', cls: 'bg-amber-100 text-amber-700' }
    default:
      return { label: 'AI 可能性低', short: '低', cls: 'bg-gray-100 text-gray-500' }
  }
}

export function StudentReport({ result, index = 0 }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="animate-enter overflow-hidden rounded-xl border border-gray-200 bg-white"
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-5 py-4 transition-colors duration-150 hover:bg-gray-50"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-800">{result.filename}</span>
          {result.verdict && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${verdictMeta(result.verdict.aiLikelihood).cls}`}
            >
              {verdictMeta(result.verdict.aiLikelihood).label}
            </span>
          )}
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${ratioBadgeClass(result.suspectRatio)}`}
          >
            標記 {(result.suspectRatio * 100).toFixed(0)}%
          </span>
        </div>
        <span
          className={`ml-3 shrink-0 text-gray-400 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${expanded ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </div>

      {/* Annotation bar */}
      <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
        <StudentAnnotation filename={result.filename} />
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div className="animate-enter border-t border-gray-100 px-5 py-4">
          <ReportDetail result={result} />
        </div>
      )}
    </div>
  )
}
