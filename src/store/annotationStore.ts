import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AnnotationStatus = 'pending' | 'ai' | 'genuine' | 'follow-up'

export interface StudentAnnotation {
  status: AnnotationStatus
  note: string
}

interface AnnotationStore {
  annotations: Record<string, StudentAnnotation>
  setStatus: (filename: string, status: AnnotationStatus) => void
  setNote: (filename: string, note: string) => void
  reset: () => void
}

const DEFAULT: StudentAnnotation = { status: 'pending', note: '' }

export const useAnnotationStore = create<AnnotationStore>()(
  persist(
    (set) => ({
      annotations: {},
      setStatus: (filename, status) =>
        set((s) => ({
          annotations: {
            ...s.annotations,
            [filename]: { ...(s.annotations[filename] ?? DEFAULT), status },
          },
        })),
      setNote: (filename, note) =>
        set((s) => ({
          annotations: {
            ...s.annotations,
            [filename]: { ...(s.annotations[filename] ?? DEFAULT), note },
          },
        })),
      reset: () => set({ annotations: {} }),
    }),
    {
      name: 'ai-glass:annotations',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
