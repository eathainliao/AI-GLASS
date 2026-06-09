import { useAnnotationStore, type AnnotationStatus } from '../store/annotationStore'

const BUTTONS: {
  status: AnnotationStatus
  label: string
  active: string
  inactive: string
}[] = [
  {
    status: 'pending',
    label: '待確認',
    active: 'border-gray-400 bg-gray-200 text-gray-700',
    inactive: 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600',
  },
  {
    status: 'ai',
    label: '疑似 AI',
    active: 'border-red-400 bg-red-100 text-red-700',
    inactive: 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500',
  },
  {
    status: 'genuine',
    label: '✓ 自行撰寫',
    active: 'border-green-400 bg-green-100 text-green-700',
    inactive: 'border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500',
  },
  {
    status: 'follow-up',
    label: '🚩 追蹤',
    active: 'border-amber-400 bg-amber-100 text-amber-700',
    inactive: 'border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500',
  },
]

interface BaseProps {
  filename: string
}

/** Four mutually-exclusive status toggle buttons. */
export function StatusButtons({ filename, compact = false }: BaseProps & { compact?: boolean }) {
  const { annotations, setStatus } = useAnnotationStore()
  const current = annotations[filename]?.status ?? 'pending'
  const pad = compact ? 'px-2 py-0.5' : 'px-2.5 py-1'

  return (
    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
      {BUTTONS.map(({ status, label, active, inactive }) => (
        <button
          key={status}
          onClick={() => setStatus(filename, status)}
          className={`whitespace-nowrap rounded-md border text-xs font-medium outline-none transition ease-out duration-150 focus-visible:ring-2 focus-visible:ring-indigo-300 active:scale-[0.97] ${pad} ${
            current === status ? active : inactive
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/** Short free-text note input bound to the annotation store. */
export function NoteInput({ filename }: BaseProps) {
  const { annotations, setNote } = useAnnotationStore()
  const note = annotations[filename]?.note ?? ''

  return (
    <input
      type="text"
      placeholder="備註..."
      value={note}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setNote(filename, e.target.value)}
      className="min-w-0 flex-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 placeholder-gray-300 outline-none transition ease-out duration-150 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200"
    />
  )
}

/** Buttons + note, side by side — used in card mode. */
export function StudentAnnotation({ filename }: BaseProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusButtons filename={filename} />
      <NoteInput filename={filename} />
    </div>
  )
}
