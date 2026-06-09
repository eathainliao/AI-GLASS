import { useState } from 'react'
import type { AnalysisResult } from '../types'
import { ratioBadgeClass } from './StudentReport'
import { ReportDetail } from './ReportDetail'
import { StatusButtons, NoteInput } from './StudentAnnotation'

interface Props {
  results: AnalysisResult[]
}

export function StudentTable({ results }: Props) {
  const [openFile, setOpenFile] = useState<string | null>(null)

  return (
    <div className="animate-enter overflow-hidden rounded-xl border border-gray-200 bg-white">
      <ul className="divide-y divide-gray-100">
        {results.map((r) => {
          const open = openFile === r.filename
          return (
            <li key={r.filename}>
              {/* Row */}
              <div
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-gray-50"
                onClick={() => setOpenFile(open ? null : r.filename)}
              >
                <span className="w-40 shrink-0 truncate text-sm font-medium text-gray-800">
                  {r.filename}
                </span>
                <span
                  className={`w-16 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-medium ${ratioBadgeClass(r.suspectRatio)}`}
                >
                  {(r.suspectRatio * 100).toFixed(0)}%
                </span>
                <div className="flex-1">
                  <StatusButtons filename={r.filename} compact />
                </div>
                <span
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? 'rotate-180' : ''}`}
                >
                  ▾
                </span>
              </div>

              {/* Expanded */}
              {open && (
                <div className="animate-enter space-y-3 border-t border-gray-100 bg-gray-50/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">備註</span>
                    <NoteInput filename={r.filename} />
                  </div>
                  <ReportDetail result={r} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
