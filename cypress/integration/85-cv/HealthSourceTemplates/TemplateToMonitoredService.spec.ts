/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  validations,
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse,
  environmentResponse,
  servicesResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  metricPackCall,
  metricPackResponse,
  metricStructureCall,
  metricStructureResponse
} from '../../../support/85-cv/monitoredService/health-sources/AppDynamics/constants'
import {
  RuntimeValue,
  HealthSourceDetails,
  templateListValue,
  yamlTemplate,
  saveTemplateCall,
  templateListCall,
  templateDataCall,
  templateInputSetCall,
  servicesCallV1,
  environmentsV1
} from '../../../support/85-cv/Templates/constants'

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
    cy.intercept(
      'POST',
      'template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&getDefaultFromOtherRepo=true',
      {
        fixture: 'cv/templates/healthsourceTemplate'
      }
    ).as('applyTemplates')
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitSRMTemplate()
  })

  it.skip('Add new AppDynamics monitored service with custom metric and all Runtime values and use it to create Monitored Service', () => {
    // Template Creation
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails(HealthSourceDetails.template.name, HealthSourceDetails.template.version)
    // set rutime
    cy.setServiceEnvRuntime()
    // For AppD HealthSource
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    // Fill Define HealthSource Tab with AppDynamics
    cy.populateDefineHealthSource(HealthSourceDetails.connector, '', HealthSourceDetails.name)
    cy.setConnectorRuntime()
    cy.contains('span', 'Next').click({ force: true })
    cy.wait('@MetricPackCall')

    cy.get('input[name="appdApplication"]').should('have.value', RuntimeValue)
    cy.get('input[name="appDTier"]').should('have.value', RuntimeValue)
    cy.contains('span', 'Add Metric').click()
    cy.contains('div', 'Assign').click({ force: true })

    // Custom validation
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.groupName).should('be.visible')
    cy.contains('span', validations.assign).scrollIntoView().should('be.visible')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type(HealthSourceDetails.group)
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })
    cy.get('input[name="completeMetricPath"]').should('have.value', RuntimeValue)

    cy.get('input[name="sli"]').click({ force: true })
    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[name="serviceInstanceMetricPath"]').should('have.value', RuntimeValue)
    cy.get('input[value="Errors/ERROR"]').click({ force: true })
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    // reopen healthsource and verify values persist
    cy.contains('div[class="TableV2--cell"]', HealthSourceDetails.name).click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({})

    cy.get('[data-testid="appDTier"] input').should('have.value', RuntimeValue)
    cy.get('[data-testid="appdApplication"] input').should('have.value', RuntimeValue)
    cy.get('input[name="groupName"]').should('have.value', HealthSourceDetails.group)
    cy.get('input[name="metricName"]').should('have.value', HealthSourceDetails.metricName)
    cy.get('input[name="completeMetricPath"]').should('have.value', RuntimeValue)
    cy.contains('div', 'Assign').click({ force: true })
    cy.get('input[name="serviceInstanceMetricPath"]').should('have.value', RuntimeValue)
    cy.get('input[value="Errors/ERROR"]').should('be.checked')
    cy.get('input[name="higherBaselineDeviation"]').should('be.checked')
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the template.
    cy.findByText('Save').click()
    // Saving modal.
    cy.intercept('POST', saveTemplateCall).as('saveTemplate')
    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()
    cy.wait('@saveTemplate').then(data => {
      // match the payload to verify we submit correct payload
      expect(yamlTemplate.toString()).equal(data.request.body.toString())
    })
    cy.findByText('Template published successfully').should('be.visible')
    cy.intercept('POST', templateListCall, templateListValue).as('templatesListCall')
    cy.wait(2000)
    cy.contains('div', 'Unsaved changes').should('be.visible')
    cy.contains('p', 'Templates').click()
    cy.get('.bp3-dialog')
      .findByRole('button', { name: /Confirm/i })
      .click()
    cy.findByText('AppD Template').should('be.visible')

    // MS Creation Using Template
    cy.contains('p', 'Monitored Services').click({ force: true })
    cy.wait(1000)
    cy.intercept('POST', templateListCall, { fixture: 'cv/templates/drawerTemplateList' }).as('listIndv')
    cy.contains('span', 'Use template').click({ force: true })
    cy.wait('@listIndv')
    cy.wait(1000)
    cy.intercept('GET', templateDataCall, { fixture: 'cv/templates/templateData' }).as('templateData')
    cy.intercept('GET', templateInputSetCall, { fixture: 'cv/templates/templateInputs' }).as('templateInputs')
    cy.contains('[data-testid="AppD_Template"]', 'AppD Template').click()
    cy.get('[data-tooltip-id="serviceSelectOrCreate"]').should('be.visible')
    cy.get('[data-tooltip-id="environmentSelectOrCreate"]').should('be.visible')
    cy.get('[name="service"]').should('have.value', RuntimeValue)
    cy.get('[name="environmentRef"]').should('have.value', RuntimeValue)
    cy.findAllByRole('row').should('have.length', 2)
    cy.get('[name="sources.healthSources.0.spec.connectorRef"]').should('have.value', RuntimeValue)
    cy.get('[name="sources.healthSources.0.spec.tierName"]').should('have.value', RuntimeValue)
    cy.get('[name="sources.healthSources.0.spec.applicationName"]').should('have.value', RuntimeValue)
    cy.get('[name="sources.healthSources.0.spec.metricDefinitions.0.completeMetricPath"]').should(
      'have.value',
      RuntimeValue
    )
    cy.get(
      '[name="sources.healthSources.0.spec.metricDefinitions.0.analysis.deploymentVerification.serviceInstanceMetricPath"]'
    ).should('have.value', RuntimeValue)
    cy.intercept('GET', servicesCallV1, servicesResponse).as('ServiceCall')
    cy.intercept('GET', environmentsV1, environmentResponse).as('EnvCall')
    cy.contains('span', 'Use Template').click()
    cy.get('input[name="service"]').click()
    cy.contains('p', 'Service 101').click({ force: true })
    cy.get('input[name="environment"]').click()
    cy.contains('p', 'QA').click({ force: true })

    cy.get('button[data-testid="cr-field-sources.healthSources.0.spec.connectorRef"]').click()
    cy.contains('p', 'appdtest').click()
    cy.contains('span', 'Apply Selected').click()
    cy.get('[name="sources.healthSources.0.spec.applicationName"]').type('cv-app')
    cy.get('[name="sources.healthSources.0.spec.tierName"]').type('docker-tier')
    cy.get('[name="sources.healthSources.0.spec.metricDefinitions.0.completeMetricPath"]').type(
      'Overall Application Performance | docker-tier | Calls per Minute'
    )
    cy.get(
      '[name="sources.healthSources.0.spec.metricDefinitions.0.analysis.deploymentVerification.serviceInstanceMetricPath"]'
    ).type('host')
    cy.contains('span', 'Submit').click()
    cy.findByText('Monitored Service created').should('be.visible')
  })
})
