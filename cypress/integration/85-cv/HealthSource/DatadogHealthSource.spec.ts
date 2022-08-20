/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  connectorIdentifier,
  dataLogsIndexes,
  datadogLogsSample,
  dashboards,
  metricTags,
  dataDogMonitoredService,
  metrics,
  activeMetrics,
  dashboardDetails,
  selectedDashboardName,
  datadogLogsMonitoredService,
  getActiveMetricWithFilter
} from '../../../support/85-cv/monitoredService/health-sources/Datadog/constants'
import { errorResponse } from '../../../support/85-cv/slos/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Configure Datadog health source', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false
    })
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept(
      'GET',
      '/cv/api/monitored-service/count-of-services?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1',
      { allServicesCount: 1, servicesAtRiskCount: 0 }
    )
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('Add new Datadog metric health source for a monitored service ', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()

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

    // Triggering validations.
    cy.findByRole('button', { name: /Submit/i }).click()

    cy.wait('@getMetrics')
    cy.wait('@getActiveMetrics')

    // Check for form validations
    cy.contains('span', 'Group Name is required.').should('be.visible')
    cy.contains('span', 'Metric is required.').should('be.visible')
    cy.contains('span', 'One selection is required.').should('be.visible')

    // Adding group name
    cy.addingGroupName('group-1')

    // Selecting metric name
    cy.get('input[name="metric"]').click()
    cy.get('.Select--menuItem').click()

    // Fetching metric tags
    cy.wait('@getMetricsTags')

    // map metric to services
    cy.mapMetricToServices(true)

    // Creating the monitored service with Datadog health source.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('Add new Datadog logs health source for a monitored service ', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
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

    cy.fillField('query', 'source:browser')
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

    // Creating the monitored service with Datadog health source.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('should be able to edit the existing Datadog Logs health source', () => {
    //intercepting calls
    cy.intercept('GET', dataLogsIndexes.getDatadogLogsIndexes, dataLogsIndexes.getDatadogLogsIndexesResponse).as(
      'getLogsIndexes'
    )
    cy.intercept('POST', datadogLogsSample.getDatadogLogsSample, datadogLogsSample.getDatadogLogsSampleResponse).as(
      'getLogsSample'
    )
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', datadogLogsMonitoredService).as(
      'monitoredServiceCall'
    )

    cy.wait(1000)
    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()
    cy.wait('@monitoredServiceCall')

    cy.contains('div', 'DD Logs').click({ force: true })

    cy.contains('span', 'Next').click()
    cy.contains('span', 'Name your Query').should('be.visible')
    cy.wait('@getLogsSample')
    cy.wait('@getLogsIndexes')

    // Updating query name
    cy.get('input[name="metricName"]').type('Data logs query updated')

    // Updating service identifier
    cy.get('input[name="serviceInstanceIdentifierTag"]').click()
    cy.contains('p', 'host').click()
    cy.findByRole('button', { name: /Submit/i }).click()

    // Saving the monitored service with updated Datadog health source.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service updated').should('be.visible')
  })

  it('should be able to create Datadog Health Source with existing dashboard', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
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
    cy.contains('p', selectedDashboardName).click()

    //intercepting calls
    cy.intercept('GET', metrics.getMetricsCall, metrics.getMetricsResponse).as('getMetrics')
    cy.intercept('GET', metricTags.getMetricsTags, metricTags.getMetricsTagsResponse).as('getMetricsTags')
    cy.intercept('GET', activeMetrics.getActiveMetrics, activeMetrics.getActiveMetricsResponse).as('getActiveMetrics')
    cy.intercept('GET', dashboardDetails.getDashboardDetails, dashboardDetails.getDashboardDetailsResponse).as(
      'getDashboardDetails'
    )

    cy.findAllByRole('button', { name: /Next/i }).last().click()

    cy.wait('@getMetrics')
    cy.wait('@getActiveMetrics')
    cy.wait('@getDashboardDetails')
    cy.contains('h3', 'Query Specifications').should('be.visible')

    cy.wait('@getMetricsTags')

    // map metric to services
    cy.mapMetricToServices(true)

    // Creating the monitored service with Datadog health source.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('should be able to edit an existing Data dog health source', () => {
    const searchTerm = 'docker'
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', dataDogMonitoredService)
    cy.wait(1000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()
    cy.contains('div', 'DD new').click()

    //intercepting calls
    const filterURL = getActiveMetricWithFilter(searchTerm)
    cy.intercept('GET', dashboards.dashboardsAPI, dashboards.dashboardsResponse).as('dashboardsResponse')
    cy.intercept('GET', metricTags.getMetricsTags, metricTags.getMetricsTagsResponse).as('getMetricsTags')
    cy.intercept('GET', filterURL, activeMetrics.getActiveMetricsFilteredResponse).as('getMetricsTagsFiltered')

    cy.findByRole('button', { name: /Next/i }).click()

    cy.wait('@dashboardsResponse')
    cy.findAllByRole('button', { name: /Next/i }).last().click()
    cy.wait('@getMetricsTags')

    // search is triggered on typing
    cy.get('input[name="metric"]').type(searchTerm)
    cy.wait('@getMetricsTagsFiltered')
    cy.contains('p', 'docker.cpu.usage').click()

    //updating metric name and triggering submit
    cy.fillField('metricName', 'Datadog Metric updated')
    cy.findByRole('button', { name: /Submit/i }).click()

    // Updating the monitored service with Datadog health source.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service updated').should('be.visible')
  })
})

