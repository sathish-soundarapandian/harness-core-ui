/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  labelNamesAPI,
  labelNamesResponse,
  metricListAPI,
  metricListResponse,
  sampleDataAPI,
  sampleDataResponse,
  metricPackAPI,
  metricPackResponse,
  monitoredService,
  labelValuesAPI,
  monitoredServiceForBuildQuery
} from '../../../support/85-cv/monitoredService/health-sources/Prometheus/constant'
import { errorResponse } from '../../../support/85-cv/slos/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Health Source - Prometheus', () => {
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

  it('should be able to add Prometheus Health Source with manual query', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.PROMETHEUS, 'prometheus-sale', 'Prometheus')

    cy.get('input[name="product"]').should('be.disabled')

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.get('input[name="metricName"]').should('contain.value', 'Prometheus Metric')
    cy.get('input[name="metricName"]').clear()

    cy.contains('span', 'Metric Name is required.').should('be.visible')
    cy.fillField('metricName', 'Prometheus Metric')
    cy.contains('span', 'Metric Name is required.').should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()
    cy.contains('span', 'Group Name is required.').should('be.visible')
    cy.addingGroupName('Group 1')
    cy.get('input[name="groupName"]').should('contain.value', 'Group 1')
    cy.contains('span', 'Group Name is required.').should('not.exist')

    cy.contains('div', 'Build your Query').should('be.visible')
    cy.get('button span[data-icon="Edit"]').click()
    cy.contains('p', 'Query Builder will not be available').should('be.visible')
    cy.findByRole('button', { name: /Proceed to Edit/i }).click()

    cy.contains('p', 'Query Builder will not be available since this mapping contains a manually edited query.').should(
      'be.visible'
    )
    cy.contains('div', 'Build your Query').should('not.exist')

    cy.get('textarea[name="query"]').focus().blur()
    cy.contains('span', 'Query is required.').should('be.visible')
    cy.findByRole('button', { name: /Fetch records/i }).should('be.disabled')
    cy.get('textarea[name="query"]').type(`classes	{}`)
    cy.contains('span', 'Query is required.').should('not.exist')

    cy.contains('p', 'Submit query to see records from Prometheus').should('be.visible')

    cy.intercept('GET', sampleDataAPI, errorResponse)

    cy.findByRole('button', { name: /Fetch records/i }).click()

    cy.contains('p', 'We cannot perform your request at the moment. Please try again.').should('exist')

    cy.intercept('GET', sampleDataAPI, { statusCode: 200, body: {} })

    cy.findByRole('button', { name: /Retry/i }).click()

    cy.contains('p', 'No records for provided query').should('be.visible')

    cy.intercept('GET', sampleDataAPI, sampleDataResponse)

    cy.findByRole('button', { name: /Fetch records/i }).click()

    cy.contains('div', 'Assign').click()
    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('span', 'One selection is required.').should('be.visible')
    cy.get('input[name="sli"]').click({ force: true })
    cy.contains('span', 'One selection is required.').should('not.exist')

    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[name="healthScore"]').click({ force: true })

    cy.contains('span', 'Risk Category is required.').should('exist')
    cy.contains('label', 'Errors').click()
    cy.contains('span', 'Risk Category is required.').should('not.exist')

    cy.contains('span', 'Deviation Compared to Baseline is required.').should('exist')
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })
    cy.contains('span', 'Deviation Compared to Baseline is required.').should('not.exist')

    cy.get('input[name="serviceInstance"]').click()
    cy.contains('p', '__name__').click()

    cy.findByRole('button', { name: /Add Metric/i }).click()

    cy.contains('div', 'Map Metric(s) to Harness Services').click()

    cy.fillField('metricName', 'Prometheus Metric')

    cy.contains('span', 'Metric name must be unique.').should('be.visible')
    cy.fillField('metricName', 'Prometheus Metric 123')
    cy.contains('span', 'Metric name must be unique.').should('not.exist')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', 'Group 1').click()

    cy.get('button span[data-icon="Edit"]').click()
    cy.contains('p', 'Query Builder will not be available').should('be.visible')
    cy.findByRole('button', { name: /Proceed to Edit/i }).click()
    cy.get('textarea[name="query"]').type(`classes	{}`)

    cy.contains('div', 'Assign').click()
    cy.get('input[name="sli"]').click({ force: true })

    cy.findByRole('button', { name: /Submit/i }).click({ force: true })
  })

  it('should be able to edit an existing Prometheus health source of manual query', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', monitoredService)

    cy.wait(2000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.contains('div', 'Prometheus').click()

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.findByRole('button', { name: /Next/i }).click()
    cy.findByRole('button', { name: /Submit/i }).click()
    cy.findByRole('button', { name: /Save/i }).click()
    cy.contains('span', 'Monitored Service updated').should('be.visible')
  })

  it('should be able to add Prometheus HS by building a query', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.PROMETHEUS, 'prometheus-sale', 'Prometheus')

    cy.get('input[name="product"]').should('be.disabled')

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.addingGroupName('Group 1')
    cy.get('input[name="groupName"]').should('contain.value', 'Group 1')

    cy.contains('div', 'Build your Query').should('be.visible')
    cy.get('button span[data-icon="Edit"]').click()
    cy.contains('p', 'Query Builder will not be available').should('be.visible')
    cy.findByRole('button', { name: /Proceed to Edit/i }).click()

    cy.contains('p', 'Query Builder will not be available since this mapping contains a manually edited query.').should(
      'be.visible'
    )
    cy.contains('div', 'Build your Query').should('not.exist')

    cy.contains('p', 'Undo manual query selection').click()

    cy.contains('div', 'Build your Query').should('be.visible')
    cy.contains('div', 'Build your Query').click()

    cy.intercept('GET', sampleDataAPI, sampleDataResponse)

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('span', 'Prometheus Metric is required.').should('be.visible')
    cy.get('input[name="prometheusMetric"]').click({ force: true })
    cy.contains('p', 'classes').click()
    cy.contains('span', 'Prometheus Metric is required.').should('not.exist')

    cy.intercept('GET', labelValuesAPI, metricListResponse)

    cy.contains('span', 'Filter on Environment is required.').should('be.visible')
    cy.get('input[name="envFilter"]').click({ force: true })
    cy.contains('p', '__name__').click()
    cy.contains('p', 'classes').click()
    cy.contains('span', 'Filter on Environment').click()
    cy.contains('span', 'Filter on Environment is required.').should('not.exist')

    cy.wait(1000)

    cy.contains('span', 'Filter on Service required.').should('be.visible')
    cy.get('input[name="serviceFilter"]').click({ force: true })
    cy.contains('p', 'generation').click()
    cy.contains('p', 'classes_loaded').click()
    cy.contains('span', 'Filter on Service').click()
    cy.contains('span', 'Filter on Service required.').should('not.exist')

    cy.wait(1000)

    cy.get('input[name="additionalFilter"]').click({ force: true })
    cy.contains('p', 'group').click()
    cy.contains('p', 'classes_unloaded').click()
    cy.contains('span', 'Additional Filter').click()

    cy.get('input[name="aggregator"]').click({ force: true })
    cy.contains('p', 'avg (calculate the average over dimensions)').click()

    cy.contains('div', 'Assign').click()
    cy.get('input[name="sli"]').click({ force: true })

    cy.findByRole('button', { name: /Submit/i }).click()
    cy.findByRole('button', { name: /Save/i }).click()
    cy.contains('span', 'Monitored Service created').should('be.visible')
  })

  it('should be able to edit an existing Prometheus health source of Build query', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', monitoredServiceForBuildQuery)

    cy.wait(2000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.contains('div', 'Prometheus').click()

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)
    cy.intercept('GET', sampleDataAPI, sampleDataResponse)

    cy.findByRole('button', { name: /Next/i }).click()
    cy.findByRole('button', { name: /Submit/i }).click()
    cy.findByRole('button', { name: /Save/i }).click()
    cy.contains('span', 'Monitored Service updated').should('be.visible')
  })
})
