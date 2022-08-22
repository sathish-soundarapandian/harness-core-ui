import {
  pipelineListAPI,
  gitSyncBranchCall,
  gitSyncEnabledCall,
  gitSyncMetaCall
} from '../../support/70-pipeline/constants'

describe('Pipelines list view', () => {
  describe('Git Sync enabled', () => {
    beforeEach(() => {
      cy.on('uncaught:exception', () => {
        // returning false here prevents Cypress from
        // failing the test
        return false
      })
      cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
      cy.intercept('POST', pipelineListAPI, {
        fixture: 'pipeline/api/pipelines/getPipelineList.json'
      }).as('pipelineList')
      cy.login('test', 'test')
      cy.visitPipelinesList()
      cy.wait('@pipelineList')
    })
  })

  describe('Git Sync disabled', () => {
    beforeEach(() => {
      cy.on('uncaught:exception', () => {
        // returning false here prevents Cypress from
        // failing the test
        return false
      })
      cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: true })
      cy.intercept('POST', pipelineListAPI, {
        fixture: 'pipeline/api/pipelines/getPipelineList.json'
      }).as('pipelineList')
      cy.intercept('GET', gitSyncMetaCall, { fixture: 'ng/api/git-sync' })
      cy.intercept('GET', gitSyncBranchCall, { fixture: 'ng/api/git-sync-branches' })
      cy.login('test', 'test')
      cy.visitPipelinesList()
    })
  })
})
