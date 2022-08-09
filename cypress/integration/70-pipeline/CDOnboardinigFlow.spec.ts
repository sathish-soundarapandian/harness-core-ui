import { addConnector, delegatesInfo, delegatesList } from '../../support/35-connectors/constants'
import {
  cdFailureStrategiesYaml,
  featureFlagsCall,
  gitSyncEnabledCall,
  serviceCreationCall
} from '../../support/70-pipeline/constants'
import {
  environmentSaveCall,
  infrastructureDefinitionSaveCall,
  listAllReposByConnector,
  pipelineCreationCall,
  projectDashboardRoute,
  trialConnectorCall
} from '../../support/75-cd/constants'

const onboardingPipelineRoute =
  '/pipeline/api/pipelines/Repo1_1658954822540?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
const fetchPipelineRoute =
  '/pipeline/api/pipelines/list?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&module=cd&size=1'

const fillManifestDetails = (): void => {
  cy.fillField('identifier', 'manifestName')
  cy.fillField('branch', 'branchName')
  cy.fillField('paths[0].path', 'file1.path')
  cy.get('label[for="valuesPaths"]')
    .should('be.visible')
    .parent()
    .within(() => {
      cy.contains('span', 'Add File').should('be.visible').click()
      cy.fillField('valuesPaths[0].path', 'value1.path')
    })
}

