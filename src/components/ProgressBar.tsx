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
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-2 w-full origin-left rounded-full bg-indigo-500"
          style={{
            transform: `scaleX(${pct / 100})`,
            transition: 'transform 400ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        />
      </div>
    </div>
  )
}
