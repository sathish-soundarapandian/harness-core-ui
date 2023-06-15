/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse,
  riskCategoryMock
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
import { riskCategoryCall } from '../../../support/85-cv/monitoredService/health-sources/CloudWatch/constants'
import {
  sampleRawRecordsMock,
  sampleRecordsApiCall
} from '../../../support/85-cv/monitoredService/health-sources/SumoLogic/constant'
import { Connectors } from '../../../utils/connctors-utils'

describe('Create empty monitored service', () => {
  beforeEach(() => {
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('SumoLogic metric should perform all its features', () => {
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.intercept('POST', sampleRecordsApiCall, sampleRawRecordsMock).as('sampleRecordsApiCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    cy.populateDefineHealthSource(Connectors.SUMOLOGIC, 'Sumologic', 'sumologicmetric')

    // selecting feature
    cy.selectFeature('SumoLogic Cloud Metrics')

    cy.contains('span', 'Next').click({ force: true })

    cy.contains('span', 'Add Metric').should('be.visible')
    cy.contains('span', 'Add Metric').click()

    cy.get('input[name="metricName"]').should('exist')
    cy.get('input[name="metricName"]').type('metricName1')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.findByTestId('addMetric_SubmitButton').click()

    cy.findByPlaceholderText(/Enter your query/).should('be.visible')
    cy.findByPlaceholderText(/Enter your query/).type('*')

    cy.findByText('Run Query').should('be.visible')
    cy.findByText('Run Query').click()

    cy.wait('@sampleRecordsApiCall')

    cy.get('pre.StackTraceList--textContent').should('be.visible')

    cy.contains('span', 'Continuous Verification (Applied to the pipelines in the Continuous Deployment)').should(
      'exist'
    )

    cy.contains('span', 'Continuous Verification (Applied to the pipelines in the Continuous Deployment)')
      .scrollIntoView()
      .click()

    cy.findByRole('radio', { name: 'Errors' }).should('exist')
    cy.findByRole('radio', { name: 'Errors' }).scrollIntoView()
    cy.findByRole('radio', { name: 'Errors' }).click({ force: true })

    cy.findByRole('checkbox', { name: 'Higher counts = higher risk' }).should('exist')
    cy.findByRole('checkbox', { name: 'Higher counts = higher risk' }).scrollIntoView()
    cy.findByRole('checkbox', { name: 'Higher counts = higher risk' }).click({ force: true })

    cy.contains('span', 'Submit').should('exist')
    cy.contains('span', 'Submit').click()

    cy.get('.TableV2--body .TableV2--cell:first-child').should('have.text', 'sumologicmetric')
  })

  it('SumoLogic log should perform all its features', () => {
    cy.intercept('GET', applicationCall, applicationsResponse).as('ApplicationCall')
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', tiersCall, tiersResponse).as('TierCall')
    cy.intercept('GET', basePathCall, basePathResponse).as('basePathCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')

    cy.intercept('POST', sampleRecordsApiCall, sampleRawRecordsMock).as('sampleRecordsApiCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    cy.populateDefineHealthSource(Connectors.SUMOLOGIC, 'Sumologic', 'sumologiclog')

    // selecting feature
    cy.selectFeature('SumoLogic Cloud Logs')

    cy.contains('span', 'Next').click({ force: true })

    cy.contains('span', 'Add Query').should('be.visible')
    cy.contains('span', 'Add Query').click()

    cy.get('input[name="metricName"]').should('exist')
    cy.get('input[name="metricName"]').type('query1')

    cy.findByTestId('addMetric_SubmitButton').click()

    cy.findByPlaceholderText(/Enter your query/).should('be.visible')
    cy.findByPlaceholderText(/Enter your query/).type('*')

    cy.findByText('Run Query').should('be.visible')
    cy.findByText('Run Query').click()

    cy.wait('@sampleRecordsApiCall')

    cy.findByTestId(/jsonSelectorBtn/)
      .should('exist')
      .scrollIntoView()
    cy.findByTestId(/jsonSelectorBtn/).click()

    cy.contains('span', 'insertId').should('exist')
    cy.contains('span', 'insertId').click()

    cy.contains('span', 'Submit').should('exist')
    cy.contains('span', 'Submit').click()

    cy.get('.TableV2--body .TableV2--cell:first-child').should('have.text', 'sumologiclog')
  })
})
