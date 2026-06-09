import { useEffect, useState } from 'react'
import { clearKey, loadKey, saveKey } from '../lib/crypto/keyStorage'

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadKey().then((k) => {
      setApiKey(k)
      setLoading(false)
    })
  }, [])

  async function save(key: string) {
    await saveKey(key)
    setApiKey(key)
  }

  // Session-only: update state without persisting to localStorage
  function saveSession(key: string) {
    setApiKey(key)
  }

  function clear() {
    clearKey()
    setApiKey(null)
  }

  return { apiKey, loading, save, saveSession, clear }
}
