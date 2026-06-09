// Turns a raw Gemini error response into a human-readable Chinese message.
// Crucially, for 429 it distinguishes per-minute (RPM) vs per-day (RPD) quota
// and surfaces the suggested retry delay.

interface QuotaViolation {
  quotaId?: string
  quotaMetric?: string
}

interface GeminiErrorDetail {
  '@type'?: string
  retryDelay?: string
  violations?: QuotaViolation[]
}

interface GeminiErrorBody {
  error?: {
    code?: number
    message?: string
    status?: string
    details?: GeminiErrorDetail[]
  }
}

function parseRetrySeconds(retryDelay?: string): number | null {
  if (!retryDelay) return null
  const m = /(\d+)/.exec(retryDelay)
  return m ? parseInt(m[1], 10) : null
}

export function formatGeminiError(status: number, rawBody: string): string {
  if (status === 0) return `網路連線失敗：${rawBody.slice(0, 120)}`

  let body: GeminiErrorBody
  try {
    body = JSON.parse(rawBody)
  } catch {
    return `HTTP ${status}：${rawBody.slice(0, 150)}`
  }

  const err = body.error
  const baseMsg = err?.message ?? rawBody.slice(0, 150)

  if (status === 429) {
    const details = err?.details ?? []
    const quotaId =
      details.find((d) => d.violations?.length)?.violations?.[0]?.quotaId ?? ''
    const retrySec = parseRetrySeconds(
      details.find((d) => (d['@type'] ?? '').includes('RetryInfo'))?.retryDelay
    )

    if (/PerDay/i.test(quotaId)) {
      return '已達 Gemini 每日免費上限（RPD）；今日額度用完，請明日再試或更換 API Key'
    }
    if (/PerMinute/i.test(quotaId)) {
      return `已達每分鐘上限（RPM）${retrySec ? `，約 ${retrySec} 秒後可重試` : '，請稍候再試'}`
    }
    return `已超出 Gemini 免費額度（429）${retrySec ? `，建議等待 ${retrySec} 秒` : '，請稍候再試'}`
  }

  if (status === 400 && /API.?key.*(not valid|invalid)/i.test(baseMsg)) {
    return 'API Key 無效，請確認金鑰是否正確'
  }
  if (status === 403) return 'API Key 權限不足，或尚未啟用 Gemini API'
  if (status === 500 || status === 503) {
    return `Gemini 伺服器暫時無法服務（${status}），請稍後重試`
  }

  return `錯誤 ${status}：${baseMsg.slice(0, 150)}`
}
