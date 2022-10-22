/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  validations,
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse,
  riskCategoryMock
} from '../../../support/85-cv/monitoredService/constants'
import { riskCategoryCall } from '../../../support/85-cv/monitoredService/health-sources/CloudWatch/constants'
import {
  metricPackCall,
  metricPackResponse,
  applicationCall,
  applicationResponse,
  metricDataCall,
  metricDataResponse,
  sampleDataResponse,
  sampleDataCall
} from '../../../support/85-cv/monitoredService/health-sources/NewRelic/constants'
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

  it('Add new NewRelic monitored service ', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('NewRelic Template', '1')
    cy.setServiceEnvRuntime()

    cy.intercept('GET', applicationCall, applicationResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', metricDataCall, metricDataResponse).as('MetricDataCall')

    // Fill Define HealthSource Tab with NewRelic
    cy.populateDefineHealthSource(Connectors.NEW_RELIC, 'NewRelicConn', 'NewRelic HS')
    cy.contains('span', 'Next').click()

    // Fill Customise HealthSource Tab for NewRelic
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="Performance"]').should('be.checked')
    cy.get('input[name="Performance"]').uncheck({ force: true })

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', 'Please select application').should('be.visible')
    cy.contains('span', validations.metricPack).should('be.visible')

    cy.get('input[name="Performance"]').check({ force: true })
    cy.contains('span', validations.metricPack).should('not.exist')

    cy.get('[data-testid="newRelicApplication"] input').click()
    cy.get('.bp3-popover-content').within(() => {
      cy.contains('li', 'My Application').click({ force: true })
    })

    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('div', 'NewRelic HS').click({ force: true })
    cy.contains('span', 'Next').click()

    cy.get('[data-testid="newRelicApplication"] input').should('have.value', 'My Application')
    cy.get('input[name="Performance"]').should('be.checked')
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the template.
    cy.findByText('Save').click()
    // Saving modal.
    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })

  it('Add new NewRelic monitored service with custom metric with all fixed values', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('NewRelic Template', '1')
    cy.setServiceEnvRuntime()

    cy.intercept('GET', applicationCall, applicationResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', metricDataCall, metricDataResponse).as('MetricDataCall')
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', sampleDataCall, sampleDataResponse).as('SampleDataCall')

    // Fill Define HealthSource Tab with NewRelic
    cy.populateDefineHealthSource(Connectors.NEW_RELIC, 'NewRelicConn', 'NewRelic HS')
    cy.contains('span', 'Next').click()

    // Fill Customise HealthSource Tab for NewRelic
    cy.wait('@ApplicationCall')
    cy.wait('@MetricPackCall')

    cy.get('[data-testid="newRelicApplication"] input').click()
    cy.get('.bp3-popover-content').within(() => {
      cy.contains('li', 'My Application').click({ force: true })
    })

    cy.contains('span', 'Add Metric').click()

    // Custom validation
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.groupName).scrollIntoView().should('be.visible')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.contains('div', 'Query Specifications and mapping').click({ force: true })
    cy.get('div[class="view-lines"]').type(
      "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES"
    )
    cy.contains('span', 'Fetch records').click()

    cy.contains('div', 'Metric values and charts').click({ force: true })

    cy.get('[class*=InputWithDynamicModalForJson-module] button.bp3-minimal span').first().click({ force: true })
    cy.wait(1000)
    cy.get('[class*="JsonSelector-module_selectableKey"]').first().click({ force: true })

    cy.get('[class*=InputWithDynamicModalForJson-module] button.bp3-minimal span').last().click({ force: true })
    cy.wait(1000)
    cy.get('[class*="JsonSelector-module_selectableKey"]').first().click({ force: true })

    cy.contains('div', 'Assign').click({ force: true })
    cy.get('input[name="sli"]').click({ force: true })
    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[value="Performance_Throughput"]').click({ force: true })
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    // Open again
    cy.contains('div', 'NewRelic HS').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })
    cy.get('[data-testid="newRelicApplication"] input').should('have.value', 'My Application')
    cy.get('input[name="Performance"]').should('be.checked')
    cy.contains('div', 'Query Specifications and mapping').click({ force: true })
    cy.get('div[class="view-lines"]').should(
      'have.text',
      "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES"
    )
    cy.contains('div', 'Metric values and charts').click({ force: true })
    cy.contains('span', '$.total.results.[*].average').should('have.visible')
    cy.contains('div', 'Assign').click({ force: true })
    cy.get('input[name="sli"]').should('be.checked')
    cy.get('input[name="continuousVerification"]').should('be.checked')
    cy.get('input[value="Performance_Throughput"]').should('be.checked')
    cy.get('input[name="higherBaselineDeviation"]').should('be.checked')
  })

  it('Add new NewRelic monitored service with custom metric with all Runtime values', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('NewRelic Template', '1')
    cy.setServiceEnvRuntime()

    cy.intercept('GET', applicationCall, applicationResponse).as('ApplicationCall')
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', metricDataCall, metricDataResponse).as('MetricDataCall')
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', sampleDataCall, sampleDataResponse).as('SampleDataCall')

    // Fill Define HealthSource Tab with NewRelic
    cy.populateDefineHealthSource(Connectors.NEW_RELIC, '', 'NewRelic HS')
    cy.setConnectorRuntime()
    cy.contains('span', 'Next').click()

    cy.wait('@MetricPackCall')

    cy.get('[data-testid="newRelicApplication"] input').should('have.value', '<+input>')

    cy.contains('span', 'Add Metric').click()

    // Custom validation
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.groupName).scrollIntoView().should('be.visible')

    cy.get('input[name="groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.contains('div', 'Query Specifications and mapping').click({ force: true })
    cy.get('span[data-icon="expression-input"]').first().should('be.visible').click()
    cy.get('a.bp3-menu-item').should('have.length', 2).as('valueList')
    cy.get('@valueList').eq(0).should('contain.text', 'Runtime input').as('runtimeValue')
    cy.get('@valueList').eq(1).should('contain.text', 'Expression').as('expressionValue')
    cy.get('@runtimeValue').click()

    cy.contains('div', 'Metric values and charts').click({ force: true })
    cy.get('input[name="metricValue"]').should('have.value', '<+input>')
    cy.get('input[name="timestamp"]').should('have.value', '<+input>')

    cy.contains('div', 'Assign').click({ force: true })
    cy.get('input[name="sli"]').click({ force: true })
    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[value="Performance_Throughput"]').click({ force: true })
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })

    cy.contains('span', 'Submit').click({ force: true })

    // Open again
    cy.contains('div', 'NewRelic HS').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    cy.get('[data-testid="newRelicApplication"] input').should('have.value', '<+input>')
    cy.get('input[name="Performance"]').should('be.checked')
    cy.contains('div', 'Query Specifications and mapping').click({ force: true })
    cy.get('input[name="query"]').should('have.value', '<+input>')
    cy.contains('div', 'Metric values and charts').click({ force: true })
    cy.get('input[name="metricValue"]').should('have.value', '<+input>')
    cy.get('input[name="timestamp"]').should('have.value', '<+input>')
    cy.contains('div', 'Assign').click({ force: true })
    cy.get('input[name="sli"]').should('be.checked')
    cy.get('input[name="continuousVerification"]').should('be.checked')
    cy.get('input[value="Performance_Throughput"]').should('be.checked')
    cy.get('input[name="higherBaselineDeviation"]').should('be.checked')
  })

  it('Edit Newrelic template', () => {
    cy.get('span[icon="more"]').first().click()
    cy.intercept(
      'POST',
      'template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&getDefaultFromOtherRepo=true',
      {
        fixture: 'cv/templates/healthsourceTemplate'
      }
    ).as('applyTemplates')
    cy.intercept(
      'POST',
      'template/api/templates/list?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&templateListType=All',
      {
        fixture: 'cv/templates/templateListIndivisual'
      }
    ).as('listIndv')

    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', metricDataCall, metricDataResponse).as('MetricDataCall')
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')

    cy.contains('p', 'Open/Edit Template').click()
    cy.wait('@applyTemplates')
    cy.wait('@listIndv')
    cy.contains('div', 'NewRelic').click()
    cy.wait(1000)
    cy.contains('span', 'Next').click({ force: true })

    cy.get('[data-testid="newRelicApplication"] input').should('have.value', '<+input>')
    cy.get('input[name="Performance"]').should('be.checked')
    cy.contains('div', 'Query Specifications and mapping').click({ force: true })
    cy.get('input[name="query"]').should('have.value', '<+input>')
    cy.contains('div', 'Metric values and charts').click({ force: true })
    cy.get('input[name="metricValue"]').should('have.value', '<+input>')
    cy.get('input[name="timestamp"]').should('have.value', '<+input>')
    cy.contains('div', 'Assign').click({ force: true })
    cy.get('input[name="sli"]').should('be.checked')
    cy.get('input[name="continuousVerification"]').should('be.checked')
    cy.get('input[value="Performance_Throughput"]').should('be.checked')
    cy.get('input[name="higherBaselineDeviation"]').should('be.checked')
  })
})
