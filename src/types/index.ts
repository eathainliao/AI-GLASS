export type SentenceStatus = 'SAFE_QUOTE' | 'AI_SUSPECT' | 'NORMAL'

export interface SentenceResult {
  text: string
  status: SentenceStatus
  reason: string
}

/** 整篇 AI 可能性的文件級總評（補足逐句判定漏掉的整體訊號） */
export type AiLikelihood = 'HIGH' | 'MEDIUM' | 'LOW'

export interface DocumentVerdict {
  aiLikelihood: AiLikelihood
  summary: string
}

export interface AnalysisResult {
  filename: string
  verdict: DocumentVerdict
  sentences: SentenceResult[]
  aiSuspectCount: number
  safeQuoteCount: number
  totalCount: number
  suspectRatio: number
}

export type ParsedInput =
  | { kind: 'text'; content: string; filename: string }
  | { kind: 'image'; base64: string; mimeType: string; filename: string }

export type BatchStatus = 'idle' | 'analyzing' | 'done' | 'error'
