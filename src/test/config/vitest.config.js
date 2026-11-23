// frontend/src/test/config/vitest.config.js
// ============================================================
// Vitest Configuration - Production Ready
// ============================================================
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.js'],
    css: true,
    testTimeout: 15000,
    hookTimeout: 15000,
    teardownTimeout: 10000,
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-report.html',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.js',
        '**/main.jsx',
        '**/reportWebVitals.jsx',
        '**/*.stories.*',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/test/**/*.test.{js,jsx}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'coverage/',
      'src/test/e2e/**',
    ],
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    logHeapUsage: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../..'),
      '@test': resolve(__dirname, '..'),
      '@components': resolve(__dirname, '../../components'),
      '@pages': resolve(__dirname, '../../pages'),
      '@hooks': resolve(__dirname, '../../hooks'),
      '@services': resolve(__dirname, '../../services'),
      '@utils': resolve(__dirname, '../../utils'),
      '@context': resolve(__dirname, '../../context'),
    },
  },
});
