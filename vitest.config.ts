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
    hookTimeout: 60000, // Increase hook timeout for database operations
    exclude: ['**/node_modules/**', '**/.claude/worktrees/**'],
    environmentMatchGlobs: [
      ['**/api/**', 'node'], // Use node environment for API tests
      ['**/integration/**', 'node'], // Use node environment for integration tests
      ['**/__tests__/**', 'jsdom'], // Use jsdom for UI tests
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/api/**/*.ts'],
      exclude: [
        'node_modules/',
        'src/**/__tests__/',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        '**/*.d.ts',
      ],
      all: true,
      lines: 75,
      functions: 75,
      branches: 70,
      statements: 75,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
