// AppIntro — 首次登入頁的功能說明區塊
// 讓初次點進來的教師快速理解「這工具是做什麼的、怎麼用」。

const STEPS = [
  { n: 1, title: '上傳作業', desc: '一次拖入全班的 .docx / .pdf / .txt 或作業照片' },
  { n: 2, title: 'AI 自動分析', desc: '由 Gemini 逐句檢視，標記疑似 AI 生成的句型' },
  { n: 3, title: '快速批閱', desc: '依 AI 疑慮比率排序，可篩選、加註、匯出 CSV 或列印' },
]

export function AppIntro() {
  return (
    <div className="animate-enter rounded-xl border border-gray-200 bg-white p-6 text-left">
      <h2 className="text-lg font-semibold text-gray-900">這是什麼工具？</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        AI-GLASS 幫助教師<strong>快速批閱全班作業</strong>，自動找出疑似 AI 代寫的段落，
        讓你把時間花在真正需要關注的學生身上。所有資料只留在你的瀏覽器，不經過任何伺服器。
      </p>

      {/* 三步驟流程 */}
      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {STEPS.map(({ n, title, desc }) => (
          <li
            key={n}
            className="animate-enter rounded-lg border border-gray-100 bg-gray-50 p-3"
            style={{ animationDelay: `${n * 80}ms` }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {n}
              </span>
              <span className="text-sm font-medium text-gray-800">{title}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{desc}</p>
          </li>
        ))}
      </ol>

      {/* 雙色高亮說明 */}
      <div className="mt-5 rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          報告怎麼看
        </p>
        <div className="flex flex-col gap-1.5 text-sm text-gray-600 sm:flex-row sm:gap-5">
          <span>
            <mark className="rounded bg-red-100 px-1 text-red-700">紅色</mark> 疑似 AI 罐頭句型
          </span>
          <span>
            <mark className="rounded bg-blue-100 px-1 text-blue-700">藍色</mark> 已知事實 / 名言引用
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        免費使用，只需一組 Gemini API Key（下方說明如何取得）。
      </p>
    </div>
  )
}
