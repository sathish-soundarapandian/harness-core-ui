import {
  pipelineSaveCall,
  stepLibrary,
  pipelineDetails,
  pipelineStudioRoute,
  azureSubscriptions,
  azureResourceGroups
} from '../../support/70-pipeline/constants'

describe('Azure Arm Steps', () => {
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
    cy.intercept('GET', azureSubscriptions, { fixture: 'ng/api/AzureSubscriptions' }).as('azureSubscriptions')
    cy.intercept('GET', azureResourceGroups, { fixture: 'ng/api/AzureResourceGroups' }).as('azureResourceGroups')

    visitExecutionStageWithAssertion()
  })

  const openExecutionScreen = (stageText: string): void => {
    // select pipeline
    cy.get(`div[data-testid="pipeline-studio"]`, { timeout: 5000 }).should('be.visible')
    cy.contains('p', 'testStage_Cypress').click()
    cy.contains('span', 'Execution').click()
    cy.get('p[data-name="node-name"]').contains('Add Step').click({ force: true })
    cy.wait(1000)
    cy.get('[class*="ExecutionGraph-module_add-step-popover"]', { withinSubject: null })
      .should('be.visible')
      .within(() => {
        cy.contains('span', 'Add Step').should('be.visible').click({ force: true })
      })
    cy.wait('@stepLibrary').wait(500)
    cy.contains('section', stageText).click({ force: true })
  }

  it('azure rollback step addition, with all fixed values', () => {
    openExecutionScreen('Rollback Azure ARM Resources')
    // select azure arm rollback step
    cy.contains('section', 'Rollback Azure ARM Resources').should('be.visible')
    cy.contains('section', 'Rollback Azure ARM Resources').click({ force: true })
    cy.wait(500)
    cy.contains('span', 'Apply Changes').click({ force: true })
    // show validation errors
    cy.contains('span', 'Step Name is required').should('be.visible')
    cy.contains('span', 'Provisioner Identifier is required').should('be.visible')

    // fill in form
    cy.get('input[name="name"]').type('azure rollback')
    cy.get('input[name="spec.provisionerIdentifier"]').type('azureProvisionerIdentifier')
    cy.contains('span', 'Apply Changes').click({ force: true })
  })

  it('azure rollback step addition, with runtime values', () => {
    openExecutionScreen('Rollback Azure ARM Resources')
    // select azure arm rollback step
    cy.contains('section', 'Rollback Azure ARM Resources').should('be.visible')
    cy.contains('section', 'Rollback Azure ARM Resources').click({ force: true })
    cy.wait(500)
    cy.get('input[name="name"]').type('azure rollback')
    // timeout
    cy.get('.MultiTypeInput--btn').eq(0).click()
    cy.contains('span', 'Runtime input').click()
    // provisioner identifier
    cy.get('.MultiTypeInput--btn').eq(1).click({ force: true })
    cy.contains('span', 'Runtime input').click({ force: true })

    cy.contains('span', 'Apply Changes').click({ force: true })
  })

  it('azure blueprint step addition, with all fixed values', () => {
    openExecutionScreen('Create Azure BP Resources')
    // select azure blueprint step
    cy.contains('section', 'Create Azure BP Resources').should('be.visible')
    cy.contains('section', 'Create Azure BP Resources').click({ force: true })
    cy.contains('span', 'Apply Changes').click({ force: true })
    cy.wait(500)

    // show validation errors
    cy.contains('span', 'Step Name is required').should('be.visible')
    cy.contains('span', 'Connector is required').should('be.visible')
    cy.contains('span', 'Assignment Name Required').should('be.visible')

    // fill in form
    cy.get('input[name="name"]').type('azure blueprint')
    cy.get('input[name="spec.configuration.assignmentName"]').type('azureBlueprintAssignmentName')
    cy.contains('span', 'Select').click()
    cy.contains('p', 'azureConnector').click({ force: true })
    cy.wait(500)
    cy.contains('span', 'Apply Selected').click()

    // add template file
    cy.contains('a', 'Specify Azure Blueprint Template File').click()
    cy.wait(500)
    cy.get('span[data-icon="service-github"]').click({ force: true })
    cy.contains('span', 'Select Connector').should('be.visible')
    cy.contains('span', 'Select Connector').click()
    cy.contains('p', 'NewGitTestConn1').click()
    cy.contains('span', 'Apply Selected').click()
    cy.contains('span', 'Continue').click()
    cy.get('input[name="gitFetchType"]').click()
    cy.contains('p', 'Latest from Branch').click()
    cy.get('input[name="branch"]').type('main')
    cy.get('input[name="folderPath"]').type('template/folder/path')
    cy.contains('span', 'Submit').click({ force: true })
    cy.wait(500)

    // submit step
    cy.contains('span', 'Apply Changes').click({ force: true })
  })

  it('azure blueprint step, with runtime values', () => {
    openExecutionScreen('Create Azure BP Resources')
    // select azure blueprint step
    cy.contains('section', 'Create Azure BP Resources').should('be.visible')
    cy.contains('section', 'Create Azure BP Resources').click({ force: true })
    cy.wait(500)

    // fill in form
    cy.get('input[name="name"]').type('azure blueprint')
    // timeout
    cy.get('.MultiTypeInput--btn').eq(0).click()
    cy.contains('span', 'Runtime input').click()
    // azure connector
    cy.get('.MultiTypeInput--btn').eq(1).click()
    cy.contains('span', 'Runtime input').click()
    // assignment name
    cy.get('.MultiTypeInput--btn').eq(2).click()
    cy.contains('span', 'Runtime input').click()

    // add template file
    cy.contains('a', 'Specify Azure Blueprint Template File').click()
    cy.wait(500)
    cy.get('span[data-icon="service-github"]').click({ force: true })
    cy.get('.MultiTypeInput--btn').eq(3).click()
    cy.contains('span', 'Runtime input').click()
    cy.contains('span', 'Continue').click()
    // repo details
    cy.get('input[name="gitFetchType"]').click()
    cy.contains('p', 'Latest from Branch').click()
    cy.get('.MultiTypeInput--btn').eq(3).click()
    cy.contains('span', 'Runtime input').click()
    cy.get('.MultiTypeInput--btn').eq(4).click()
    cy.contains('span', 'Runtime input').click()
    cy.contains('span', 'Submit').click({ force: true })
    cy.wait(500)

    // submit step
    cy.contains('span', 'Apply Changes').click({ force: true })
  })

  it('azure arm step addition, with all fixed values', () => {
    openExecutionScreen('Create Azure ARM Resources')
    // select azure arm rollback step
    cy.contains('section', 'Create Azure ARM Resources').should('be.visible')
    cy.contains('section', 'Create Azure ARM Resources').click({ force: true })
    cy.wait(500)
    cy.contains('span', 'Apply Changes').click({ force: true })
    // show validation errors
    cy.contains('span', 'Step Name is required').should('be.visible')
    cy.contains('span', 'Provisioner Identifier is required').should('be.visible')
    cy.contains('span', 'Connector is required').should('be.visible')
    cy.contains('span', 'Subscription is Required').should('be.visible')
    cy.contains('span', 'Resource Group is Required').should('be.visible')
    cy.contains('span', 'Mode is Required').should('be.visible')

    // fill in form
    cy.get('input[name="name"]').type('project1')
    cy.get('input[name="spec.provisionerIdentifier"]').type('azureArmProvisionerIdentifier')
    cy.contains('span', 'Select').click()
    cy.contains('p', 'azureConnector').click()
    cy.contains('span', 'Apply Selected').click()

    // add template file
    cy.contains('a', 'Specify ARM Template File').click()
    cy.wait(500)
    cy.get('span[data-icon="service-github"]').click({ force: true })
    cy.contains('span', 'Select Connector').should('be.visible')
    cy.contains('span', 'Select Connector').click()
    cy.contains('p', 'NewGitTestConn1').click()
    cy.contains('span', 'Apply Selected').click()
    cy.contains('span', 'Continue').click()
    cy.get('input[name="gitFetchType"]').click()
    cy.contains('p', 'Latest from Branch').click()
    cy.get('input[name="branch"]').type('main')
    cy.get('input[name="paths"]').type('template/folder/path')
    cy.contains('span', 'Submit').click({ force: true })
    cy.wait(500)

    // scope
    cy.get('input[name="spec.configuration.scope.spec.subscription"]').click()
    cy.contains('p', 'Azure subscription 1').click()
    cy.get('input[name="spec.configuration.scope.spec.resourceGroup"]').click()
    cy.contains('p', 'test-tf-rg').click()
    cy.get('input[name="spec.configuration.scope.spec.mode"]').eq(1).click({ force: true })
    cy.contains('span', 'Apply Changes').click({ force: true })
  })

  it('azure arm step addition, with all runtime values', () => {
    openExecutionScreen('Create Azure ARM Resources')
    // select azure arm rollback step
    cy.contains('section', 'Create Azure ARM Resources').should('be.visible')
    cy.contains('section', 'Create Azure ARM Resources').click({ force: true })
    cy.wait(500)
    cy.get('input[name="name"]').type('project1')
    // timeout
    cy.get('.MultiTypeInput--btn').eq(0).click()
    cy.contains('span', 'Runtime input').click()
    // provisioner identifier
    cy.get('.MultiTypeInput--btn').eq(1).click()
    cy.contains('span', 'Runtime input').click()
    // azure connector
    cy.get('.MultiTypeInput--btn').eq(2).click()
    cy.contains('span', 'Runtime input').click()
    // scope subscription
    cy.get('.MultiTypeInput--btn').eq(3).click()
    cy.contains('span', 'Runtime input').click()
    // scope resource gorup
    cy.get('.MultiTypeInput--btn').eq(4).click()
    cy.contains('span', 'Runtime input').click()

    // add template file
    cy.contains('a', 'Specify ARM Template File').click()
    cy.wait(500)
    cy.get('span[data-icon="service-github"]').click({ force: true })
    cy.get('.MultiTypeInput--btn').eq(5).click()
    cy.contains('span', 'Runtime input').click()
    cy.contains('span', 'Continue').click()
    // repo details
    cy.get('.MultiTypeInput--btn').eq(5).click()
    cy.contains('span', 'Runtime input').click()
    cy.get('input[name="gitFetchType"]').click()
    cy.contains('p', 'Latest from Branch').click()
    cy.get('.MultiTypeInput--btn').eq(6).click()
    cy.contains('span', 'Runtime input').click()
    cy.contains('span', 'Submit').click({ force: true })
    cy.wait(500)

    // scope
    cy.get('input[name="spec.configuration.scope.spec.mode"]').eq(1).click({ force: true })

    cy.contains('span', 'Apply Changes').click({ force: true })
  })
})
