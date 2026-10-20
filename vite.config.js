import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite is the tool that runs your app in development and builds it for production.
export default defineConfig({
  plugins: [react()],
})
