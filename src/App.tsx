import { useState } from 'react'
import { useApiKey } from './hooks/useApiKey'
import { useBatchAnalyzer } from './hooks/useBatchAnalyzer'
import { useAnalysisStore } from './store/analysisStore'
import { useAnnotationStore, type AnnotationStatus } from './store/annotationStore'
import { AppIntro } from './components/AppIntro'
import { OnboardingGuide } from './components/OnboardingGuide'
import { Spinner } from './components/Spinner'
import { ApiKeyInput } from './components/ApiKeyInput'
import { FileDropzone } from './components/FileDropzone'
import { ProgressBar } from './components/ProgressBar'
import { SummaryStats } from './components/SummaryStats'
import { StudentReport } from './components/StudentReport'
import { StudentTable } from './components/StudentTable'
import { PrintReport } from './components/PrintReport'
import type { AnalysisResult } from './types'
import type { StudentAnnotation } from './store/annotationStore'

// ── CSV export ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<AnnotationStatus, string> = {
  pending: '待確認',
  ai: '疑似 AI',
  genuine: '自行撰寫',
  'follow-up': '需追蹤',
}

function buildCsv(
  results: AnalysisResult[],
  annotations: Record<string, StudentAnnotation>
): string {
  const header = '檔名,AI疑慮比率,疑慮句數,總句數,教師判定,備註'
  const rows = results.map((r) => {
    const ann = annotations[r.filename] ?? { status: 'pending' as const, note: '' }
    return [
      `"${r.filename.replace(/"/g, '""')}"`,
      `${(r.suspectRatio * 100).toFixed(1)}%`,
      r.aiSuspectCount,
      r.totalCount,
      STATUS_LABEL[ann.status],
      `"${ann.note.replace(/"/g, '""')}"`,
    ].join(',')
  })
  return '﻿' + [header, ...rows].join('\r\n') // BOM for Excel UTF-8
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Filter controls ─────────────────────────────────────────────────────────

const RATIO_OPTIONS = [
  { label: '全部', value: 0 },
  { label: '≥20%', value: 0.2 },
  { label: '≥30%', value: 0.3 },
  { label: '≥40%', value: 0.4 },
]

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  const { apiKey, loading: keyLoading, save, saveSession, clear } = useApiKey()
  const { analyze, retryFailed } = useBatchAnalyzer()
  const { status, progress, results, errors, files, reset: resetAnalysis } = useAnalysisStore()
  const { annotations, reset: resetAnnotations } = useAnnotationStore()

  const [viewMode, setViewMode] = useState<'auto' | 'table' | 'cards'>('auto')
  const [ratioMin, setRatioMin] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'all' | AnnotationStatus>('all')
  const [search, setSearch] = useState('')

  function handleAnalyze(files: File[]) {
    if (!apiKey) return
    resetAnalysis()
    resetAnnotations()
    analyze(files, apiKey)
  }

  function handleReset() {
    resetAnalysis()
    resetAnnotations()
    setRatioMin(0)
    setStatusFilter('all')
    setSearch('')
    setViewMode('auto')
  }

  // Sort by 整篇 AI 可能性（主要信號）, then 標記比率（次要）, so holistically-AI
  // essays surface to the top even when few individual sentences were flagged.
  const likelihoodRank: Record<string, number> = { HIGH: 2, MEDIUM: 1, LOW: 0 }
  const sorted = [...results].sort((a, b) => {
    const diff =
      likelihoodRank[a.verdict?.aiLikelihood ?? 'LOW'] -
      likelihoodRank[b.verdict?.aiLikelihood ?? 'LOW']
    if (diff !== 0) return -diff
    return b.suspectRatio - a.suspectRatio
  })
  const filtered = sorted
    .filter((r) => r.suspectRatio >= ratioMin)
    .filter(
      (r) =>
        statusFilter === 'all' || (annotations[r.filename]?.status ?? 'pending') === statusFilter
    )
    .filter((r) => r.filename.toLowerCase().includes(search.trim().toLowerCase()))

  const effectiveMode = viewMode === 'auto' ? (results.length > 20 ? 'table' : 'cards') : viewMode

  function handleExportCsv() {
    const csv = buildCsv(filtered, annotations)
    downloadCsv(csv, `AI-GLASS_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  if (keyLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">載入中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 print:hidden">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-bold text-gray-900">AI-GLASS</h1>
          <p className="text-sm text-gray-500">作業 AI 鑑識工具 — 教師版</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {!apiKey && (
          <div className="space-y-6 print:hidden">
            <AppIntro />
            <OnboardingGuide />
          </div>
        )}

        <div className="print:hidden">
          <ApiKeyInput
            currentKey={apiKey}
            onSave={save}
            onSaveSession={saveSession}
            onClear={clear}
          />
        </div>

        {apiKey && (
          <>
            {status === 'idle' && (
              <div className="print:hidden">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  上傳作業
                </p>
                <FileDropzone onAnalyze={handleAnalyze} />
              </div>
            )}

            {status === 'analyzing' && (
              <div className="animate-enter rounded-xl border border-indigo-100 bg-white p-6 print:hidden">
                <p className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Spinner className="text-indigo-500" />
                  正在分析中，請稍候...
                </p>
                <ProgressBar completed={progress.completed} total={progress.total} />
                <p className="mt-3 text-xs text-gray-400">
                  依 Gemini 免費限速（10 次/分鐘），{progress.total} 份約需{' '}
                  {Math.ceil(progress.total / 10)} 分鐘
                </p>
              </div>
            )}

            {status === 'done' && (
              <>
                {/* Interactive view — hidden when printing */}
                <div className="animate-enter space-y-4 print:hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      分析報告
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportCsv}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 transition ease-out duration-150 hover:bg-gray-100 active:scale-[0.97]"
                      >
                        匯出 CSV
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 transition ease-out duration-150 hover:bg-gray-100 active:scale-[0.97]"
                      >
                        列印
                      </button>
                      <button
                        onClick={handleReset}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 transition ease-out duration-150 hover:bg-gray-100 active:scale-[0.97]"
                      >
                        重新開始
                      </button>
                    </div>
                  </div>

                  <SummaryStats results={results} />

                  {/* Filter bar */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* View toggle */}
                    <div className="flex overflow-hidden rounded-lg border border-gray-200">
                      {(['table', 'cards'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setViewMode(m)}
                          className={`px-3 py-1 transition-colors duration-150 ${
                            effectiveMode === m
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {m === 'table' ? '表格' : '卡片'}
                        </button>
                      ))}
                    </div>

                    {/* Ratio filter */}
                    <div className="flex overflow-hidden rounded-lg border border-gray-200">
                      {RATIO_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setRatioMin(o.value)}
                          className={`border-l border-gray-200 px-2.5 py-1 first:border-l-0 transition-colors duration-150 ${
                            ratioMin === o.value
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>

                    {/* Status filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | AnnotationStatus)}
                      className="rounded-lg border border-gray-200 px-2.5 py-1 text-gray-600 outline-none"
                    >
                      <option value="all">全部判定</option>
                      <option value="pending">待確認</option>
                      <option value="ai">疑似 AI</option>
                      <option value="genuine">自行撰寫</option>
                      <option value="follow-up">追蹤</option>
                    </select>

                    {/* Search */}
                    <input
                      type="text"
                      placeholder="🔍 搜尋檔名"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2.5 py-1 text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200"
                    />

                    <span className="shrink-0 text-gray-400">
                      顯示 {filtered.length} / {results.length} 份
                    </span>
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-red-700">
                          {Object.keys(errors).length} 份分析失敗
                        </p>
                        {apiKey && files.length > 0 && (
                          <button
                            onClick={() => retryFailed(apiKey)}
                            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 transition ease-out duration-150 hover:bg-red-100 active:scale-[0.97]"
                          >
                            重試失敗的 {Object.keys(errors).length} 份
                          </button>
                        )}
                      </div>
                      <ul className="space-y-1 text-xs text-red-600">
                        {Object.entries(errors).map(([name, msg]) => (
                          <li key={name}>
                            <strong>{name}</strong>：{msg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {filtered.length === 0 ? (
                    <p className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
                      沒有符合篩選條件的作業
                    </p>
                  ) : effectiveMode === 'table' ? (
                    <StudentTable results={filtered} />
                  ) : (
                    <div className="space-y-4">
                      {filtered.map((r, i) => (
                        <StudentReport key={r.filename} result={r} index={i} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Print-only layout — follows the on-screen filter */}
                <PrintReport results={filtered} />
              </>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400 print:hidden">
        AI-GLASS v0.4-alpha ｜ Stage C+ ｜ 資料僅存於您的瀏覽器，不經過任何伺服器
      </footer>
    </div>
  )
}

export default App
