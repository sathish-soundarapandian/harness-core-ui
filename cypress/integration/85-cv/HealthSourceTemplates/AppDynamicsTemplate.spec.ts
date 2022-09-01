/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { templatesListCall } from '../../../support/70-pipeline/constants'
import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  applicationCall,
  applicationsResponse,
  metricPackCall,
  metricPackResponse,
  tiersCall,
  tiersResponse,
  basePathCall,
  basePathResponse,
  metricStructureCall,
  metricStructureResponse
} from '../../../support/85-cv/monitoredService/health-sources/AppDynamics/constants'
import { variablesResponse, variablesResponseWithAppDVariable } from '../../../support/85-cv/Templates/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Create empty monitored service', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false
    })
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'CVNG_TEMPLATE_MONITORED_SERVICE',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.intercept('POST', templatesListCall, { fixture: 'template/api/templatesList' }).as('templatesListCall')
    cy.visitSRMTemplate()
  })

  it('Add new AppDynamics monitored service with fixed and expression value', () => {
    const applyTemplateCall = '/template/api/templates/applyTemplates?*'
    cy.intercept('POST', applyTemplateCall, { fixture: 'cv/templates/emptyTemplate' }).as('applyTemplates')
    cy.intercept('POST', '/template/api/templates/variables?*', variablesResponse).as('VariablesCall1')

    cy.populateTemplateDetails('AppD Template', '1')

    // set rutime
    cy.setServiceEnvRuntime()

    // Toggle to variable view
    cy.contains('span', 'Variables').click()
    cy.wait(2000)
    cy.contains('span', 'Add Variable').click()
    cy.fillName('AppDApplication')
    cy.findByTestId('addVariableSave').click()
    cy.get('[name="variables[0].value"]').type('cv-app')
    cy.intercept('POST', '/template/api/templates/variables?*', variablesResponseWithAppDVariable).as('VariablesCall2')
    cy.intercept('POST', applyTemplateCall, { fixture: 'cv/templates/variableTemplate' }).as('applyTemplates')
    cy.contains('span', 'Apply Changes').click()
    cy.wait(1000)

    // verify variable was added
    cy.contains('span', 'Variables').click()
    cy.contains('span', 'AppDApplication').should('be.visible')
    cy.contains('span', 'Apply Changes').click()
    cy.wait(1000)

    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, 'appdtest', 'AppD')

    cy.contains('span', 'Next').click({ force: true })

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="metricData.Errors"]').should('be.checked')
    cy.get('input[name="metricData.Performance"]').should('be.checked')

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', 'Please select applications').should('be.visible')

    cy.get('input[name="metricData.Errors"]').uncheck({ force: true })
    cy.get('input[name="metricData.Performance"]').uncheck({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Plese select metric packs').should('be.visible')
    cy.get('input[name="metricData.Errors"]').check({ force: true })
    cy.get('input[name="metricData.Performance"]').check({ force: true })
    cy.contains('span', 'Plese select metric packs').should('not.exist')

    cy.get('div[data-testid="appdApplication"] span[data-icon="fixed-input"]').should('be.visible').click()
    cy.get('a.bp3-menu-item').should('have.length', 3).as('valueList')
    cy.get('@valueList').eq(0).should('contain.text', 'Fixed value').as('fixedValue')
    cy.get('@valueList').eq(1).should('contain.text', 'Runtime input').as('runtimeValue')
    cy.get('@valueList').eq(2).should('contain.text', 'Expression').as('expressionValue')
    cy.get('@expressionValue').click()
    cy.get('input[name="appdApplication"]').type('<+AppDApplication')
    cy.contains('mark', 'AppDApplication').click({ force: true })

    // Validation
    cy.contains('span', 'Please select applications').should('not.exist')
    cy.get('input[name="appDTier"]').should('have.value', '<+input>')

    cy.get('div[data-testid="appDTier"] span[data-icon="runtime-input"]').should('be.visible').click()
    cy.get('a.bp3-menu-item').should('have.length', 2).as('valueList')
    cy.get('@valueList').eq(0).should('contain.text', 'Runtime input').as('runtimeValue')
    cy.get('@valueList').eq(1).should('contain.text', 'Expression').as('expressionValue')

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div[class="TableV2--cell"]', 'AppD').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    cy.get('div[data-testid="appDTier"] input').should('have.value', '<+input>')
    cy.get('div[data-testid="appdApplication"] input').should(
      'have.value',
      '<+monitoredService.variables.AppDApplication>'
    )

    cy.contains('span', 'Add Metric').click()
    cy.contains('div', 'Assign').click({ force: true })

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })
    cy.get('span[data-icon="fixed-input"]').last().should('be.visible').click()
    cy.get('a.bp3-menu-item').should('have.length', 3).as('valueList')
    cy.get('@valueList').eq(0).should('contain.text', 'Fixed value').as('fixedValue')
    cy.get('@valueList').eq(1).should('contain.text', 'Runtime input').as('runtimeValue')
    cy.get('@valueList').eq(2).should('contain.text', 'Expression').as('expressionValue')
    cy.get('@runtimeValue').click()

    cy.get('input[name="sli"]').click({ force: true })
    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[name="serviceInstanceMetricPath"]').scrollIntoView().should('have.value', '<+input>')
    cy.get('input[value="Errors/ERROR"]').click({ force: true })
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    // Creating the template.
    cy.findByRole('button', { name: /Save/i }).click()
    // Saving modal.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })

  it('Add new AppDynamics monitored service with fixed value', () => {
    cy.populateTemplateDetails('AppD Template', '1')
    // set rutime
    cy.setServiceEnvRuntime()

    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, 'appdtest', 'AppD')

    cy.contains('span', 'Next').click({ force: true })

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="metricData.Errors"]').should('be.checked')
    cy.get('input[name="metricData.Performance"]').should('be.checked')

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', 'Please select applications').should('be.visible')

    cy.get('input[name="metricData.Errors"]').uncheck({ force: true })
    cy.get('input[name="metricData.Performance"]').uncheck({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Plese select metric packs').should('be.visible')
    cy.get('input[name="metricData.Errors"]').check({ force: true })
    cy.get('input[name="metricData.Performance"]').check({ force: true })
    cy.contains('span', 'Plese select metric packs').should('not.exist')

    cy.get('div[data-testid="appdApplication"] input').click()
    cy.get('.bp3-popover-content').within(() => {
      cy.contains('li', 'cv-app').click({ force: true })
    })

    // Validation
    cy.contains('span', 'Please select applications').should('not.exist')
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Please select tier').should('be.visible')

    cy.wait('@TierCall')

    cy.get('div[data-testid="appDTier"] input').click()
    cy.get('.bp3-popover-content').within(() => {
      cy.contains('li', 'docker-tier').click({ force: true })
    })

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div[class="TableV2--cell"]', 'AppD').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    cy.get('div[data-testid="appDTier"] input').should('have.value', 'docker-tier')
    cy.get('div[data-testid="appdApplication"] input').should('have.value', 'cv-app')
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the template.
    cy.findByRole('button', { name: /Save/i }).click()
    // Saving modal.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })

  it('Add new AppDynamics monitored service with custom metric', () => {
    cy.populateTemplateDetails('AppD Template', '1')
    cy.setServiceEnvRuntime()

    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, 'appdtest', 'AppD')
    cy.contains('span', 'Next').click({ force: true })

    // Fill Customise HealthSource Tab for AppDynamics
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')

    cy.get('div[data-testid="appdApplication"] input').click()
    cy.get('.bp3-popover-content').within(() => {
      cy.contains('li', 'cv-app').click({ force: true })
    })

    cy.wait('@TierCall')

    cy.get('div[data-testid="appDTier"] input').click()
    cy.get('.bp3-popover-content').within(() => {
      cy.contains('li', 'docker-tier').click({ force: true })
    })

    // Adding custom metric should make metric pack optional
    cy.get('input[name="metricData.Errors"]').uncheck({ force: true })
    cy.get('input[name="metricData.Performance"]').uncheck({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Plese select metric packs').should('be.visible')
    cy.contains('span', 'Add Metric').click()
    cy.contains('span', 'Plese select metric packs').should('not.exist')

    cy.contains('div', 'Assign').click({ force: true })

    // Custom validation
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Group Name is required').should('be.visible')
    cy.contains('span', 'Please provide complete metric path').scrollIntoView().should('be.visible')
    cy.contains('span', 'One selection is required.').scrollIntoView().should('be.visible')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.get('input[name="completeMetricPath"]').type(
      'Overall Application Performance | incorrect-tier | Calls per Minute'
    )
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Path should have Tier as well').should('be.visible')
    cy.get('input[name="completeMetricPath"]')
      .clear()
      .type('Overall Application Performance | docker-tier | Calls per Minute')

    cy.get('input[name="sli"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div[class="TableV2--cell"]', 'AppD').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({})

    cy.get('div[data-testid="appDTier"] input').should('have.value', 'docker-tier')
    cy.get('div[data-testid="appdApplication"] input').should('have.value', 'cv-app')
    cy.get('input[name="groupName"]').should('have.value', 'group 1')
    cy.get('input[name="metricName"]').should('have.value', 'appdMetric')
    cy.get('input[name="completeMetricPath"]').should(
      'have.value',
      'Overall Application Performance | docker-tier | Calls per Minute'
    )
    cy.contains('span', 'Submit').click({ force: true })
    // Creating the template.
    cy.findByRole('button', { name: /Save/i }).click()
    // Saving modal.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })

  it('Add new AppDynamics monitored service with custom metric and all Runtime values', () => {
    cy.populateTemplateDetails('AppD Template', '1')
    // set rutime
    cy.setServiceEnvRuntime()

    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(Connectors.APP_DYNAMICS, '', 'AppD')
    cy.setConnectorRuntime()
    cy.contains('span', 'Next').click({ force: true })
    cy.wait('@MetricPackCall')

    cy.get('input[name="appdApplication"]').should('have.value', '<+input>')
    cy.get('input[name="appDTier"]').should('have.value', '<+input>')

    cy.contains('span', 'Add Metric').click()
    cy.contains('div', 'Assign').click({ force: true })

    // Custom validation
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Group Name is required').should('be.visible')
    cy.contains('span', 'Please provide complete metric path').scrollIntoView().should('be.visible')
    cy.contains('span', 'One selection is required.').scrollIntoView().should('be.visible')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })
    cy.get('span[data-icon="fixed-input"]').last().should('be.visible').click()
    cy.get('a.bp3-menu-item').should('have.length', 3).as('valueList')
    cy.get('@valueList').eq(0).should('contain.text', 'Fixed value').as('fixedValue')
    cy.get('@valueList').eq(1).should('contain.text', 'Runtime input').as('runtimeValue')
    cy.get('@valueList').eq(2).should('contain.text', 'Expression').as('expressionValue')
    cy.get('@runtimeValue').click()

    cy.get('input[name="sli"]').click({ force: true })
    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[name="serviceInstanceMetricPath"]').should('have.value', '<+input>')
    cy.get('input[value="Errors/ERROR"]').click({ force: true })
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div[class="TableV2--cell"]', 'AppD').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({})

    cy.get('div[data-testid="appDTier"] input').should('have.value', '<+input>')
    cy.get('div[data-testid="appdApplication"] input').should('have.value', '<+input>')
    cy.get('input[name="groupName"]').should('have.value', 'group 1')
    cy.get('input[name="metricName"]').should('have.value', 'appdMetric')
    cy.get('input[name="completeMetricPath"]').should('have.value', '<+input>')
    cy.contains('div', 'Assign').click({ force: true })
    cy.get('input[name="serviceInstanceMetricPath"]').should('have.value', '<+input>')
    cy.get('input[value="Errors/ERROR"]').should('be.checked')
    cy.get('input[name="higherBaselineDeviation"]').should('be.checked')
    cy.contains('span', 'Submit').click({ force: true })
    // Creating the template.
    cy.findByRole('button', { name: /Save/i }).click()
    // Saving modal.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })
})
