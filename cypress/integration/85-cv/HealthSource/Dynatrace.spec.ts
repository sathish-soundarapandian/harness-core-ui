import {
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  metricPack,
  service,
  queries
} from '../../../support/85-cv/monitoredService/health-sources/Dynatrace/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Create empty monitored service', () => {
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

  it('Add new Dynatrace monitored service ', () => {
    cy.intercept('GET', service.call, service.response).as('ServiceCall')
    cy.intercept('GET', metricPack.call, metricPack.response).as('MetricPackCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with Dynatrace
    cy.populateDefineHealthSource(Connectors.DYNATRACE, 'dynatrace', 'dynatrace')
    cy.contains('span', 'Next').click()

    // Fill Customise HealthSource Tab for Dynatrace
    cy.wait('@ServiceCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="metricData.Infrastructure"]').should('be.checked')
    cy.get('input[name="metricData.Performance"]').should('be.checked')

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', 'Please select a service').should('be.visible')

    cy.get('input[name="metricData.Infrastructure"]').uncheck({ force: true })
    cy.get('input[name="metricData.Performance"]').uncheck({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Plese select metric packs').should('be.visible')
    cy.get('input[name="metricData.Infrastructure"]').check({ force: true })
    cy.get('input[name="metricData.Performance"]').check({ force: true })
    cy.contains('span', 'Plese select metric packs').should('not.exist')

    cy.get('input[name="dynatraceService"]').click()
    cy.contains('p', 'HealthResource').click({ force: true })

    // Validation
    cy.contains('span', 'Please select a service').should('not.exist')
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'dynatrace').click({ force: true })
    cy.contains('span', 'Next').click()

    cy.get('input[name="dynatraceService"]').should('have.value', 'HealthResource')
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('Add new Dynatrace monitored service with custom metric', () => {
    cy.intercept('GET', queries.call, queries.response).as('QueriesCall')
    cy.intercept('GET', service.call, service.response).as('ServiceCall')
    cy.intercept('GET', metricPack.call, metricPack.response).as('MetricPackCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with Dynatrace
    cy.populateDefineHealthSource(Connectors.DYNATRACE, 'dynatrace', 'dynatrace')
    cy.contains('span', 'Next').click()

    // Fill Customise HealthSource Tab for Dynatrace
    cy.wait('@ServiceCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="metricData.Infrastructure"]').should('be.checked')
    cy.get('input[name="metricData.Performance"]').should('be.checked')

    cy.get('input[name="dynatraceService"]').click()
    cy.contains('p', 'HealthResource').click({ force: true })

    cy.contains('span', 'Add Metric').click()
    cy.wait('@QueriesCall')
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', 'Group Name is required').scrollIntoView().should('be.visible')
    cy.addingGroupName('Group 1')

    cy.contains('div', 'Query Specifications and mapping').click({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'Metric is required').scrollIntoView().should('be.visible')

    cy.get('input[name="activeMetricSelector"]').click()
    cy.contains('p', 'builtin:service.cpu.time').click({ force: true })

    cy.contains('div', 'Assign').click({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', 'One selection is required').scrollIntoView().should('be.visible')
    cy.get('input[name="sli"]').click({ force: true })

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })
})
