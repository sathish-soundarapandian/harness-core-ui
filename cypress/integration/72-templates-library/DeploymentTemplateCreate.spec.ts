/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { templatesListRoute, gitSyncEnabledCall, featureFlagsCall } from '../../support/70-pipeline/constants'
import {
  incompleteTemplateCreationResponse,
  stepTemplateListCallAfterSelectionResponse,
  deploymentTemplateInputCallAfterSelectionResponse
} from '../../support/72-templates-library/constants'

describe('Deployment Template creation and assertion', () => {
  const templateCreationCall =
    '/template/api/templates?accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&comments='
  const templatesListCall =
    '/template/api/templates/list?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&templateListType=Stable&searchTerm=&page=0&size=20&includeAllTemplatesAvailableAtScope=true'
  const templateListCallAfterSelection =
    '/template/api/templates/list?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&module=cd&templateListType=All'
  const templateInputsCallAfterSelection =
    '/template/api/templates/templateInputs/testStepTemplate_Cypress?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&versionLabel=212&getDefaultFromOtherRepo=true'
  const connectorsListCall =
    '/ng/api/connectors/listV2?accountIdentifier=accountId&searchTerm=&projectIdentifier=project1&orgIdentifier=default&pageIndex=0&pageSize=10'
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
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
      }).as('enableFeatureFlag')
      cy.intercept('POST', templatesListCall, { fixture: '/ng/api/deploymentTemplate/stepTemplateList' }).as(
        'stepTemplateListCallDeploymentTemplates'
      )

      cy.initializeRoute()
    })
  })
  it('asserting error when creating a deployment template', () => {
    cy.visit(templatesListRoute, {
      timeout: 30000
    })
    cy.intercept('POST', templateCreationCall, incompleteTemplateCreationResponse).as('templateCreation')
    cy.intercept('POST', templateListCallAfterSelection, stepTemplateListCallAfterSelectionResponse).as('stepListCall')
    cy.intercept('GET', templateInputsCallAfterSelection, deploymentTemplateInputCallAfterSelectionResponse).as(
      'Step Template Input'
    )
    cy.intercept('POST', connectorsListCall, { fixture: 'ng/api/connectors' })
    cy.visitPageAssertion('[class*=TemplatesPage-module_templatesPageBody]')

    cy.contains('span', 'New Template').click()
    cy.get('.bp3-menu').within(() => {
      cy.contains('p', 'Deployment').click({ force: true })
    })

    cy.contains('p', 'Create New Deployment Template').should('be.visible')
    cy.contains('p', 'DEPLOYMENT').should('be.visible') //
    //clicking "Start" without entering version label assertion
    cy.get('button[type="submit"]').click()
    cy.contains('span', 'Version Label is required').should('be.visible') //

    cy.get('input[name="name"]').clear().type('deploymentTemplate_cypress')
    cy.get('input[name="versionLabel"]').clear().type('1122')
    cy.get('button[type="submit"]').click()

    //Infrastructure Tab View
    cy.contains('p', 'Variables').should('be.visible')
    cy.contains('p', 'Fetch Instance Script').should('be.visible')
    cy.contains('p', 'Instance Object Array Path').should('be.visible')
    cy.contains('p', 'Instance Attributes').should('be.visible')
    cy.contains('span', 'Define the variables to be used in your infrastructure').should('be.visible')

    //adding String variable
    cy.contains('span', 'New Variable').should('be.visible')
    cy.contains('span', 'New Variable').click()
    cy.get('input[name="name"]').clear().type('var1')
    cy.get('button[data-testid="addVariableSave"]').click()

    cy.get('span[data-icon="fixed-input"]').click()
    cy.contains('span', 'Fixed value').should('be.visible')
    cy.contains('span', 'Runtime input').should('be.visible')
    cy.contains('span', 'Runtime input').click()

    //adding Connector Variable
    cy.contains('span', 'New Variable').click()
    cy.get('input[name="name"]').clear().type('connnectorVar')
    cy.get('textarea[name="description"]').clear().type('this is description')
    cy.get('input[type="text"][name="type"]').click()
    cy.get('.bp3-menu').within(() => {
      cy.contains('p', 'Connector').should('be.visible')
      cy.contains('p', 'Connector').click()
    })
    cy.get('button[data-testid="addVariableSave"]').click()
    cy.contains('p', 'this is description').should('be.visible')
    cy.contains('span', 'Select Connector').should('be.visible')
    cy.contains('span', 'Select Connector').click()
    cy.contains('span', 'New Connector').click()

    cy.contains('h2', 'Connectors').should('be.visible')
    cy.contains('p', 'Connectors').isChildVisible()
    cy.contains('div', 'Cloud Providers').should('be.visible')
    cy.contains('div', 'Artifact Repositories').should('be.visible')
    cy.contains('div', 'Code Repositories').should('be.visible')
    cy.contains('div', 'Ticketing Systems').should('be.visible')
    cy.contains('div', 'Monitoring and Logging Systems').should('be.visible')
    cy.contains('div', 'Secret Managers').scrollIntoView().should('be.visible')
    cy.get('span[icon="cross"]').should('be.visible').click()

    cy.contains('p', 'test1111').should('be.visible')
    cy.contains('p', 'test1111').click()
    cy.contains('span', 'Apply Selected').click()
    cy.contains('p', 'test1111').should('be.visible')
    //
    cy.get('input[name="fetchInstancesScript.store.type"]').click({ force: true })
    cy.contains('p', 'Inline').isChildVisible()
    cy.contains('p', 'File Store').isChildVisible()

    cy.get('div[class="view-line"]').should('be.visible')
    cy.get('div[class="view-line"]').type('echo "Hello"')

    cy.contains('span', 'New Attribute').should('be.visible')
    cy.get('input[name="instancesListPath"]').type('root/bin/')
    cy.get('input[name="instanceAttributes[0].description"]').type('for hosting')
    cy.get('input[name="instanceAttributes[0].jsonPath"]').type('jsonPath1')

    cy.contains('span', 'Execution').click()

    // Execution Tab View
    cy.contains('span', 'Previous').click()
    cy.contains('span', 'Continue').click()

    cy.get('span[icon="plus"]').click()
    cy.get('span[data-icon="template-library"]').eq(1).click()
    cy.wait(500)
    cy.get('p[data-testid="testStepTemplate_Cypress"]').click()
    cy.wait(500)
    cy.contains('p', 'testStepTemplate_Cypress (212)').should('be.visible')
    cy.contains('p', 'HTTP Step').should('be.visible')
    cy.contains('span', 'Use Template').click()

    cy.contains('p', 'testStepTemplate_Cypress').should('be.visible')

    cy.get('[data-name="toggle-option-two"]').click({ force: true })
    //YAML view
    cy.contains('span', 'deploymentTemplate_cypress.yaml').should('be.visible')
    cy.contains('div', 'Unsaved changes').should('be.visible')
    cy.get('div[class="view-lines"]').within(() => {
      cy.get('span').filter(`:contains('deploymentTemplate_cypress')`).should('have.length', 4)
      cy.contains('span', 'CustomDeployment').should('be.visible')
      cy.contains('span', 'var1').should('be.visible')
      cy.contains('span', 'echo "Hello"').should('be.visible')
      cy.contains('span', 'jsonPath1').should('be.visible')
      cy.contains('span', 'for hosting').should('be.visible')
      cy.contains('span', 'root/bin/').should('be.visible')
      cy.contains('span', 'testStepTemplate_Cypress').should('be.visible')
      cy.contains('span', 'infrastructure').should('be.visible')
      cy.contains('span', 'fetchInstancesScript').should('be.visible')
      cy.contains('span', 'instanceAttributes').should('be.visible')
      cy.contains('span', 'stepTemplateRefs').should('be.visible')
      cy.contains('span', 'jsonPath').should('be.visible')
      cy.contains('span', 'instancesListPath').should('be.visible')
      cy.contains('span', 'connnectorVar').should('be.visible')
      cy.contains('span', 'test1111').should('be.visible')
      cy.contains('span', 'this is description').should('be.visible')
    })

    cy.get('span[data-icon="send-data"]').click()
    cy.clickSubmit()
    cy.contains('span', 'yamlNode provided doesn not have root yaml field: pipeline').should('be.visible') //
  })
})
