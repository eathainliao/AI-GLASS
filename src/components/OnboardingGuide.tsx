const STEPS = [
  { n: 1, text: <span>前往 <strong>Google AI Studio</strong>（aistudio.google.com）</span> },
  { n: 2, text: <span>點擊左側選單 <strong>Get API key</strong> → 建立新金鑰（完全免費）</span> },
  { n: 3, text: <span>複製金鑰，貼入下方輸入框即可開始使用</span> },
]

export function OnboardingGuide() {
  return (
    <div className="animate-enter rounded-xl border border-blue-200 bg-blue-50 p-6 text-left">
      <h2 className="mb-4 text-lg font-semibold text-blue-800">如何取得免費 Gemini API Key</h2>
      <ol className="space-y-3 text-sm text-blue-700">
        {STEPS.map(({ n, text }) => (
          <li
            key={n}
            className="animate-enter flex gap-3"
            style={{ animationDelay: `${n * 80}ms` }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-200 font-bold">
              {n}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
