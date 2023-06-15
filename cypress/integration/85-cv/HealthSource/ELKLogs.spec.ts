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
  metricStructureCall,
  metricStructureResponse
} from '../../../support/85-cv/monitoredService/health-sources/AppDynamics/constants'
import { riskCategoryCall } from '../../../support/85-cv/monitoredService/health-sources/CloudWatch/constants'
import {
  ParamValuesAPI,
  ParamValuesResponse
} from '../../../support/85-cv/monitoredService/health-sources/ELK/constants'
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

  it('ELK log should perform all its features', () => {
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', metricStructureCall, metricStructureResponse).as('metricStructureCall')
    cy.intercept('POST', ParamValuesAPI, ParamValuesResponse).as('ParamValuesAPI')

    cy.intercept('POST', sampleRecordsApiCall, sampleRawRecordsMock).as('sampleRecordsApiCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    cy.populateDefineHealthSource(Connectors.ELK, 'elastic-search-api', 'elasticsearch')

    cy.contains('span', 'Next').click({ force: true })

    cy.contains('span', 'Add Query').should('be.visible')
    cy.contains('span', 'Add Query').click()

    cy.get('input[name="metricName"]').should('exist')
    cy.get('input[name="metricName"]').type('query1')

    cy.findByTestId('addMetric_SubmitButton').click()

    cy.wait('@ParamValuesAPI')

    cy.findByPlaceholderText(/- Select Log Index -/).should('be.visible')
    cy.findByPlaceholderText(/- Select Log Index -/).click()

    cy.findByText(/metricbeat-7.9.3-2023.04.26/).should('be.visible')
    cy.findByText(/metricbeat-7.9.3-2023.04.26/).click()

    cy.findByPlaceholderText(/Enter your query/).should('be.visible')
    cy.findByPlaceholderText(/Enter your query/).type('*')

    cy.findByText('Run Query').should('be.visible').should('not.be.disabled')
    cy.findByText('Run Query').click()

    cy.get('input[name="timeStampFormat"]').should('exist').scrollIntoView()
    cy.get('input[name="timeStampFormat"]').click()

    cy.findByText(/metricbeat-7.9.3-2023.04.26/).should('be.visible')
    cy.findByText(/metricbeat-7.9.3-2023.04.26/).click()

    cy.get('input[name="serviceInstanceField"]').should('exist')
    cy.get('input[name="serviceInstanceField"]').type('_sourcehost')

    cy.findAllByTestId(/jsonSelectorBtn/)
      .first()
      .should('exist')
      .scrollIntoView()

    cy.findAllByTestId(/jsonSelectorBtn/)
      .first()
      .click()

    cy.get('[class^="JsonSelector-module_editorRow"]:first-of-type button').should('exist')
    cy.get('[class^="JsonSelector-module_editorRow"]:first-of-type button').click({ force: true })
  })
})
