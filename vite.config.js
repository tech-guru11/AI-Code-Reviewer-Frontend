import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind IPv4 explicitly. Vite's default "localhost" can resolve to ::1,
    // which fails here, and the backend OAuth callback is registered as
    // 127.0.0.1, so the whole flow should stay on 127.0.0.1.
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // Proxy the API through the dev server so the browser sees a single
    // origin. Without this the page (localhost:5173) and the API
    // (127.0.0.1:8000) are different sites, and SameSite=Lax makes the
    // browser withhold the session cookie, so every authenticated request
    // fails with 401 "Authentication required.".
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
