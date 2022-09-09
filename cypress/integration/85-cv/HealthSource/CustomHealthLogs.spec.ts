import {
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  baseURLCall,
  baseURLResponse,
  fetchRecordsCall,
  fetchRecordsRespose
} from '../../../support/85-cv/monitoredService/health-sources/CustomHealth/constants'
import { Connectors } from '../../../utils/connctors-utils'

function populateQueryAndMapping() {
  cy.wait('@BaseURLCall')

  cy.contains('span', 'Submit').click({ force: true })
  cy.contains('span', 'Please select path').should('be.visible')
  cy.contains('span', 'Start time placeholder is required').should('be.visible')
  cy.contains('span', 'End time placeholder is required.').scrollIntoView().should('be.visible')

  cy.get('input[value="GET"]').click({ force: true })
  cy.get('input[name="pathURL"]').type(
    'query?query=kubernetes.cpu.usage.total{*}by{pod_name}.rollup(avg,60)&from=start_time_seconds&to=end_time_seconds&pod_name=harness-datadog-dummy-pipeline-deployment-canary-76586cb6fvjsfp',
    { parseSpecialCharSequences: false }
  )
  cy.get('input[name="endTime.placeholder"]').type('end_time_seconds')
  cy.get('input[name="startTime.placeholder"]').type('start_time_seconds')
  cy.contains('span', 'Fetch records').click()
  cy.wait('@FetchRecordsCall')
}

function populateMetricValues() {
  cy.contains('div', 'JSON path selection').click()

  cy.contains('span', 'Submit').click({ force: true })
  cy.contains('span', 'Log Message JSON Path is reqired.').should('be.visible')
  cy.contains('span', 'Timestamp JSON Path is required.').should('be.visible')
  cy.contains('span', 'Service Instance Identifier is required.').should('be.visible')

  cy.contains('span', 'Select path for log message').click({ force: true })
  cy.wait(1000)
  cy.get('[class*="JsonSelector-module_selectableKey"]').first().click({ force: true })

  cy.contains('span', 'Select path for timestamp field').click({ force: true })
  cy.wait(1000)
  cy.get('[class*="JsonSelector-module_selectableKey"]').first().click({ force: true })

  cy.contains('span', 'Select path for Service Instance').click({ force: true })
  cy.wait(1000)
  cy.get('[class*="JsonSelector-module_selectableKey"]').first().click({ force: true })
}

describe('Configure Datadog health source', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false
    })
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('Add new Custom HealthSource ', () => {
    cy.intercept('GET', baseURLCall, baseURLResponse).as('BaseURLCall')
    cy.intercept('POST', fetchRecordsCall, fetchRecordsRespose).as('FetchRecordsCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.CUSTOM_HEALTH, 'customconnector', 'Custom Health Source')
    cy.selectFeature('Custom Health Log')
    cy.contains('span', 'Next').click()

    populateQueryAndMapping()
    populateMetricValues()

    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('div', 'Custom Health Source')

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('Add new Custom HealthSource with multiple query', () => {
    cy.intercept('GET', baseURLCall, baseURLResponse).as('BaseURLCall')
    cy.intercept('POST', fetchRecordsCall, fetchRecordsRespose).as('FetchRecordsCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.CUSTOM_HEALTH, 'customconnector', 'Custom Health Source')
    cy.selectFeature('Custom Health Log')
    cy.contains('span', 'Next').click()

    populateQueryAndMapping()
    populateMetricValues()

    cy.contains('span', 'Add Query').click()

    populateQueryAndMapping()
    populateMetricValues()

    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('div', 'Custom Health Source')
  })
})
