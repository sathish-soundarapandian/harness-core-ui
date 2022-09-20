import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://localhost:8181',
    specPattern: 'integration/**/*.spec.{ts,tsx}',
    supportFile: 'support/index.ts',
    fixturesFolder: 'fixtures',
    videoUploadOnPasses: false
  },
  projectId: 'if5p69',
  viewportWidth: 1500,
  viewportHeight: 1000,
  retries: {
    runMode: 2,
    openMode: 0
  },
  fixturesFolder: 'fixtures'
})
