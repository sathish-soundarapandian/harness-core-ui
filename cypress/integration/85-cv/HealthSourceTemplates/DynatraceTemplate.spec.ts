import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  validations,
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import {
  metricPack,
  service,
  queries
} from '../../../support/85-cv/monitoredService/health-sources/Dynatrace/constants'
import { RuntimeValue } from '../../../support/85-cv/Templates/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Create empty monitored service', () => {
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
    cy.intercept(
      'POST',
      'template/api/templates/list?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&templateListType=LastUpdated&searchTerm=&page=0&sort=lastUpdatedAt%2CDESC&size=20',
      { fixture: 'cv/templates/templateList' }
    ).as('templatesListCall')
    cy.visitSRMTemplate()
  })

  it('Add new Dynatrace monitored service template', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('Dynatrace Template', '1')
    cy.setServiceEnvRuntime()

    cy.intercept('GET', service.call, service.response).as('ServiceCall')
    cy.intercept('GET', metricPack.call, metricPack.response).as('MetricPackCall')

    // Fill Define HealthSource Tab with Dynatrace
    cy.populateDefineHealthSource(Connectors.DYNATRACE, 'dynatrace', 'dynatrace')
    cy.contains('span', 'Next').click()

    // Fill Customise HealthSource Tab for Dynatrace
    cy.wait('@ServiceCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="Infrastructure"]').should('be.checked')
    cy.get('input[name="Performance"]').should('be.checked')

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', 'Please select a service').should('be.visible')

    cy.get('input[name="Infrastructure"]').uncheck({ force: true })
    cy.get('input[name="Performance"]').uncheck({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.metricPack).should('be.visible')
    cy.get('input[name="Infrastructure"]').check({ force: true })
    cy.get('input[name="Performance"]').check({ force: true })
    cy.contains('span', validations.metricPack).should('not.exist')

    cy.get('[data-testid="dynatraceService"] input').click()
    cy.get('.bp3-popover-content').within(() => {
      cy.contains('li', 'HealthResource').click({ force: true })
    })

    // Validation
    cy.contains('span', 'Please select a service').should('not.exist')
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'dynatrace').click({ force: true })
    cy.contains('span', 'Next').click()

    cy.get('[data-testid="dynatraceService"] input').should('have.value', 'HealthResource')
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the template.
    cy.findByText('Save').click()
    // Saving modal.
    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })

  it('Add new Dynatrace monitored service template with custom metric', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('Dynatrace Template', '1')
    cy.setServiceEnvRuntime()

    cy.intercept('GET', queries.call, queries.response).as('QueriesCall')
    cy.intercept('GET', service.call, service.response).as('ServiceCall')
    cy.intercept('GET', metricPack.call, metricPack.response).as('MetricPackCall')

    // Fill Define HealthSource Tab with Dynatrace
    cy.populateDefineHealthSource(Connectors.DYNATRACE, '', 'dynatrace')
    cy.setConnectorRuntime()
    cy.contains('span', 'Next').click()

    // Fill Customise HealthSource Tab for Dynatrace
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="Infrastructure"]').should('be.checked')
    cy.get('input[name="Performance"]').should('be.checked')

    cy.get('input[name="dynatraceService"]').should('have.value', '<+input>')

    cy.contains('span', 'Add Metric').click()
    cy.wait('@QueriesCall')
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', validations.groupName).scrollIntoView().should('be.visible')
    cy.addingGroupName('Group 1')

    cy.contains('div', 'Query Specifications and mapping').click({ force: true })
    cy.get('input[name="metricSelector"]').should('have.value', RuntimeValue)
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'Assign').click({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.assign).scrollIntoView().should('be.visible')
    cy.get('input[name="sli"]').click({ force: true })

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the template.
    cy.findByText('Save').click()
    // Saving modal.
    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })
})
