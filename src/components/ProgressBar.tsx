interface Props {
  completed: number
  total: number
}

export function ProgressBar({ completed, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  return (
    <div className="w-full">
      <p className="mb-1 text-sm text-gray-600">
        正在分析第 {completed} / {total} 篇...
      </p>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-2 w-full origin-left rounded-full bg-indigo-500"
          style={{
            transform: `scaleX(${pct / 100})`,
            transition: 'transform 400ms var(--ease-out)',
          }}
        />
        {/* 等待期間掃過的微光，傳達仍在運作（兩次完成之間進度條本來是靜止的） */}
        <div
          className="progress-shimmer pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
          }}
        />
      </div>
    </div>
  )
}
