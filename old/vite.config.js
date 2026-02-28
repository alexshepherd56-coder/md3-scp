import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: false, // Keep assets folder as-is
  server: {
    port: 3000,
    open: true,
    host: true
  },
  appType: 'mpa', // Multi-page app - each HTML file is separate
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
