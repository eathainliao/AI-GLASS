export function createRateLimiter(rpm: number) {
  const timestamps: number[] = []

  async function waitForSlot(): Promise<void> {
    const now = Date.now()
    const windowStart = now - 60_000
    // Evict expired timestamps
    while (timestamps.length > 0 && timestamps[0] < windowStart) {
      timestamps.shift()
    }
    if (timestamps.length < rpm) return

    // Window is full — wait until oldest slot expires (+100ms buffer)
    const waitMs = timestamps[0] + 60_000 - Date.now() + 100
    await new Promise<void>((resolve) => setTimeout(resolve, waitMs))
    return waitForSlot()
  }

  return {
    async enqueue<T>(task: () => Promise<T>): Promise<T> {
      await waitForSlot()
      timestamps.push(Date.now())
      return task()
    },
  }
}
