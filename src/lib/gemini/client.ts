import type { GeminiRequest, PingResult } from './types'
import type { SentenceResult } from '../../types'
import { ANALYSIS_SYSTEM_PROMPT, IMAGE_OCR_PREFIX } from './prompts'
import { ANALYSIS_RESPONSE_SCHEMA } from './schema'
import { formatGeminiError } from './errors'

const ANALYSIS_TEMPERATURE = 0.1 // low temperature → more consistent classification

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

function endpoint(apiKey: string, model = 'gemini-2.5-flash') {
  return `${BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
}

async function post(url: string, body: GeminiRequest): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── Ping ────────────────────────────────────────────────────────────────────

export type PingResult_ = PingResult

export async function pingGemini(apiKey: string): Promise<PingResult> {
  let res: Response
  try {
    res = await post(endpoint(apiKey), {
      contents: [{ role: 'user', parts: [{ text: 'Reply with exactly one word: pong' }] }],
    })
  } catch (err) {
    return { ok: false, status: 0, message: String(err) }
  }
  if (!res.ok) return { ok: false, status: res.status, message: formatGeminiError(res.status, await res.text()) }
  const data = await res.json()
  const reply: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '(no reply)'
  return { ok: true, reply }
}

// ── Analysis ─────────────────────────────────────────────────────────────────

export type AnalyzeResult =
  | { ok: true; sentences: SentenceResult[] }
  | { ok: false; status: number; message: string }

/** Analyze a plain-text assignment */
export async function analyzeText(apiKey: string, text: string): Promise<AnalyzeResult> {
  const body: GeminiRequest = {
    contents: [{ role: 'user', parts: [{ text: ANALYSIS_SYSTEM_PROMPT + '\n\n' + text }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_RESPONSE_SCHEMA,
      temperature: ANALYSIS_TEMPERATURE,
    },
  }
  return callAnalysis(endpoint(apiKey), body)
}

/** Analyze an image assignment (photo of handwritten work) */
export async function analyzeImage(
  apiKey: string,
  base64: string,
  mimeType: string
): Promise<AnalyzeResult> {
  const body: GeminiRequest = {
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: IMAGE_OCR_PREFIX + ANALYSIS_SYSTEM_PROMPT },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_RESPONSE_SCHEMA,
      temperature: ANALYSIS_TEMPERATURE,
    },
  }
  return callAnalysis(endpoint(apiKey), body)
}

async function callAnalysis(url: string, body: GeminiRequest): Promise<AnalyzeResult> {
  let res: Response
  try {
    res = await post(url, body)
  } catch (err) {
    return { ok: false, status: 0, message: String(err) }
  }
  if (!res.ok)
    return { ok: false, status: res.status, message: formatGeminiError(res.status, await res.text()) }

  const data = await res.json()
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'

  try {
    const sentences = JSON.parse(raw) as SentenceResult[]
    return { ok: true, sentences }
  } catch {
    return { ok: false, status: 200, message: `JSON parse failed: ${raw.slice(0, 200)}` }
  }
}
