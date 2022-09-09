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
  connectorIdentifier,
  dataLogsIndexes,
  datadogLogsSample,
  dashboards,
  metricTags,
  metrics,
  activeMetrics
} from '../../../support/85-cv/monitoredService/health-sources/Datadog/constants'
import { errorResponse } from '../../../support/85-cv/slos/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Configure Datadog health source', () => {
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

  it('Add new Datadog metric health source for a monitored service ', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('Datadog Template', '1')
    // set rutime
    cy.setServiceEnvRuntime()

    cy.populateDefineHealthSource(Connectors.DATADOG, connectorIdentifier, 'Data dog')

    // selecting feature
    cy.selectFeature('Cloud Metrics')

    cy.intercept('GET', dashboards.dashboardsAPI, errorResponse).as('dashboardsErrorResponse')

    cy.contains('span', 'Next').click()

    cy.wait('@dashboardsErrorResponse')
    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('be.visible')

    cy.intercept('GET', dashboards.dashboardsAPI, dashboards.dashboardsResponse).as('dashboardsResponse')

    cy.findByRole('button', { name: /Retry/i }).click()

    cy.wait('@dashboardsResponse')
    cy.contains('p', '+ Manually input query').click()

    cy.contains('h4', 'Add your Datadog query').should('be.visible')
    cy.fillField('metricName', 'Datadog Metric')

    //intercepting calls
    cy.intercept('GET', metrics.getMetricsCall, metrics.getMetricsResponse).as('getMetrics')
    cy.intercept('GET', metricTags.getMetricsTags, metricTags.getMetricsTagsResponse).as('getMetricsTags')
    cy.intercept('GET', activeMetrics.getActiveMetrics, activeMetrics.getActiveMetricsResponse).as('getActiveMetrics')

    cy.findByRole('button', { name: /Submit/i }).click()
    cy.contains('h3', 'Query Specifications').should('be.visible')

    cy.wait('@getMetrics')
    cy.wait('@getActiveMetrics')

    // Triggering validations.
    cy.findByRole('button', { name: /Submit/i }).click()
    cy.wait(1000)
    // Check for form validations
    cy.contains('span', 'Group Name is required.').should('be.visible')
    cy.contains('span', 'Metric is required.').should('be.visible')
    cy.contains('span', 'One selection is required.').should('be.visible')

    // Adding group name
    cy.addingGroupName('group-1')

    // Selecting metric name
    cy.get('input[name="metric"]').should('be.disabled')
    cy.get('[data-id="metric-2"] input').should('be.disabled')
    cy.get('[data-id="aggregator-3"] input').should('be.disabled')
    cy.get('[data-id="metricTags-4"] input').should('be.disabled')
    cy.get('div[class="view-lines"]').type('datadog.agent.python.version{*}.rollup(avg, 60)')
    cy.contains('span', 'Fetch records').click()
    cy.wait(1000)
    cy.mapMetricToServices(true)
    cy.contains('span', 'Fetch records').click()
    // Creating the monitored service with Datadog health source.
    cy.findByRole('button', { name: /Submit/i }).click()
  })

  it('Add new Datadog logs health source for a monitored service ', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('Datadog Template', '1')
    // set rutime
    cy.setServiceEnvRuntime()
    cy.populateDefineHealthSource(Connectors.DATADOG, connectorIdentifier, 'Data dog')

    //intercepting calls
    cy.intercept('GET', dataLogsIndexes.getDatadogLogsIndexes, dataLogsIndexes.getDatadogLogsIndexesResponse).as(
      'getLogsIndexes'
    )
    cy.intercept('POST', datadogLogsSample.getDatadogLogsSample, datadogLogsSample.getDatadogLogsSampleResponse).as(
      'getLogsSample'
    )

    // selecting feature
    cy.selectFeature('Cloud Logs')

    // Navigation to configure Datadog logs
    cy.contains('span', 'Next').click()
    cy.contains('span', 'Name your Query').should('be.visible')
    cy.wait('@getLogsIndexes')

    //triggering validations
    cy.findByRole('button', { name: /Submit/i }).click()
    cy.contains('span', 'Query is required.').should('be.visible')
    cy.contains('span', 'Service Instance is required.').should('be.visible')
    cy.contains('p', 'Submit query to see records from Datadog Logs').should('be.visible')

    cy.get('div[class="view-lines"]').type('source:browser')
    cy.contains('span', 'Query is required.').should('not.exist')

    //Fetching records
    cy.contains('span', 'Fetch records').click()
    cy.wait('@getLogsSample')
    cy.contains('p', 'Submit query to see records from Datadog Logs').should('not.exist')

    // Configuring remaining fieds
    cy.get('input[name="indexes"]').click()
    cy.contains('p', 'main').click()
    cy.get('input[name="serviceInstanceIdentifierTag"]').click()
    cy.contains('p', 'source').click()
    cy.findByRole('button', { name: /Submit/i }).click()

    // Creating the template.
    cy.findByRole('button', { name: /Save/i }).click()
    // Saving modal.
    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })
})
