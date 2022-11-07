import {
  validations,
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  dashboardsAPI,
  elkSampleDataAPI,
  logApiData,
  logIndexAPI,
  logSampleDataResponse,
  monitoredService,
  timeStampApi,
  timeStampData
} from '../../../support/85-cv/monitoredService/health-sources/GoogleCloudOperations/constants'
import { errorResponse } from '../../../support/85-cv/slos/constants'
import { Connectors } from '../../../utils/connctors-utils'
import { featureFlagsCall } from '../../72-freeze-windows/constants'

describe('Health Source - Google Cloud Operations', () => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'ELK_HEALTH_SOURCE',
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
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('should be able to add Elk Health Source with Cloud Logs', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.ELK, 'elastic-search-api', 'ElasticSearch')

    cy.intercept('GET', dashboardsAPI, errorResponse).as('dashboardsErrorResponse')
    cy.intercept('GET', logIndexAPI, logApiData).as('elkIndicesDat123')
    cy.intercept('GET', timeStampApi, timeStampData)
    cy.findByRole('button', { name: /Next/i }).click()

    cy.fillField('query', '*')
    cy.get('input[name="logIndexes"]').click()
    cy.contains('p', 'integration-test').click({ force: true })

    cy.intercept('POST', elkSampleDataAPI, errorResponse)
    cy.findByRole('button', { name: /Fetch records/i }).click()

    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('exist')

    cy.intercept('POST', elkSampleDataAPI, logSampleDataResponse)
    cy.findByRole('button', { name: /Retry/i }).click()

    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('span', validations.serviceInstance).should('be.visible')
    cy.findByRole('button', { name: /Select path for service instance/i }).click()
    cy.contains('p', 'Select path for service instance').should('be.visible')
    cy.contains('span', 'logName').click()
    cy.contains('span', validations.serviceInstance).should('not.exist')

    cy.findByRole('button', { name: /Select path for message identifier/i }).click()
    cy.contains('p', 'Select path for message identifier').should('be.visible')
    cy.contains('span', 'cluster_name').click()
    cy.contains('span', 'Message Identifier is required field.').should('not.exist')

    cy.findByRole('button', { name: /Select path for TimeStamp/i }).click()
    cy.contains('p', 'Select Path for TimeStamp').should('be.visible')
    cy.contains('span', 'timestamp').click()
    cy.contains('span', 'Identify TimeStamp is required field.').should('not.exist')

    cy.get('input[name="timeStampFormat"]').click()
    cy.contains('p', 'MMM dd HH:mm:ss').click({ force: true })

    cy.contains('p', 'Records not upated with latest query. Please fetch records').should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('service-1').should('be.visible')
  })

  it('should be able to edit an existing ELK health source', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', monitoredService)

    cy.wait(2000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.contains('div', 'es1').click({ force: true })

    cy.intercept('POST', elkSampleDataAPI, logSampleDataResponse)
    cy.findByRole('button', { name: /Next/i }).click()

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('es1').should('be.visible')
  })
})
