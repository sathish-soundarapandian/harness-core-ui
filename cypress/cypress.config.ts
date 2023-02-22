import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://localhost:8181',
    //baseUrl: 'https://director-cy.qa.harness.io/',
    specPattern: 'integration/**/*.spec.{ts,tsx}',
    supportFile: 'support/index.ts',
    fixturesFolder: 'fixtures',
    videoUploadOnPasses: false
  },
  projectId: 'harness-core-ui',
  viewportWidth: 1500,
  viewportHeight: 1000,
  retries: {
    runMode: 2,
    openMode: 0
  },
  fixturesFolder: 'fixtures',
  env: {
    projectId: 'harness-core-ui',
    // since urls need addHashInCypressURLBasedOnBrowserRouter function to create urls with hash and
    // without hash and inorder to decide if the browserRouterEnabeld  is true or not in app's window object,
    //Cypress does not have access to the app intially so injecting the browserRouterEnabled flag inside cypress env
    browserRouterEnabled: true
  }
})
