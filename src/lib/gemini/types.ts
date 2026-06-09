export interface GeminiPart {
  text?: string
  inlineData?: { mimeType: string; data: string }
}

export interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

export interface GeminiRequest {
  contents: GeminiContent[]
  generationConfig?: {
    responseMimeType?: string
    responseSchema?: unknown
    temperature?: number
  }
}

export type PingResult =
  | { ok: true; reply: string }
  | { ok: false; status: number; message: string }
