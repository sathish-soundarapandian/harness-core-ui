import {
  pipelineDetails,
  pipelineSaveCall,
  pipelineStudioRoute,
  stepLibrary
} from '../../support/70-pipeline/constants'

describe('RightDrawer test', () => {
  const visitExecutionStageWithAssertion = (): void => {
    cy.visit(pipelineStudioRoute, {
      timeout: 30000
    })
    cy.wait(2000)
    cy.visitPageAssertion()
  }
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })

    cy.initializeRoute()
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.post' })
    cy.intercept('POST', stepLibrary, { fixture: 'ng/api/stepLibrary' }).as('stepLibrary')
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.postsuccess' })
    cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/inputSet/pipelineDetails' }).as('pipelineDetails')
    visitExecutionStageWithAssertion()
  })

  const addDeleteStep = (): void => {
    cy.get('p[data-name="node-name"]').contains('Add Step').click({ force: true })
    cy.wait(1000)
    cy.get('[class*="ExecutionGraph-module_add-step-popover"]', { withinSubject: null })
      .should('be.visible')
      .within(() => {
        cy.contains('span', 'Add Step').should('be.visible').click({ force: true })
      })
    cy.wait('@stepLibrary').wait(500)
    cy.get('div[data-testid="step-card-Delete"]').click({ force: true })
    cy.contains('p', 'Delete').should('be.visible')
    cy.fillField('spec.deleteResources.spec.resourceNames[0].value', 'resource')
  }

  it('default name and id test', () => {
    // select pipeline
    cy.get(`div[data-testid="pipeline-studio"]`, { timeout: 5000 }).should('be.visible')
    cy.contains('p', 'testStage_Cypress').click({ force: true })
    cy.contains('span', 'Execution').click()
    addDeleteStep()

    //By default name and id should be stepname_1
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('Delete_1').should('be.visible')
    cy.contains('span', 'Apply Changes').click()

    addDeleteStep()

    //adding same step should give default id and name as stepname_2
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('Delete_2').should('be.visible')
    cy.contains('span', 'Apply Changes').click()

    addDeleteStep()
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('Delete_3').should('be.visible')

    cy.contains('p', 'Delete_2').click({ force: true })

    //editing existing stepname and check validation
    cy.fillField('name', 'Delete_3')
    cy.contains('span', 'Apply Changes').click()
    cy.contains('span', 'Duplicate Step')
    cy.fillField('name', 'Delete_4')
    cy.contains('span', 'Apply Changes').click()

    cy.wait(1000)
    addDeleteStep()
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('Delete_4_1').should('be.visible')
    cy.contains('span', 'Apply Changes').click()

    cy.contains('p', 'Delete_4').click({ force: true })
    cy.fillField('name', 'Delete_5_1')
    addDeleteStep()
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('Delete_5').should('be.visible')
    cy.contains('span', 'Apply Changes').click()
  })
})
