import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署於子路徑 https://eathainliao.github.io/AI-GLASS/
  base: '/AI-GLASS/',
  plugins: [react()],
})
