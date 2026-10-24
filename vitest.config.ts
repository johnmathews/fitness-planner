import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,vue}'],
        // The style guide is development-only; W13's browser suite covers it.
        exclude: ['src/main.ts', 'src/**/__tests__/**', 'src/styleguide/**'],
        reporter: ['text', 'html'],
        // Floors at the level the suite holds; CI fails if coverage drops below them.
        thresholds: { lines: 100, functions: 100, statements: 99, branches: 98 },
      },
    },
  }),
)
