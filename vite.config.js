import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: false, // Keep assets folder as-is
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
