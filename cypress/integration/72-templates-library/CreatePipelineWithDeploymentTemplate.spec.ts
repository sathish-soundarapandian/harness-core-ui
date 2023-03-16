/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  gitSyncEnabledCall,
  pipelinesRoute,
  featureFlagsCall,
  cdFailureStrategiesYaml,
  pipelineVariablesCall
} from '../../support/70-pipeline/constants'
import {
  useTemplateCall,
  selectedDeploymentTemplateDetailsCall,
  deploymentTemplateInputsCall,
  afterUseTemplateServiceV2Call,
  failureCall,
  serviceYamlDataCall,
  environmentListCall,
  pipelineMadeFromTemplate,
  deploymentTemplateDetailsResponse,
  deploymentTemplateInputsResponse,
  useTemplateResponse,
  afterUseTemplateServiceV2Response,
  failureResponse,
  serviceYamlDataResponse,
  recentDeploymentTemplatesUrl
} from '../../support/72-templates-library/constants'

describe('Pipeline Template creation and assertion', { scrollBehavior: false }, () => {
  beforeEach(() => {
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
          },
          {
            uuid: null,
            name: 'USE_OLD_GIT_SYNC',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      }).as('enableFeatureFlag')
      cy.initializeRoute()
      cy.visit(pipelinesRoute, {
        timeout: 30000
      })
    })
    cy.intercept('GET', cdFailureStrategiesYaml, { fixture: 'pipeline/api/pipelines/failureStrategiesYaml' }).as(
      'cdFailureStrategiesYaml'
    )
  })

  it.skip('Pipeline With Deployment Template', () => {
    cy.intercept('POST', recentDeploymentTemplatesUrl, {
      fixture: '/ng/api/deploymentTemplate/recentDeploymentTemplates'
    }).as('recentDeploymentTemplates')
    cy.intercept('POST', selectedDeploymentTemplateDetailsCall, deploymentTemplateDetailsResponse).as('templateDetails')
    cy.intercept('GET', deploymentTemplateInputsCall, deploymentTemplateInputsResponse).as('templateInputs')
    cy.intercept('GET', useTemplateCall, useTemplateResponse).as('useTemplate')
    cy.intercept('GET', afterUseTemplateServiceV2Call, afterUseTemplateServiceV2Response).as(
      'afterUseTemplateServiceV2'
    )
    cy.intercept('POST', environmentListCall, { fixture: '/ng/api/environments/environmentListUpdate.json' })
    cy.intercept('POST', serviceYamlDataCall, serviceYamlDataResponse).as('serviceYaml')
    cy.intercept('GET', failureCall, failureResponse).as('failureStrategy')

    cy.visitPageAssertion('[class*="PipelineListPage-module_pageBody"]')

    cy.get('div[class*="PageSubHeader--container"]').within(() => {
      cy.contains('span', 'Create a Pipeline').should('be.visible').click()
    })
    cy.contains('span', 'Start with Template').should('be.visible')
    cy.clickSubmit()
    cy.contains('span', 'Pipeline Name is a required field').should('be.visible')
    cy.fillField('name', pipelineMadeFromTemplate)
    cy.clickSubmit()

    cy.get('span[icon="plus"]').click()
    cy.get('div[class^="AddStageView"]').within(() => {
      cy.get('span[data-icon="cd-main"]').click()
    })
    cy.fillField('name', 'testStage_Cypress')
    cy.wait('@recentDeploymentTemplates')

    // selecting the recent deployment template
    cy.get('input[value="dep_temp_test"]').click({ force: true })

    // assertions for elements inside the template select right drawer
    cy.get('[data-template-id="dep_temp_test"]').should('be.visible')
    cy.contains('p', 'dep temp test').should('be.visible')
    cy.contains('p', 'dep temp test (1)').should('be.visible')
    cy.contains('p', 'Type').should('be.visible')
    cy.contains('p', 'Tags').should('be.visible')
    cy.contains('p', 'Description').should('be.visible')
    cy.contains('p', 'Version Label').should('be.visible')
    cy.contains('p', 'stringRuntime').should('be.visible')
    cy.contains('p', 'secretRuntime').should('be.visible')
    cy.contains('p', 'numberRuntime').should('be.visible')
    cy.contains('p', 'connectorRuntime').should('be.visible')

    cy.contains('span', 'Use Template').click()

    cy.contains('p', 'Using Template: dep temp test (1)').should('be.visible')

    cy.contains('span', 'Set Up Stage').click()

    cy.contains('p', 'testStage_Cypress').should('be.visible')
    cy.contains('div', 'Pipeline Studio').should('be.visible')
    cy.contains('a', 'Pipeline Studio').should('be.visible')
    cy.contains('p', pipelineMadeFromTemplate).should('be.visible')

    cy.get('div[class="bp3-spinner"]', { timeout: 6000 }).should('not.exist')

    cy.get('input[name="service"]', { timeout: 10000 }).should('be.visible').click()
    cy.contains('p', 'testService1').should('be.visible').click() // selecting service from service dropdown
    cy.get('input[value="testService1"]').should('be.visible') // asserting service name inside input tag of service
    cy.contains('p', 'testService1').should('be.visible') // asserting service name in the modal created after service selection
    cy.intercept(pipelineVariablesCall).as('pipelineVariables')
    cy.wait('@pipelineVariables', { timeout: 6000 })
    cy.get('div[role="tablist"]').within(() => {
      cy.contains('span', 'Service', { timeout: 4000 }).should('be.visible').and('have.attr', 'data-completed', 'true')
    })
    cy.contains('Continue').click()
    cy.get('input[name="environment.environmentRef"]', { timeout: 10000 }).should(
      'not.have.attr',
      'placeholder',
      'Loading...'
    )

    cy.get('input[name="environment.environmentRef"]').click()
    cy.contains('p', 'New testEnv').should('be.visible').click()
    cy.wait(500)
    cy.get('span[data-icon="fixed-input"]').eq(1).click({ force: true })
    cy.contains('span', 'Fixed value').should('be.visible')
    cy.contains('span', 'Runtime input').should('be.visible').click()

    cy.contains('span', 'Execution').click()
    cy.contains('p', 'Fetch Instances').should('be.visible')

    cy.contains('div', 'Unsaved changes')
      .should('be.visible')
      .parent()
      .within(() => {
        cy.findByText('Save').click({ force: true })
      })
    cy.contains(
      'span',
      'Invalid yaml: $.pipeline.stages[0].stage.spec.execution: is missing but it is required'
    ).should('be.visible')
  })
})
