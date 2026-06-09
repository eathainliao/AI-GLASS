// Spinner — 快轉載入指示器（0.6s），用於按鈕與分析中狀態。
// 只用 transform 旋轉（GPU 友善），尊重 prefers-reduced-motion（全域已降速）。

interface Props {
  /** 邊長 px，預設 14（適合內嵌於文字旁） */
  size?: number
  className?: string
}

export function Spinner({ size = 14, className = '' }: Props) {
  return (
    <svg
      className={`animate-spin-fast ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
