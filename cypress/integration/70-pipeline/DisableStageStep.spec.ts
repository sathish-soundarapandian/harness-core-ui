import {
  gitSyncEnabledCall,
  pipelineDetails,
  pipelineStudioRoute,
  stepLibrary
} from '../../support/70-pipeline/constants'

describe('Enable/disable stage/step execution', () => {
  const visitExecutionStageWithAssertion = (): void => {
    cy.visit(pipelineStudioRoute, {
      timeout: 30000
    })
    cy.wait(2000)
    cy.visitPageAssertion()
    cy.wait('@pipelineDetailsAPIRoute', { timeout: 30000 })
    cy.wait(2000)
  }
  beforeEach(() => {
    cy.initializeRoute()
    cy.intercept('GET', gitSyncEnabledCall, {
      connectivityMode: null,
      gitSyncEnabled: false,
      gitSimplificationEnabled: false
    })
    cy.intercept('POST', stepLibrary, { fixture: 'pipeline/api/jenkinsStep/stepLibraryResponse.json' }).as(
      'stepLibrary'
    )
    cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/pipelineWithAllStages.json' }).as(
      'pipelineDetailsAPIRoute'
    )
    visitExecutionStageWithAssertion()
  })
  it('disabling stages', () => {
    cy.get('div[data-testid="toggle-stage1"]').click({ force: true })
    cy.get('div[data-testid="toggle-stage1"] input[type="checkbox"]').should('not.be.checked')

    cy.get('div[data-testid="toggle-pipeline"]').click({ force: true })
    cy.get('div[data-testid="toggle-pipeline"] input[type="checkbox"]').should('not.be.checked')

    cy.get('div[data-testid="toggle-customStage"]').click({ force: true })
    cy.get('div[data-testid="toggle-customStage"] input[type="checkbox"]').should('not.be.checked')

    cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/pipelineWithAllStagesAfterSave.json' }).as(
      'pipelineDetailsAPIRouteAfterSave'
    )
    cy.contains('span', 'Save').click()
    cy.wait(500)
    // Verify all details in YAML view
    cy.get('div[data-name="toggle-option-two"]').should('be.visible').click()
    cy.contains('span', 'condition').should('be.visible') // Conditional execution is there
    cy.contains('span', 'false').should('be.visible') // Jexl is made false
  })
})
