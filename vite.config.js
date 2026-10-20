import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite is the tool that runs your app in development and builds it for production.
export default defineConfig({
  plugins: [react()],

  // Vitest (our test runner) reads its settings from this same file.
  test: {
    environment: 'jsdom', // a simulated browser, so components can render in Node
    globals: true, // expect, describe, afterEach... without importing them
    setupFiles: './src/setupTests.js', // runs before every test file
  },
})
