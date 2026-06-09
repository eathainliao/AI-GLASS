# AI-GLASS — 作業 AI 鑑識工具

幫助教師快速批閱全班作業，自動標記疑似 AI 生成句型（紅色）與已知事實引用（藍色）。

## 取得 Gemini API Key（免費，約 30 秒）

1. 前往 [Google AI Studio](https://aistudio.google.com/)
2. 左側選單點選 **Get API key** → **Create API key**
3. 複製金鑰備用（格式：`AIza...`）

> 免費額度：10 次/分鐘、1,500 次/天，永不過期，無需綁定信用卡。

## 本機使用

### 開發模式（需要 Node.js）

```bash
npm install
npm run dev
```

開啟瀏覽器 `http://localhost:5173`

### 建立靜態版本供教師使用

```bash
npm run build
```

產出 `dist/` 資料夾，包含完整靜態網頁。

**Windows 啟動方式** — 在 `dist/` 旁建立 `start.bat`，教師雙擊即可：

```bat
@echo off
python -m http.server 8080 --directory dist
start http://localhost:8080
```

**Mac / Linux** — 建立 `start.sh`：

```bash
#!/bin/bash
python3 -m http.server 8080 --directory dist &
sleep 1
open http://localhost:8080
```

> Python 在 Windows 10/11、macOS、Linux 均已預裝，教師不需安裝 Node.js。

## 隱私說明

- API Key 儲存於**您自己電腦的瀏覽器**，不上傳至任何伺服器
- 作業內容直接從瀏覽器送至 Google Gemini API，開發者無法存取
- 關閉分頁後，分析結果不會被保留

## 開發階段路線圖

| 階段 | 內容 | 狀態 |
|---|---|---|
| **A** | 專案框架 + Gemini 連線測試 | 完成 |
| **B** | API Key 加密本機儲存 + 完整 Gemini 分析 | 完成 |
| **C** | 檔案上傳（DOCX/PDF/圖片）+ 批次分析 + 雙色高亮報告 | 完成 |
| D | 全班撞車比對（選用）| 待評估 |

## 常用指令

```bash
npm run dev              # 開發伺服器 http://localhost:5173
npm run build            # 生產構建 → dist/
npm run preview          # 預覽 dist/
npm run lint             # ESLint
npx tsc --noEmit         # 型別檢查
npx prettier --write src/   # 格式化
```
