import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // No proxy for /login and /signup to avoid "Cannot GET /login"
    // Only proxy /api routes if needed later
  }
})