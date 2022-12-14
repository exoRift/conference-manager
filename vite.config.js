import {
  defineConfig,
  loadEnv
} from 'vite'
import fs from 'fs'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), svgr()],
    server: {
      port: 3000,
      https: {
        key: fs.readFileSync(process.env.SSL_KEY_FILE),
        cert: fs.readFileSync(process.env.SSL_CRT_FILE)
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
  }
})
