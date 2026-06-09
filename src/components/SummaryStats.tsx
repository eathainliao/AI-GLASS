import type { AnalysisResult } from '../types'
import { useAnnotationStore, type AnnotationStatus } from '../store/annotationStore'

interface Props {
  results: AnalysisResult[]
}

export function SummaryStats({ results }: Props) {
  const { annotations } = useAnnotationStore()
  const total = results.length
  if (total === 0) return null

  // Risk distribution — 以整篇總評為準（補足逐句判定漏掉的整體訊號）；
  // 缺 verdict 的舊資料退回以標記比率粗分。
  const likelihoodOf = (r: AnalysisResult) =>
    r.verdict?.aiLikelihood ??
    (r.suspectRatio >= 0.4 ? 'HIGH' : r.suspectRatio >= 0.2 ? 'MEDIUM' : 'LOW')
  const high = results.filter((r) => likelihoodOf(r) === 'HIGH').length
  const mid = results.filter((r) => likelihoodOf(r) === 'MEDIUM').length
  const low = total - high - mid

  // Teacher judgment tallies
  const tally: Record<AnnotationStatus, number> = { pending: 0, ai: 0, genuine: 0, 'follow-up': 0 }
  for (const r of results) {
    const status = annotations[r.filename]?.status ?? 'pending'
    tally[status]++
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
      <p className="text-gray-700">
        本批 <strong>{total}</strong> 份 ｜ AI 可能性{' '}
        <span className="text-red-600">高 {high}</span> ｜{' '}
        <span className="text-amber-600">中 {mid}</span> ｜{' '}
        <span className="text-gray-500">低 {low}</span>
      </p>
      <p className="mt-1.5 text-gray-700">
        教師標記 ｜ <span className="text-red-600">疑似AI {tally.ai}</span> ｜{' '}
        <span className="text-amber-600">追蹤 {tally['follow-up']}</span> ｜{' '}
        <span className="text-green-600">自行撰寫 {tally.genuine}</span> ｜{' '}
        <span className="text-gray-500">待確認 {tally.pending}</span>
      </p>
    </div>
  )
}
