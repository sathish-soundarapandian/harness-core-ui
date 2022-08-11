import {
  gitSyncEnabledCall,
  newPipelineRoute,
  servicesV2,
  postServiceCall,
  cdFailureStrategiesYaml,
  azureStrategiesYamlSnippets
} from '../../support/70-pipeline/constants'
import { environmentFetchCall, environmentSaveCall } from '../../support/75-cd/constants'

describe('Azure web app end to end test', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()
    cy.intercept('GET', gitSyncEnabledCall, {
      connectivityMode: null,
      gitSimplificationEnabled: false,
      gitSyncEnabled: false
    })
    cy.intercept('GET', cdFailureStrategiesYaml, {
      fixture: 'pipeline/api/pipelines/failureStrategiesYaml'
    }).as('cdFailureStrategiesYaml')
    cy.intercept('GET', servicesV2, { fixture: 'pipeline/api/services/serviceV2' }).as('servicesListCall')
    cy.intercept('POST', postServiceCall, { fixture: 'pipeline/api/services/createService' }).as('serviceCreationCall')
    cy.intercept('GET', environmentFetchCall, {
      fixture: 'ng/api/environmentsV2.json'
    }).as('environmentListCall')
    cy.intercept('POST', environmentSaveCall, {
      fixture: 'ng/api/environmentsV2.post.json'
    }).as('environmentCreationCall')
    cy.intercept('GET', azureStrategiesYamlSnippets, { fixture: 'ng/api/pipelines/kubernetesYamlSnippet' }).as(
      'azureYamlSnippet'
    )
  })
  const yamlValidations = function (connectorRef: string, subscriptionId: string): void {
    // Toggle to YAML view
    cy.get('[data-name="toggle-option-two"]').click({ force: true })
    cy.wait(1000)
    cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '40%', { ensureScrollable: false })
    cy.contains('span', connectorRef).should('be.visible')
    cy.contains('span', subscriptionId).should('be.visible')
  }
  it('end to end testing for azure web app', () => {
    cy.visit(newPipelineRoute, { timeout: 30000 })
    cy.visitPageAssertion()

    // creating a new pipeline
    cy.get('input[name="name"]').should('be.visible').type('test-pipeline').should('have.value', 'test-pipeline')
    cy.get('[class*=bp3-dialog]').within(() => {
      cy.get('button[type="submit"]').click()
    })
    cy.get('span[icon="plus"]').click({ force: true })
    cy.get('[data-testid="stage-Deployment"]').should('be.visible').click()
    cy.get('input[name="name"]').should('be.visible').type('deploy').should('have.value', 'deploy')
    cy.contains('span', 'Set Up Stage').click()
    // adding a new service
    cy.visitPageAssertion('#aboutService')
    cy.wait('@servicesListCall')
    cy.contains('span', 'New Service').should('be.visible').click()
    cy.get('input[name="name"]').should('be.visible').type('testService').should('have.value', 'testService')
    cy.get('button[data-id="service-save"]').click()
    cy.wait(2000)
    cy.get('span[data-icon="azurewebapp"]').click()
    cy.findByDisplayValue('AzureWebApp').should('be.checked')
    cy.wait('@azureYamlSnippet')

    // adding a startup command
    cy.contains('span', 'Add Startup Command').should('be.visible').click()
    cy.contains('p', 'Startup Command File Source').should('be.visible')
    cy.get('span[data-icon="service-github"]').click()
    cy.wait(500)
    cy.get('[data-testid="cr-field-connectorRef"]').should('be.visible').click()
    cy.contains('p', 'Create or Select an Existing Connector').should('be.visible')
    cy.contains('p', 'NewGitTestConn1').click()
    cy.findByRole('button', { name: 'Apply Selected' }).should('be.visible')
    cy.findByRole('button', { name: 'Apply Selected' }).click()
    cy.get('[class*=StepWizard--stepDetails]').within(() => {
      cy.contains('span', 'Continue').click()
    })
    // runtime validations
    cy.wait(1000)
    cy.contains('span', 'Submit').click()
    cy.contains('span', 'Branch Name is required').should('be.visible')
    cy.contains('span', 'Script File Path is required').should('be.visible')
    // entering values and submitting the form
    cy.get('input[name="branch"]').should('be.visible').type('branch-1').should('have.value', 'branch-1')
    cy.get('input[name="paths"]').should('be.visible').type('path-1').should('have.value', 'path-1')
    cy.get('[class*=StepWizard--stepDetails]').within(() => {
      cy.contains('span', 'Submit').click()
    })
    cy.get('span[data-icon="service-github"]').should('be.visible')
    cy.wait(2000)
    cy.contains('span', 'Continue').click({ force: true })
    cy.wait(1000)
    // creating a new environment
    cy.wait('@environmentListCall')

    cy.contains('span', 'Environment').should('be.visible')
    cy.contains('span', 'New Environment').should('be.visible').click()
    cy.get('input[name="name"]')
      .should('be.visible', { timeout: 2000 })
      .type('testEnvConfig')
      .should('have.value', 'testEnvConfig')
    cy.contains('p', 'Production').click()
    cy.get('[class*=bp3-dialog]').within(() => {
      cy.contains('span', 'Save').click()
    })
    cy.wait('@environmentCreationCall')
    // creating a new infrastructure
    cy.wait(500)
    cy.get('span[data-icon="fixed-input"]').should('have.length', 4).as('multiSelectButtons')
    cy.get('@multiSelectButtons').each(multiSelectButton => {
      cy.wrap(multiSelectButton).click()
      cy.get('a.bp3-menu-item').should('have.length', 3).as('valueList')
      cy.get('@valueList').eq(0).should('contain.text', 'Fixed value').as('fixedValue')
      cy.get('@valueList').eq(1).should('contain.text', 'Runtime input').as('runtimeValue')
      cy.get('@valueList').eq(2).should('contain.text', 'Expression').as('expressionValue')
      cy.get('@runtimeValue').click()
      cy.wait(500)
    })

    cy.wait(1000)
    // yaml validations
    yamlValidations('<+input>', '<+input>')
  })
})
