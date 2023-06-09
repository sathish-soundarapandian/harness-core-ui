import {
  pipelineDetails,
  pipelineSaveCall,
  pipelineStudioRoute,
  stepLibrary
} from '../../support/70-pipeline/constants'

describe('RightDrawer test', () => {
  const saveTemplateCallWithNewTemplateParam =
    '/template/api/templates?accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&isNewTemplate=true&storeType=INLINE'
  const visitExecutionStageWithAssertion = (): void => {
    cy.visit(pipelineStudioRoute, {
      timeout: 30000
    })
    cy.wait(2000)
    cy.visitPageAssertion()
  }
  beforeEach(() => {
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

    //By default name and id should be steptype_1
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('K8sDelete_1').should('be.visible')
    cy.contains('span', 'Apply Changes').click()

    addDeleteStep()

    //adding same step should give default id and name as steptype_2
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('K8sDelete_2').should('be.visible')
    cy.contains('span', 'Apply Changes').click()

    addDeleteStep()
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('K8sDelete_3').should('be.visible')

    cy.contains('p', 'K8sDelete_2').click({ force: true })

    //editing existing stepname and check validation
    cy.fillField('name', 'K8sDelete_3')
    cy.contains('span', 'Apply Changes').click()
    cy.contains('span', 'Duplicate Step')
    cy.fillField('name', 'K8sDelete_4')
    cy.contains('span', 'Apply Changes').click()

    cy.wait(1000)
    addDeleteStep()
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('K8sDelete_4_1').should('be.visible')
    cy.contains('span', 'Apply Changes').click()

    cy.contains('p', 'K8sDelete_4').click({ force: true })
    cy.fillField('name', 'K8sDelete_5_1')
    addDeleteStep()
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('K8sDelete_5').should('be.visible')
    cy.contains('span', 'Apply Changes').click()
  })

  it('save step and template with same name', () => {
    cy.intercept('POST', saveTemplateCallWithNewTemplateParam, { fixture: '/template/api/templateCreation' }).as(
      'templates'
    )

    cy.get(`div[data-testid="pipeline-studio"]`, { timeout: 5000 }).should('be.visible')
    cy.contains('p', 'testStage_Cypress').click({ force: true })
    cy.contains('span', 'Execution').click()
    addDeleteStep()

    //By default name and id should be steptype_1
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('K8sDelete_1').should('be.visible')
    cy.contains('span', 'Apply Changes').click()

    addDeleteStep()
    cy.get('.bp3-drawer').within(() => {
      cy.get('button[aria-label="Save as Template"]').click()
    })
    cy.get('.bp3-dialog').within(() => {
      cy.get('input[name="name"]').clear().type('K8sDelete_2')
      cy.get('input[name="versionLabel"]').type('v1')
      cy.findByRole('button', { name: 'Save' }).click()
    })
    cy.wait('@templates')
    cy.findByText(/use template/i, { timeout: 30000 }).should('be.visible')
    cy.findByRole('button', { name: /yes/i }).click()
    cy.wait(2000)
    cy.get('.bp3-drawer').within(() => {
      cy.wait(2000)
      cy.findByRole('button', { name: /apply changes/i }).click()
    })
    addDeleteStep()

    //By default name and id should be steptype_3
    cy.get('div[class*="InputWithIdentifier--idValue"]').contains('K8sDelete_3').should('be.visible')
  })

  it('right drawer should be closed on clicking browser back button when stepId is present', () => {
    // select pipeline
    cy.get(`div[data-testid="pipeline-studio"]`, { timeout: 5000 }).should('be.visible')
    cy.contains('p', 'testStage_Cypress').click({ force: true })
    cy.contains('span', 'Execution').click()
    addDeleteStep()
    cy.contains('span', 'Apply Changes').click()

    cy.contains('p', 'K8sDelete_1').click({ force: true })
    cy.get('div[class="bp3-drawer-header"] span').contains('span', 'Discard').should('be.visible').click()

    addDeleteStep()
    cy.contains('span', 'Apply Changes').click()
    cy.contains('p', 'K8sDelete_2').click({ force: true })

    cy.go('back')
    cy.url().should('not.contain', 'stepId')
    cy.get('.bp3-drawer').should('not.be.visible')
    cy.go('back')
    cy.go('back')
    cy.url().should('contain', 'stepId').and('contain', 'K8sDelete_1')
    cy.get('.bp3-drawer').should('be.visible')
  })
})
