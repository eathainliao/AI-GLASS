import { useRef, useState } from 'react'

interface Props {
  onAnalyze: (files: File[]) => void
  disabled?: boolean
}

const ACCEPT = '.docx,.pdf,.txt,.jpg,.jpeg,.png,.webp,.heic'

function fileIcon(file: File): string {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return '📄'
  if (name.endsWith('.docx')) return '📝'
  if (/\.(jpg|jpeg|png|webp|gif|heic)$/.test(name)) return '🖼'
  return '📃'
}

export function FileDropzone({ onAnalyze, disabled }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const next = Array.from(incoming)
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...next.filter((f) => !names.has(f.name))]
    })
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors duration-150 ${
          dragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40'
        }`}
      >
        <span className="text-3xl">📂</span>
        <p className="mt-2 text-sm font-medium text-gray-600">點擊選檔，或拖放作業至此</p>
        <p className="mt-1 text-xs text-gray-400">支援 DOCX、PDF、TXT、JPG/PNG（手寫圖片）</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="animate-enter rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-medium text-gray-700">已選擇 {files.length} 份作業</p>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-gray-400 transition ease-out duration-150 hover:text-gray-600 active:scale-[0.97]"
            >
              全部清除
            </button>
          </div>
          <ul className="max-h-48 divide-y divide-gray-50 overflow-y-auto">
            {files.map((f) => (
              <li key={f.name} className="animate-enter flex items-center justify-between px-4 py-2">
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <span>{fileIcon(f)}</span>
                  <span className="max-w-xs truncate">{f.name}</span>
                </span>
                <button
                  onClick={() => removeFile(f.name)}
                  className="ml-2 text-xs text-gray-300 transition ease-out duration-150 hover:text-red-400 active:scale-[0.97]"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              onClick={() => onAnalyze(files)}
              disabled={disabled}
              className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition ease-out duration-150 hover:bg-indigo-700 active:scale-[0.97] disabled:opacity-50"
            >
              開始分析 {files.length} 份作業
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
