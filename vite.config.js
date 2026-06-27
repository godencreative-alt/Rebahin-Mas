import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// outDir = dist-new : folder yang disajikan nginx (root watch.godenpg.dev).
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist-new', emptyOutDir: true },
})
