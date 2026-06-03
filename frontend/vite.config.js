import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.js',
      },
      preload: {
        input: 'electron/preload.js',
      },
      renderer: {},
    }),
  ],
  server: {
    proxy: {
      // 代理所有 /sync-api 开头的请求到 localhost:8000
      '/sync-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sync-api/, ''),
      },
    },
  },
})
