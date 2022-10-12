import { pageHeaderClassName, featureFlagsCall } from '../../support/70-pipeline/constants'
import { environmentConfigurationRoute, environmentConfigurationCall } from '../../support/75-cd/constants'
import {
  infraCall,
  selectInfraCall,
  validateInfraDtYamlCall,
  getUpdatedYamlCall,
  deploymentTemplatesListCall,
  useTemplateCall,
  useTemplateResponse,
  afterUseTemplateListCall,
  afterUseTemplateListResponse,
  getUpdatedYamlResponse,
  validateInfraDtYamlResponse,
  selectInfraResponse,
  infraResponse,
  depTempTestVariables
} from '../../support/72-templates-library/constants'

describe('Deployment Template - Infrastructures Page', () => {
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
          },
          {
            uuid: null,
            name: 'NG_DEPLOYMENT_TEMPLATE',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })

    cy.initializeRoute()
    cy.visit(environmentConfigurationRoute, {
      timeout: 30000
    })
  })
  it('Creating Infrastructure using Deployment Template', () => {
    cy.intercept('GET', environmentConfigurationCall, {
      fixture: 'ng/api/environmentConfiguration/environmentConfiguration.json'
    })

    cy.intercept('POST', deploymentTemplatesListCall, { fixture: '/ng/api/deploymentTemplateList' }).as('templateList')
    cy.intercept('GET', useTemplateCall, useTemplateResponse).as('useTemplate')
    cy.intercept('POST', afterUseTemplateListCall, afterUseTemplateListResponse).as('afterUseTemplateList')

    cy.visitPageAssertion(pageHeaderClassName)
    cy.contains('div', 'Infrastructure Definitions').click({ force: true })
    cy.contains('span', 'Infrastructure Definition').click()
    cy.fillField('name', 'testInfra_Cypress')
    cy.contains('p', 'Deployment Template').click()
    cy.contains('p', 'dep temp test').click()
    cy.contains('p', 'Id: dep_temp_test').click()
    cy.contains('p', 'DEPLOYMENT').click()

    cy.contains('span', 'Use Template').click()
    cy.contains('p', 'Using Template: dep temp test (1)').click()
    cy.get('span[icon="more"]').should('be.visible').click()
    cy.contains('p', 'Change Template').should('be.visible')
    cy.contains('p', 'Preview Template YAML').should('be.visible')
    cy.contains('p', 'Open Template in new tab').should('be.visible')

    cy.contains('p', 'Infrastructure Properties').should('be.visible')
    cy.contains('p', 'Update values for variables defined as part of used template').should('be.visible')

    depTempTestVariables.forEach(item => {
      cy.get(`input[value=${item}]`).scrollIntoView().should('be.visible')
    })
    cy.contains('span', 'Save').should('be.visible').click()
    cy.contains('span', 'Successfully created Infrastructure').should('be.visible')
  })

  it('Asserting Reconcile feature', () => {
    cy.intercept('GET', environmentConfigurationCall, {
      fixture: 'ng/api/environmentConfiguration/environmentConfiguration.json'
    })

    cy.intercept('GET', infraCall, infraResponse).as('infra')
    cy.wait(3000)
    cy.intercept('GET', selectInfraCall, selectInfraResponse).as('selectInfra')
    cy.intercept('GET', validateInfraDtYamlCall, validateInfraDtYamlResponse).as('validateInfraDT')
    cy.intercept('POST', getUpdatedYamlCall, getUpdatedYamlResponse).as('updatedYaml')
    cy.visitPageAssertion(pageHeaderClassName)
    cy.contains('div', 'Infrastructure Definitions').click({ force: true })
    cy.contains('p', 'testReconcileInfra').click()

    cy.get('span[icon="warning-sign"]').should('be.visible')
    cy.contains('p', 'Some template(s) referenced in this infrastructure have been updated.').should('be.visible')

    cy.get('[value="stringUpdated"]').should('not.exist')
    cy.get('[value="Hi, I am Updated"]').should('not.exist')
    cy.contains('h3', 'Edit Infrastructure').should('be.visible')
    cy.contains('span', 'Reconcile').should('be.visible').click()
    cy.contains('p', 'Original').should('be.visible')
    cy.contains('p', 'Refreshed').should('be.visible')
    cy.contains('p', 'Template Error Inspection').should('be.visible')
    cy.contains('span', 'Hi, I am Updated').should('be.visible')
    cy.contains('span', 'Update').should('be.visible').click()

    cy.get('[value="stringUpdated"]').scrollIntoView().should('be.visible')
    cy.get('[value="Hi, I am Updated"]').scrollIntoView().should('be.visible')
    cy.contains('span', 'Save').should('be.visible').click()
    cy.contains('span', 'Successfully updated Infrastructure').should('be.visible')
  })
})
