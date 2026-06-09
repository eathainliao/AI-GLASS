export type SentenceStatus = 'SAFE_QUOTE' | 'AI_SUSPECT' | 'NORMAL'

export interface SentenceResult {
  text: string
  status: SentenceStatus
  reason: string
}

export interface AnalysisResult {
  filename: string
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
