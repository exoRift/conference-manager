import { defineConfig } from 'vite'
import fs from 'fs'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    port: 3000,
    https: {
      key: fs.readFileSync('./ssl/localhost.key'),
      cert: fs.readFileSync('./ssl/localhost.crt')
    },
    proxy: {
      '/api': {
        target: 'https://localhost:5000/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'build/'
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer()
      ]
    }
  },
  define: {
    'process.env': process.env
  }
})