describe('Datadog metric thresholds', () => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'CVNG_METRIC_THRESHOLD',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })

    cy.on('uncaught:exception', () => {
      return false
    })
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept(
      'GET',
      '/cv/api/monitored-service/count-of-services?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1',
      { allServicesCount: 1, servicesAtRiskCount: 0 }
    )
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('should render metric thresholds only if any group is created', () => {
    //intercepting calls
    cy.intercept('GET', dataLogsIndexes.getDatadogLogsIndexes, dataLogsIndexes.getDatadogLogsIndexesResponse).as(
      'getLogsIndexes'
    )
    cy.intercept('POST', datadogLogsSample.getDatadogLogsSample, datadogLogsSample.getDatadogLogsSampleResponse).as(
      'getLogsSample'
    )
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', datadogLogsMonitoredService).as(
      'monitoredServiceCall'
    )

    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.DATADOG, connectorIdentifier, 'Data dog')

    // selecting feature
    cy.selectFeature('Cloud Metrics')

    cy.intercept('GET', dashboards.dashboardsAPI, dashboards.dashboardsResponse).as('dashboardsResponse')

    cy.contains('span', 'Next').click()

    cy.wait('@dashboardsResponse')
    cy.contains('p', selectedDashboardName).click()

    //intercepting calls
    cy.intercept('GET', metrics.getMetricsCall, metrics.getMetricsResponse).as('getMetrics')
    cy.intercept('GET', metricTags.getMetricsTags, metricTags.getMetricsTagsResponse).as('getMetricsTags')
    cy.intercept('GET', activeMetrics.getActiveMetrics, activeMetrics.getActiveMetricsResponse).as('getActiveMetrics')
    cy.intercept('GET', dashboardDetails.getDashboardDetails, dashboardDetails.getDashboardDetailsResponse).as(
      'getDashboardDetails'
    )

    cy.findAllByRole('button', { name: /Next/i }).last().click()
    cy.get('input[name="metricName"]').clear()

    cy.fillField('metricName', 'Prometheus Metric')

    cy.contains('.Accordion--label', 'Advanced (Optional)').scrollIntoView().should('exist')
  })

  it.only('should render metric thresholds and perform its features', () => {
    //intercepting calls
    cy.intercept('GET', dataLogsIndexes.getDatadogLogsIndexes, dataLogsIndexes.getDatadogLogsIndexesResponse).as(
      'getLogsIndexes'
    )
    cy.intercept('POST', datadogLogsSample.getDatadogLogsSample, datadogLogsSample.getDatadogLogsSampleResponse).as(
      'getLogsSample'
    )
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', datadogLogsMonitoredService).as(
      'monitoredServiceCall'
    )
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.DATADOG, connectorIdentifier, 'Data dog')

    // selecting feature
    cy.selectFeature('Cloud Metrics')

    cy.intercept('GET', dashboards.dashboardsAPI, dashboards.dashboardsResponse).as('dashboardsResponse')

    cy.contains('span', 'Next').click()

    cy.wait('@dashboardsResponse')
    cy.contains('p', selectedDashboardName).click()

    //intercepting calls
    cy.intercept('GET', metrics.getMetricsCall, metrics.getMetricsResponse).as('getMetrics')
    cy.intercept('GET', metricTags.getMetricsTags, metricTags.getMetricsTagsResponse).as('getMetricsTags')
    cy.intercept('GET', activeMetrics.getActiveMetrics, activeMetrics.getActiveMetricsResponse).as('getActiveMetrics')
    cy.intercept('GET', dashboardDetails.getDashboardDetails, dashboardDetails.getDashboardDetailsResponse).as(
      'getDashboardDetails'
    )

    cy.findAllByRole('button', { name: /Next/i }).last().click()

    cy.fillField('metricName', 'Datadog Metric')

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')

    cy.findByTestId('AddThresholdButton').click()

    cy.contains('div', 'Ignore Thresholds (1)').should('exist')

    cy.get("input[name='ignoreThresholds.0.metricType']").should('be.disabled')
    cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Custom')

    // validations
    cy.findByRole('button', { name: /Submit/i }).click()
    cy.findByText('Metric name is required').should('be.visible')
    cy.findAllByText('Required').should('have.length', 2)

    cy.get("input[name='ignoreThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'Datadog Metric')

    cy.get('.Select--menuItem:nth-child(1)').click()

    // testing criteria

    cy.get("input[name='ignoreThresholds.0.criteria.type']").should('have.value', 'Absolute Value')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('exist')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('exist')

    // greater than should be smaller than lesser than value
    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").type('12')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('1')

    cy.get("input[name='ignoreThresholds.0.criteria.type']").click()
    cy.contains('p', 'Percentage Deviation').click()

    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('exist')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('not.exist')

    cy.get("input[name='ignoreThresholds.0.criteria.criteriaPercentageType']").click()
    cy.contains('p', 'Lesser than').click()

    cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('not.exist')
    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('exist')

    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('12')

    // Fail fast thresholds
    cy.contains('div', 'Fail-Fast Thresholds (0)').click()

    cy.findByTestId('AddThresholdButton').click()

    cy.get("input[name='failFastThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'Datadog Metric')

    cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('be.disabled')

    cy.get("input[name='failFastThresholds.0.spec.action']").click()
    cy.contains('p', 'Fail after multiple occurrences').click()
    cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('not.be.disabled')
    cy.get("input[name='failFastThresholds.0.spec.spec.count']").type('4')

    cy.get("input[name='failFastThresholds.0.criteria.spec.greaterThan']").type('21')
    cy.get("input[name='failFastThresholds.0.criteria.spec.lessThan']").type('78')
  })
})
