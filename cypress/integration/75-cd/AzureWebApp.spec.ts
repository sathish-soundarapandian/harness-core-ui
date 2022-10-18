import {
  gitSyncEnabledCall,
  newPipelineRoute,
  postServiceCall,
  cdFailureStrategiesYaml,
  azureStrategiesYamlSnippets,
  featureFlagsCall
} from '../../support/70-pipeline/constants'
import { environmentFetchCall, environmentSaveCall } from '../../support/75-cd/constants'

describe('Azure web app end to end test', () => {
  const serviceV2AzureWebApp = `/ng/api/servicesV2/list/access?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&type=AzureWebApp&gitOpsEnabled=false`
  const environmentCall = `/ng/api/environmentsV2/upsert?routingId=accountId&accountIdentifier=accountId`
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'NG_SVC_ENV_REDESIGN',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
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
    cy.intercept('GET', serviceV2AzureWebApp, { fixture: 'pipeline/api/services/serviceV2' }).as('servicesV2Call')
    cy.intercept('PUT', environmentCall, {
      fixture: 'ng/api/SshWinRM/envUpsertCall.json'
    }).as('envUpsertCall')
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
    cy.contains('p', 'Azure Web Apps').click()
    cy.contains('span', 'Set Up Stage').click()
    // adding a new service
    cy.wait('@servicesV2Call')
    cy.contains('span', 'New Service').should('be.visible').click()
    cy.get('input[name="name"]').should('be.visible').type('testService').should('have.value', 'testService')

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
    //save services
    cy.get('[class*="Dialog--children"] > div:nth-child(2) > button:nth-child(1)').contains('Save').click()

    cy.wait(1000)
    //Add Environment
    cy.contains('Continue').click()
    cy.get('#add-new-environment').click()

    cy.contains('New Environment').should('be.visible')
    cy.get('[placeholder="Enter Name"]').fillName('testCypress_Env')
    cy.contains('Pre-Production').click()
    cy.clickSubmit()
    cy.wait('@envUpsertCall')
    cy.wait(1000)

    // creating a new infrastructure
    cy.wait(500)
    cy.get('label[for="infrastructureRef"] + div[class="bp3-form-content"] span[data-icon="fixed-input"]')
      .should('be.visible')
      .click()
    cy.get('span[class="MultiTypeInput--menuItemLabel"]').contains('Runtime input').click()

    cy.wait(1000)
    // yaml validations
    yamlValidations('<+input>', '<+input>')
  })
})
