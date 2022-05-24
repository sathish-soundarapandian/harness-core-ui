import {
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  baseURLCall,
  baseURLResponse,
  fetchRecordsCall,
  fetchRecordsRespose,
  monitoredServiceWithCustomHealthSource
} from '../../../support/85-cv/monitoredService/health-sources/CustomHealth/constants'
import { Connectors } from '../../../utils/connctors-utils'

function populateGroupName(groupName: string) {
  cy.contains('span', 'Submit').click({ force: true })
  cy.contains('span', 'Group Name is required').should('be.visible')

  cy.get('input[name="groupName"]').click()
  cy.contains('p', '+ Add New').click({ force: true })
  cy.get('.bp3-overlay input[name="name"]').type(groupName)
  cy.get('.bp3-overlay button[type="submit"]').click({ force: true })
}

function populateQueryAndMapping() {
  cy.contains('div', 'Query specifications and mapping').click()
  cy.wait('@BaseURLCall')

  cy.contains('span', 'Submit').click({ force: true })
  cy.contains('span', 'Query Type is required').should('be.visible')
  cy.contains('span', 'Request Method is required').should('be.visible')
  cy.contains('span', 'Start time placeholder is required').should('be.visible')
  cy.contains('span', 'End time placeholder is required.').scrollIntoView().should('be.visible')

  cy.get('input[value="SERVICE_BASED"]').scrollIntoView().click({ force: true })
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
  cy.contains('div', 'Metric values and charts').click()

  cy.contains('span', 'Submit').click({ force: true })
  cy.contains('span', 'Metric Value JSON Path is required').should('be.visible')
  cy.contains('span', 'Timestamp Field/Locator JSON Path is required').should('be.visible')

  cy.contains('span', 'Select path for Metric value').click({ force: true })
  cy.wait(1000)
  cy.get('[class*="JsonSelector-module_selectableKey"]').first().click({ force: true })
  cy.contains('span', 'Select path for timestamp field').click({ force: true })
  cy.wait(1000)
  cy.get('[class*="JsonSelector-module_selectableKey"]').first().click({ force: true })
  cy.wait(1000)
}

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
  })

  it.skip('Add new Custom HealthSource ', () => {
    cy.intercept('GET', baseURLCall, baseURLResponse).as('BaseURLCall')
    cy.intercept('POST', fetchRecordsCall, fetchRecordsRespose).as('FetchRecordsCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.CUSTOM_HEALTH, 'customconnector', 'Custom Health Source')
    cy.selectFeature('Custom Health Metrics')
    cy.contains('span', 'Next').click()

    populateGroupName('group 1')

    populateQueryAndMapping()
    populateMetricValues()

    cy.contains('div', 'Assign').click({ force: true })
    cy.get('input[name="sli"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('div', 'Custom Health Source')

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('Add new Custom HealthSource with multiple metric', () => {
    cy.intercept('GET', baseURLCall, baseURLResponse).as('BaseURLCall')
    cy.intercept('POST', fetchRecordsCall, fetchRecordsRespose).as('FetchRecordsCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.CUSTOM_HEALTH, 'customconnector', 'Custom Health Source')
    cy.selectFeature('Custom Health Metrics')
    cy.contains('span', 'Next').click()

    populateGroupName('group 1')

    populateQueryAndMapping()
    populateMetricValues()

    cy.contains('div', 'Assign').click({ force: true })
    cy.get('input[name="sli"]').click({ force: true })

    cy.contains('span', 'Add Metric').click()
    cy.get('input[name="sli"]').click({ force: true })

    cy.contains('div', 'Map Metric(s) to Harness Services').click()
    populateGroupName('group 2')
    populateQueryAndMapping()
    populateMetricValues()

    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('div', 'Custom Health Source')
  })

  it('Custom HealthSource loads in edit mode', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', monitoredServiceWithCustomHealthSource).as(
      'monitoredServiceCall'
    )
    cy.intercept('GET', baseURLCall, baseURLResponse).as('BaseURLCall')
    cy.intercept('POST', fetchRecordsCall, fetchRecordsRespose).as('FetchRecordsCall')

    cy.wait(2000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.wait('@monitoredServiceCall')

    // clear any cached values
    cy.get('body').then($body => {
      if ($body.text().includes('Unsaved changes')) {
        cy.contains('span', 'Discard').click()
      }
    })

    cy.contains('div', 'CustomHealth Metric').click({ force: true })
    cy.contains('span', 'Next').click()

    cy.fillField('metricName', 'CustomHealth Metric updated')
    cy.findByRole('button', { name: /Submit/i }).click()

    cy.findByRole('button', { name: /Save/i }).click()
    cy.contains('span', 'Monitored Service updated').should('be.visible')
  })
})
