import { useState } from 'react'
import { pingGemini } from '../lib/gemini/client'

interface Props {
  currentKey: string | null
  onSave: (key: string) => Promise<void>       // persist to localStorage
  onSaveSession: (key: string) => void          // state only, clears on refresh
  onClear: () => void
}

export function ApiKeyInput({ currentKey, onSave, onSaveSession, onClear }: Props) {
  const [input, setInput] = useState('')
  const [remember, setRemember] = useState(true)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleTestAndSave() {
    const trimmed = input.trim()
    if (!trimmed) return
    setTesting(true)
    setError(null)

    const result = await pingGemini(trimmed)
    if (!result.ok) {
      setError(`連線失敗（${result.status}）：${result.message.slice(0, 120)}`)
      setTesting(false)
      return
    }

    if (remember) {
      await onSave(trimmed)
    } else {
      onSaveSession(trimmed)
    }
    setTesting(false)
    setInput('')
  }

  if (currentKey) {
    return (
      <div className="animate-enter flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4">
        <div>
          <p className="text-sm font-medium text-green-800">API Key 已載入 ✓</p>
          <p className="mt-0.5 font-mono text-xs text-green-600">
            {currentKey.slice(0, 8)}
            {'•'.repeat(12)}
          </p>
        </div>
        <button
          onClick={onClear}
          className="rounded-lg border border-green-300 px-3 py-1.5 text-xs text-green-700 transition ease-out duration-150 hover:bg-green-100 active:scale-[0.97]"
        >
          清除金鑰
        </button>
      </div>
    )
  }

  return (
    <div className="animate-enter rounded-xl border border-gray-200 bg-white p-6">
      <p className="mb-3 text-sm font-medium text-gray-700">貼上你的 Gemini API Key</p>

      <div className="flex gap-2">
        <input
          type="password"
          placeholder="AIza..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTestAndSave()}
          disabled={testing}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition ease-out duration-150 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
        />
        <button
          onClick={handleTestAndSave}
          disabled={testing || !input.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition ease-out duration-150 hover:bg-indigo-700 active:scale-[0.97] disabled:opacity-50"
        >
          {testing ? '測試中...' : '測試並儲存'}
        </button>
      </div>

      {error && (
        <div className="animate-enter mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-500">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="rounded"
        />
        記住我（加密存於本機，下次免輸入；不勾則本次工作階段有效）
      </label>
    </div>
  )
}
