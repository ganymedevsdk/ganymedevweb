import { resolve } from 'path'
import { defineConfig } from 'vite'

const r = (p) => resolve(__dirname, 'src', p)

export default defineConfig({
  root: resolve(__dirname, 'src'),
  base: '/',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: r('index.html'),
        kroneker: r('work/kroneker.html'),
        nextlevel: r('work/nextlevel.html'),
        nishi: r('work/nishi.html'),
        psiquiatria: r('work/psiquiatria.html'),
      },
    },
  },
  publicDir: resolve(__dirname, 'assets'),
})
