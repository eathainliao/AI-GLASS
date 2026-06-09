import type { AnalysisResult } from '../types'
import { useAnnotationStore, type AnnotationStatus } from '../store/annotationStore'

interface Props {
  results: AnalysisResult[] // already filtered + sorted by the screen
}

const STATUS_LABEL: Record<AnnotationStatus, string> = {
  pending: '待確認',
  ai: '疑似 AI',
  genuine: '自行撰寫',
  'follow-up': '需追蹤',
}

export function PrintReport({ results }: Props) {
  const { annotations } = useAnnotationStore()
  const today = new Date().toISOString().slice(0, 10)

  return (
    // Hidden on screen, shown only when printing
    <div className="hidden print:block">
      {/* Report header */}
      <div className="mb-4 border-b-2 border-gray-800 pb-2">
        <h1 className="text-lg font-bold">AI 作業鑑識報告</h1>
        <p className="mt-1 text-sm">
          日期：{today} ｜ 班級：____________ ｜ 教師：____________
        </p>
        <p className="text-sm">本批列印 {results.length} 份</p>
      </div>

      {/* Per-student blocks */}
      <div className="space-y-3">
        {results.map((r) => {
          const ann = annotations[r.filename] ?? { status: 'pending' as const, note: '' }
          const suspects = r.sentences.filter((s) => s.status === 'AI_SUSPECT')
          return (
            <div key={r.filename} className="print-student border border-gray-300 p-3">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">{r.filename}</span>
                <span className="text-sm">AI 疑慮 {(r.suspectRatio * 100).toFixed(1)}%</span>
              </div>
              <p className="mt-1 text-sm">
                教師判定：<strong>{STATUS_LABEL[ann.status]}</strong>
                {ann.note && <span> ｜ 備註：{ann.note}</span>}
              </p>

              {suspects.length > 0 ? (
                <div className="mt-2">
                  <p className="text-sm font-medium">疑似 AI 句子（{suspects.length}）：</p>
                  <ul className="mt-1 space-y-1">
                    {suspects.map((s, i) => (
                      <li key={i} className="text-sm">
                        • {s.text}
                        {s.reason && <span className="text-gray-500"> → {s.reason}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">無標記為疑似 AI 的句子</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <p className="mt-4 border-t border-gray-300 pt-2 text-xs text-gray-500">
        ⚠ 本報告由 AI 輔助標記，僅供教師參考，非最終判定。
      </p>
    </div>
  )
}
