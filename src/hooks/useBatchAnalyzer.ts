import { useAnalysisStore } from '../store/analysisStore'
import { parseFile } from '../lib/parsers'
import { analyzeImage, analyzeText } from '../lib/gemini/client'
import { createRateLimiter } from '../lib/concurrency/rateLimiter'
import type { AnalysisResult, SentenceResult } from '../types'

const limiter = createRateLimiter(10) // shared across invocations

function buildResult(filename: string, sentences: SentenceResult[]): AnalysisResult {
  const aiSuspectCount = sentences.filter((s) => s.status === 'AI_SUSPECT').length
  const safeQuoteCount = sentences.filter((s) => s.status === 'SAFE_QUOTE').length
  return {
    filename,
    sentences,
    aiSuspectCount,
    safeQuoteCount,
    totalCount: sentences.length,
    suspectRatio: sentences.length === 0 ? 0 : aiSuspectCount / sentences.length,
  }
}

export function useBatchAnalyzer() {
  const { startBatch, addResult, addError, finishBatch } = useAnalysisStore()

  async function analyze(files: File[], apiKey: string) {
    if (files.length === 0) return
    startBatch(files.length)

    const tasks = files.map((file) =>
      limiter.enqueue(async () => {
        try {
          const parsed = await parseFile(file)
          const res =
            parsed.kind === 'image'
              ? await analyzeImage(apiKey, parsed.base64, parsed.mimeType)
              : await analyzeText(apiKey, parsed.content)

          if (res.ok) {
            addResult(buildResult(file.name, res.sentences))
          } else {
            addError(file.name, res.message)
          }
        } catch (err) {
          addError(file.name, err instanceof Error ? err.message : String(err))
        }
      })
    )

    await Promise.allSettled(tasks)
    finishBatch()
  }

  return { analyze }
}
