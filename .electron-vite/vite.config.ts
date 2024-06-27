import { join } from 'path'
import { defineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { getConfig } from './utils'
import topLevelAwait from 'vite-plugin-top-level-await'
import fixHoistStatic from '../plugins/fix-hoist-static'
const __defProp = Object.defineProperty
const __name = (target, value) => __defProp(target, 'name', { value, configurable: true })
globalThis.__name = __name
import packageInfo from '../package.json'

function resolve(dir: string) {
  return join(__dirname, '..', dir)
}
const config = getConfig()

const root = resolve('src/renderer')

export default defineConfig({
  mode: process.env.NODE_ENV,
  root,
  define: {
    __CONFIG__: config,
    __VERSION__: JSON.stringify(packageInfo.version)
  },
  resolve: {
    alias: {
      '@renderer': root,
      '@main': resolve('src/main')
    }
  },
  base: './',
  build: {
    outDir: config && config.target ? resolve('dist/web') : resolve('dist/electron/renderer'),
    emptyOutDir: true,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        index: resolve('src/renderer/index.html')
      }
    }
  },
  esbuild: {
    drop: config && config.target ? ['console', 'debugger'] : []
  },
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    vueJsx(),
    vuePlugin(),
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: i => `__tla_${i}`
    })
  ],
  // CSS 相关选项
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@renderer/styles/common.scss";` //引入全局变量
      }
    }
  },
  optimizeDeps: {}
})
