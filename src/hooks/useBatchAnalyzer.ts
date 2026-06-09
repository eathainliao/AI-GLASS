import { useAnalysisStore } from '../store/analysisStore'
import { parseFile } from '../lib/parsers'
import { analyzeImage, analyzeText, type AnalyzeResult } from '../lib/gemini/client'
import { createRateLimiter } from '../lib/concurrency/rateLimiter'
import type { AnalysisResult, DocumentVerdict, SentenceResult } from '../types'

const limiter = createRateLimiter(10) // shared across invocations

// 暫時性錯誤：值得自動重試（0=網路中斷、429=限速、500/503=伺服器忙碌）
const TRANSIENT_STATUS = new Set([0, 429, 500, 503])
const RETRY_BACKOFF_MS = [2000, 4000, 8000] // 退避序列，長度 = 最大重試次數

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

type Parsed = Awaited<ReturnType<typeof parseFile>>

function buildResult(
  filename: string,
  verdict: DocumentVerdict,
  sentences: SentenceResult[]
): AnalysisResult {
  const aiSuspectCount = sentences.filter((s) => s.status === 'AI_SUSPECT').length
  const safeQuoteCount = sentences.filter((s) => s.status === 'SAFE_QUOTE').length
  return {
    filename,
    verdict,
    sentences,
    aiSuspectCount,
    safeQuoteCount,
    totalCount: sentences.length,
    suspectRatio: sentences.length === 0 ? 0 : aiSuspectCount / sentences.length,
  }
}

/** 透過限速器送出分析；暫時性錯誤自動退避重試（重試也走限速器，不會爆 RPM）。 */
async function analyzeWithRetry(apiKey: string, parsed: Parsed): Promise<AnalyzeResult> {
  let last: AnalyzeResult = { ok: false, status: 0, message: '未執行' }
  for (let attempt = 0; attempt <= RETRY_BACKOFF_MS.length; attempt++) {
    last = await limiter.enqueue(() =>
      parsed.kind === 'image'
        ? analyzeImage(apiKey, parsed.base64, parsed.mimeType)
        : analyzeText(apiKey, parsed.content)
    )
    if (last.ok || !TRANSIENT_STATUS.has(last.status)) return last
    if (attempt < RETRY_BACKOFF_MS.length) await sleep(RETRY_BACKOFF_MS[attempt])
  }
  return last // 重試耗盡仍失敗
}

export function useBatchAnalyzer() {
  const { startBatch, startRetry, addResult, addError, finishBatch } = useAnalysisStore()

  /** 跑一組檔案：解析（本地，不限速）→ 分析（限速+重試）→ 寫回結果/錯誤 */
  async function runFiles(files: File[], apiKey: string) {
    const tasks = files.map((file) =>
      (async () => {
        try {
          const parsed = await parseFile(file)
          const res = await analyzeWithRetry(apiKey, parsed)
          if (res.ok) {
            addResult(buildResult(file.name, res.verdict, res.sentences))
          } else {
            addError(file.name, res.message)
          }
        } catch (err) {
          addError(file.name, err instanceof Error ? err.message : String(err))
        }
      })()
    )
    await Promise.allSettled(tasks)
    finishBatch()
  }

  async function analyze(files: File[], apiKey: string) {
    if (files.length === 0) return
    startBatch(files)
    await runFiles(files, apiKey)
  }

  /** 只重跑目前失敗的項目，併入既有成功結果。 */
  async function retryFailed(apiKey: string) {
    const { errors, files } = useAnalysisStore.getState()
    const failedNames = new Set(Object.keys(errors))
    const failedFiles = files.filter((f) => failedNames.has(f.name))
    if (failedFiles.length === 0) return
    startRetry(failedFiles.length)
    await runFiles(failedFiles, apiKey)
  }

  return { analyze, retryFailed }
}
