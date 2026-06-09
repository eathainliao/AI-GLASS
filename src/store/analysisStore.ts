import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AnalysisResult, BatchStatus } from '../types'

interface AnalysisStore {
  status: BatchStatus
  progress: { completed: number; total: number }
  results: AnalysisResult[]
  errors: Record<string, string>
  /** 本批次的原始檔案，供「重試失敗項」使用（不持久化，重整後遺失） */
  files: File[]
  startBatch: (files: File[]) => void
  /** 重跑失敗項：保留既有 results，清空 errors，進度接續既有成功數 */
  startRetry: (failedCount: number) => void
  addResult: (result: AnalysisResult) => void
  addError: (filename: string, message: string) => void
  finishBatch: () => void
  reset: () => void
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      status: 'idle' as BatchStatus,
      progress: { completed: 0, total: 0 },
      results: [],
      errors: {},
      files: [],

      startBatch: (files) =>
        set({
          status: 'analyzing',
          progress: { completed: 0, total: files.length },
          results: [],
          errors: {},
          files,
        }),

      startRetry: (failedCount) =>
        set((s) => ({
          status: 'analyzing',
          errors: {},
          progress: {
            completed: s.results.length,
            total: s.results.length + failedCount,
          },
        })),

      addResult: (result) =>
        set((s) => ({
          results: [...s.results, result],
          progress: { ...s.progress, completed: s.progress.completed + 1 },
        })),

      addError: (filename, message) =>
        set((s) => ({
          errors: { ...s.errors, [filename]: message },
          progress: { ...s.progress, completed: s.progress.completed + 1 },
        })),

      finishBatch: () => set({ status: 'done' }),

      reset: () =>
        set({
          status: 'idle',
          progress: { completed: 0, total: 0 },
          results: [],
          errors: {},
          files: [],
        }),
    }),
    {
      name: 'ai-glass:analysis',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist results and errors; derive status/progress on rehydration
      partialize: (state) => ({ results: state.results, errors: state.errors }),
      merge: (persisted, current) => {
        const p = persisted as Pick<AnalysisStore, 'results' | 'errors'>
        const hasData = p.results.length > 0 || Object.keys(p.errors).length > 0
        const total = p.results.length + Object.keys(p.errors).length
        return {
          ...current,
          results: p.results,
          errors: p.errors,
          files: [], // File 物件無法序列化，重整後遺失 → 隱藏重試鈕
          status: (hasData ? 'done' : 'idle') as BatchStatus,
          progress: hasData ? { completed: total, total } : { completed: 0, total: 0 },
        }
      },
    }
  )
)