describe('CD Onboarding Flow', () => {
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
            name: 'CD_ONBOARDING_ENABLED',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })

    cy.intercept('POST', fetchPipelineRoute, { fixture: 'pipeline/api/cdOnboarding/emptyPipelinesList' }).as(
      'emptyPipelineList'
    )
    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.intercept('GET', cdFailureStrategiesYaml, {
      fixture: 'pipeline/api/pipelines/failureStrategiesYaml'
    }).as('cdFailureStrategiesYaml')
    cy.intercept('POST', serviceCreationCall, { fixture: 'ng/api/servicesV2/servicesUpdate.json' }).as(
      'serviceCreationCall'
    )
    cy.intercept('PUT', serviceCreationCall, { fixture: 'ng/api/servicesV2/serviceWithManifest.json' }).as(
      'serviceUpdateCall'
    )
    cy.intercept('POST', trialConnectorCall, {
      fixture: 'pipeline/api/cdOnboarding/trialConnectorCall'
    }).as('trialConnectorCall')

    cy.intercept('GET', listAllReposByConnector, { fixture: 'pipeline/api/cdOnboarding/listAllReposByConnector' }).as(
      'listAllReposByConnector'
    )
    cy.intercept('GET', delegatesList, { fixture: 'pipeline/api/connector/delegatesList.json' }).as('delegatesList')
    cy.intercept('GET', delegatesInfo, { fixture: 'pipeline/api/connector/delegatesInfo.json' }).as('delegatesInfo')
    cy.intercept('POST', addConnector, { fixture: 'pipeline/api/cdOnboarding/addSampleK8Connector.json' }).as(
      'addConnector'
    )
    cy.intercept('POST', environmentSaveCall, {
      fixture: 'pipeline/api/cdOnboarding/environmentIdentifierSaveCall'
    }).as('environmentCreationCall')
    cy.intercept('POST', infrastructureDefinitionSaveCall, {
      fixture: 'pipeline/api/cdOnboarding/infrastructureDefinitionSaveCall'
    }).as('infrastructureDefinitionSaveCall')
    cy.intercept('POST', pipelineCreationCall, { fixture: 'pipeline/api/cdOnboarding/pipelineCreationCall' }).as(
      'pipelineCreationCall'
    )
    cy.intercept('GET', onboardingPipelineRoute, { fixture: 'pipeline/api/cdOnboarding/onboardingPipeline' }).as(
      'onboardingPipeline'
    )
    cy.initializeRoute()
    cy.visit(projectDashboardRoute, {
      timeout: 30000
    })
    cy.wait('@emptyPipelineList', { timeout: 30000 })
  })

  it('Navbar should have Getting Started for cd onobarding', () => {
    cy.get('[class^=SideNav-module_main]')
      .should('be.visible')
      .within(() => {
        cy.contains('p', 'Get Started').should('be.visible').click()
      })
    cy.contains('span', 'Get Started').should('be.visible').click()

    // Workload section
    cy.contains('span', 'Next: Configure Repository').should('be.visible').parent().should('have.attr', 'disabled')
    cy.get('[class*="DeployProvisioningWizard-module_main"]')
      .should('be.visible')
      .within(() => {
        cy.contains('p', 'Service').should('be.visible').click()
        cy.contains('p', 'Kubernetes').should('be.visible').click()
        cy.get('input[value="sample_service"]').should('be.visible')
        cy.fillField('serviceRef', 'test_service')
        cy.get('input[value="test_service"]').should('be.visible')
      })
    cy.contains('span', 'Next: Configure Repository').click()
    cy.wait('@serviceCreationCall')

    // Artifact Section
    cy.get('[class*="DeployProvisioningWizard-module_main"]')
      .should('be.visible')
      .within(() => {
        cy.contains('p', 'In Manifest').should('be.visible').click()
        cy.wait(500)
        // Code Repository
        cy.get('[data-testid="codeRepo-panel"]').should('be.visible').click()
        cy.get('[data-testid="codeRepo-details"]').should('be.visible').click()
        cy.contains('p', 'Bitbucket').should('be.visible')
        cy.contains('p', 'GitLab').should('be.visible')
        cy.contains('p', 'GitHub').should('be.visible').click()
        cy.contains('span', 'Access Token').should('be.visible').click()
        cy.fillField('accessToken', 'accessToken')
        cy.contains('span', 'Test Connection').should('be.visible').click()
        cy.wait('@trialConnectorCall')
        cy.contains('p', 'Connection Successful').should('be.visible')
        // Select Repository
        cy.get('[data-testid="selectYourRepo-panel"]').should('be.visible').click()
        cy.get('[data-testid="selectYourRepo-details"]').should('be.visible').click()
        cy.wait('@listAllReposByConnector')
        cy.contains('p', 'defaultProject/Repo1').should('be.visible').click()
        // Manifest Details
        cy.get('[data-testid="provideManifest-summary"]').should('be.visible').click()
        cy.get('[data-testid="provideManifest-details"]').should('be.visible').click()
        fillManifestDetails()
      })
    cy.contains('span', 'Configure Infra').click()
    cy.wait('@serviceUpdateCall')

    cy.get('[class*="DeployProvisioningWizard-module_main"]')
      .should('be.visible')
      .within(() => {
        cy.contains('p', 'Kubernetes').should('be.visible').click()
        cy.get('input[value="sample_environment"]').should('be.visible')
        cy.get('input[value="sample_infrastructure"]').should('be.visible')
        cy.fillField('namespace', 'namespace')
        cy.get('input[value="namespace"]').should('be.visible')
        cy.get('[data-testid="authMethod-panel"]').should('be.visible').click()
        cy.get('[data-testid="authMethod-details"]').should('be.visible').click()
        cy.fillField('connectorName', 'connectorName')
        cy.get('input[value="connectorName"]').should('be.visible')
        cy.contains('span', 'Use from a specific harness Delegate').should('be.visible').click()
        cy.get('input[value="DelegateOptions.DelegateOptionsSelective"]').should('have.attr', 'checked')
        cy.get('input[placeholder="Select or Enter Delegates"]').clear().type('temp-delegate-pr')
        cy.contains('div', 'temp-delegate-pr').click({ force: true })
        cy.contains('p', 'temp-delegate-pr').click({ force: true })
        cy.contains('span', 'Test Connection').should('be.visible').click({ force: true })
        cy.wait('@addConnector')
      })
    cy.contains('span', 'Next: Create a Pipeline').click()
    cy.wait('@environmentCreationCall')
    cy.wait('@infrastructureDefinitionSaveCall')

    cy.contains('span', 'Successfully created Infrastructure')
    cy.contains('span', 'Environment created successfully')

    cy.wait('@onboardingPipeline', { timeout: 30000 })

    // YAML assertions for steps
    cy.get('[data-name="toggle-option-two"]').click()
    cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '25%', { ensureScrollable: false })
    cy.contains('span', 'ShellScript').should('be.visible')
    cy.contains('span', 'Echo Welcome Message').should('be.visible')
    cy.contains('span', 'Welcome to Harness CD').should('be.visible')
    cy.contains('span', 'K8sRollingRollback').should('be.visible')
    cy.contains('span', 'Rolling Rollback').should('be.visible')
  })
})
