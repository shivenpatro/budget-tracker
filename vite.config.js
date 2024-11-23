import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/budget-tracker/',
  server: {
    port: 5173,
    strictPort: false,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})