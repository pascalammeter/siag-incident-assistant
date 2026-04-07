import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables for tests
dotenv.config({ path: '.env.local' })

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 30000, // Increase timeout for Puppeteer PDF generation
    exclude: ['**/node_modules/**', '**/.claude/worktrees/**'],
    environmentMatchGlobs: [
      ['**/api/**', 'node'], // Use node environment for API tests
      ['**/__tests__/**', 'jsdom'], // Use jsdom for UI tests
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
