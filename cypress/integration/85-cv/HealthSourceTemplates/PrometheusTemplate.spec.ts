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
  labelNamesAPI,
  labelNamesResponse,
  metricListAPI,
  metricListResponse,
  sampleDataAPI,
  sampleDataResponse,
  metricPackAPI,
  metricPackResponse
} from '../../../support/85-cv/monitoredService/health-sources/Prometheus/constant'
import { errorResponse } from '../../../support/85-cv/slos/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Health Source - Prometheus', () => {
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
    cy.intercept(
      'GET',
      '/cv/api/monitored-service/count-of-services?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1',
      { allServicesCount: 1, servicesAtRiskCount: 0 }
    )
    cy.visitSRMTemplate()
  })

  it('should be able to create template with two metrics having all fixed values', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('Prometheus Template', '1')
    cy.setServiceEnvRuntime()

    cy.populateDefineHealthSource(Connectors.PROMETHEUS, 'prometheus-sale', 'Prometheus')

    cy.get('input[name="product"]').should('be.disabled')

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.get('input[name="metricName"]').should('contain.value', 'Prometheus Metric')

    cy.findByRole('button', { name: /Submit/i }).click()
    cy.contains('span', 'Group Name is required.').should('be.visible')
    cy.addingGroupName('Group 1')
    cy.get('input[name="groupName"]').should('contain.value', 'Group 1')
    cy.contains('span', 'Group Name is required.').should('not.exist')

    cy.findByRole('button', { name: /Fetch records/i }).should('be.disabled')
    cy.get('div[class="view-lines"]').type(`classes	{}`)
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
    cy.findByRole('button', { name: /Submit/i }).click()
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
    cy.contains('li', 'Group 1').click()

    cy.get('div[class="view-lines"]').type(`classes	{}`)

    cy.contains('div', 'Assign').click()
    cy.get('input[name="sli"]').click({ force: true })

    cy.findByRole('button', { name: /Submit/i }).click({ force: true })
    // Creating the template.
    cy.findByText('Save').click()
    // Saving modal.
    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })

  it('should be able to create template with two metrics having all runtime values', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('Prometheus Template', '1')
    cy.setServiceEnvRuntime()

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', labelNamesAPI, labelNamesResponse)
    cy.intercept('GET', metricListAPI, metricListResponse)

    cy.populateDefineHealthSource(Connectors.PROMETHEUS, '', 'Prometheus')
    cy.setConnectorRuntime()

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.get('input[name="metricName"]').should('contain.value', 'Prometheus Metric')

    cy.findByRole('button', { name: /Submit/i }).click()
    cy.contains('span', 'Group Name is required.').should('be.visible')
    cy.addingGroupName('Group 1')
    cy.get('input[name="groupName"]').should('contain.value', 'Group 1')
    cy.contains('span', 'Group Name is required.').should('not.exist')

    cy.get('input[name="query"]').should('have.value', '<+input>')
    cy.contains('span', 'Query is required.').should('not.exist')

    cy.contains('p', 'Runtime inputs will be required to verify your configurations').should('be.visible')

    cy.contains('div', 'Assign').click()
    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[name="serviceInstance"]').should('have.value', '<+input>')
    cy.get('input[value="Errors/ERROR"]').click({ force: true })
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })
    cy.findByRole('button', { name: /Submit/i }).click()
    // Creating the template.
    cy.findByText('Save').click()
    // Saving modal.
    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })
})
