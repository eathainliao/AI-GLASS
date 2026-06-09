// AES-GCM obfuscated storage for API Key.
// NOTE: This is obfuscation, NOT true security. An attacker with JS execution
// access can always recover the key. It prevents casual DevTools inspection only.

const STORAGE_KEY = 'ai-glass:apikey'
const SALT = 'ai-glass-v1' // fixed per-app salt; tied to this codebase, not the user

async function deriveKey(): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(SALT + window.location.origin),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(SALT), iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function saveKey(apiKey: string): Promise<void> {
  const key = await deriveKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(apiKey))

  const payload = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext)),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export async function loadKey(): Promise<string | null> {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const { iv, data } = JSON.parse(raw) as { iv: number[]; data: number[] }
    const key = await deriveKey()
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data)
    )
    return new TextDecoder().decode(plaintext)
  } catch {
    // Decryption failure (e.g. origin changed) — clear stale entry
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function clearKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}
