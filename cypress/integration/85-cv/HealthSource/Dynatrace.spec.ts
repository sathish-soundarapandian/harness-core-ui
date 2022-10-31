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
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('Add new Dynatrace monitored service ', () => {
    cy.intercept('GET', service.call, service.response).as('ServiceCall')
    cy.intercept('GET', metricPack.call, metricPack.response).as('MetricPackCall')
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

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
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // Fill Define HealthSource Tab with Dynatrace
    cy.populateDefineHealthSource(Connectors.DYNATRACE, 'dynatrace', 'dynatrace')
    cy.contains('span', 'Next').click()

    // Fill Customise HealthSource Tab for Dynatrace
    cy.wait('@ServiceCall')
    cy.wait('@MetricPackCall')
    cy.wait(1000)

    cy.get('input[name="Infrastructure"]').should('be.checked')
    cy.get('input[name="Performance"]').should('be.checked')

    cy.get('input[name="dynatraceService"]').click()
    cy.contains('p', 'HealthResource').click({ force: true })

    cy.contains('span', 'Add Metric').click()

    // Delete all custom metric
    cy.get('span[data-icon="main-delete"]').click({ multiple: true })
    cy.contains('span', 'Add Metric').should('be.visible')

    cy.contains('span', 'Add Metric').click()
    cy.wait('@QueriesCall')
    cy.contains('span', 'Submit').click({ force: true })

    cy.contains('span', validations.groupName).scrollIntoView().should('be.visible')
    cy.addingGroupName('Group 1')

    cy.contains('div', 'Query Specifications and mapping').click({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.metric).scrollIntoView().should('be.visible')

    cy.get('input[name="activeMetricSelector"]').click()
    cy.contains('p', 'builtin:service.cpu.time').click({ force: true })

    cy.contains('div', 'Assign').click({ force: true })
    cy.contains('span', 'Submit').click({ force: true })
    cy.contains('span', validations.assign).scrollIntoView().should('be.visible')
    cy.get('input[name="sli"]').click({ force: true })

    // Validation
    cy.contains('span', 'Submit').click({ force: true })

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  describe('NewRelic metric thresholds', () => {
    beforeEach(() => {
      cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
        cy.intercept('GET', featureFlagsCall, {
          ...featureFlagsData,
          resource: [
            ...featureFlagsData.resource,
            {
              uuid: null,
              name: 'CVNG_METRIC_THRESHOLD',
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
      cy.intercept(
        'GET',
        '/cv/api/monitored-service/count-of-services?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1',
        { allServicesCount: 1, servicesAtRiskCount: 0 }
      )
      cy.visitChangeIntelligence()
      cy.visitSRMMonitoredServicePage()
    })

    it('should test metric thresholds renders correctly and should hide metric thresholds if no metric packs are selected', () => {
      cy.intercept('GET', queries.call, queries.response).as('QueriesCall')
      cy.intercept('GET', service.call, service.response).as('ServiceCall')
      cy.intercept('GET', metricPack.call, metricPack.response).as('MetricPackCall')
      cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')

      cy.addNewMonitoredServiceWithServiceAndEnv()

      // Fill Define HealthSource Tab with AppDynamics
      cy.populateDefineHealthSource(Connectors.DYNATRACE, 'dynatrace', 'dynatrace')
      cy.contains('span', 'Next').click({ force: true })

      // Fill Customise HealthSource Tab for AppDynamics
      cy.wait('@ServiceCall')
      cy.wait('@MetricPackCall')

      cy.get('input[name="dynatraceService"]').click()
      cy.contains('p', ':4444').click({ force: true })

      cy.checkIfMetricThresholdsExists()

      // If no metric pack is selected, metric thresholds should be hidden
      cy.get('input[name="Performance"]').uncheck({ force: true })
      cy.get('input[name="Infrastructure"]').uncheck({ force: true })

      cy.contains('.Accordion--label', 'Advanced (Optional)').should('not.exist')
    })

    it('should add thresholds and do all the operations as expected', () => {
      cy.intercept('GET', queries.call, queries.response).as('QueriesCall')
      cy.intercept('GET', service.call, service.response).as('ServiceCall')
      cy.intercept('GET', metricPack.call, metricPack.response).as('MetricPackCall')
      cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')

      cy.addNewMonitoredServiceWithServiceAndEnv()

      // Fill Define HealthSource Tab with AppDynamics
      cy.populateDefineHealthSource(Connectors.DYNATRACE, 'dynatrace', 'dynatrace')
      cy.contains('span', 'Next').click({ force: true })

      // Fill Customise HealthSource Tab for AppDynamics
      cy.wait('@ServiceCall')
      cy.wait('@MetricPackCall')

      cy.get('input[name="dynatraceService"]').click()
      cy.contains('p', ':4444').click({ force: true })

      cy.checkIfMetricThresholdsExists()

      cy.findByTestId('AddThresholdButton').click()

      cy.contains('div', 'Ignore Thresholds (1)').should('exist')

      cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Performance')

      // validations
      cy.findByRole('button', { name: /Submit/i }).click()
      cy.findAllByText('Required').should('have.length', 4)

      cy.get("input[name='ignoreThresholds.0.groupName']").type('*')
      cy.get("input[name='ignoreThresholds.0.metricName']").click()

      cy.contains('p', 'Request Count total').click()

      cy.get("input[name='ignoreThresholds.0.metricName']").should('have.value', 'Request Count total')

      // testing criteria

      cy.get("input[name='ignoreThresholds.0.criteria.type']").should('have.value', 'Absolute Value')
      cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('exist')
      cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('exist')

      // greater than should be smaller than lesser than value
      cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").type('12')
      cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('1')

      cy.get("input[name='ignoreThresholds.0.criteria.type']").click()
      cy.contains('p', 'Percentage Deviation').click()

      cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('exist')
      cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('not.exist')

      cy.get("input[name='ignoreThresholds.0.criteria.criteriaPercentageType']").click()
      cy.contains('p', 'Lesser than').click()

      cy.get("input[name='ignoreThresholds.0.criteria.spec.greaterThan']").should('not.exist')
      cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").should('exist')

      cy.get("input[name='ignoreThresholds.0.groupName']").type('*')
      cy.get("input[name='ignoreThresholds.0.metricName']").click()

      cy.contains('p', 'Request Count total').click()

      cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('12')

      // Fail fast thresholds
      cy.contains('div', 'Fail-Fast Thresholds (0)').click()

      cy.findByTestId('AddThresholdButton').click()

      cy.get("input[name='failFastThresholds.0.groupName']").type('*')

      cy.get("input[name='failFastThresholds.0.metricName']").click()
      cy.contains('p', 'Request Count total').click()

      cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('be.disabled')

      cy.get("input[name='failFastThresholds.0.spec.action']").click()
      cy.contains('p', 'Fail after multiple occurrences').click()
      cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('not.be.disabled')
      cy.get("input[name='failFastThresholds.0.spec.spec.count']").type('4')

      cy.get("input[name='failFastThresholds.0.criteria.spec.greaterThan']").type('21')
      cy.get("input[name='failFastThresholds.0.criteria.spec.lessThan']").type('78')

      // Adding custom metrics
      cy.contains('span', 'Add Metric').click()

      // cy.contains('div', 'Assign').click({ force: true })

      cy.get('input[name="groupName"]').click()
      cy.contains('p', '+ Add New').click({ force: true })
      cy.get('.bp3-overlay input[name="name"]').type('group 1')
      cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

      cy.contains('div', 'Assign').click({ force: true })
      cy.contains('span', 'Continuous Verification').scrollIntoView().click({ force: true })

      cy.get("input[name='failFastThresholds.0.metricType']").scrollIntoView().click()

      cy.wait(1000)

      cy.get('.Select--menuItem:nth-child(3)').should('have.text', 'Custom')
      cy.get('.Select--menuItem:nth-child(3)').click()

      // group name should have created group name option
      cy.get("input[name='failFastThresholds.0.groupName']").click()

      cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'group 1').scrollIntoView()
      cy.get('.Select--menuItem:nth-child(1)').click()

      // Selected group's metric name must be listed
      cy.get("input[name='failFastThresholds.0.metricName']").click()
      cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'Dynatrace metric')
      cy.get('.Select--menuItem:nth-child(1)').click()
    })
    it('should show prompt, if metric packs containing metric thresholds are being removed', () => {
      cy.intercept('GET', queries.call, queries.response).as('QueriesCall')
      cy.intercept('GET', service.call, service.response).as('ServiceCall')
      cy.intercept('GET', metricPack.call, metricPack.response).as('MetricPackCall')
      cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')

      cy.addNewMonitoredServiceWithServiceAndEnv()

      // Fill Define HealthSource Tab with AppDynamics
      cy.populateDefineHealthSource(Connectors.DYNATRACE, 'dynatrace', 'dynatrace')
      cy.wait(1000)
      cy.contains('span', 'Next').click({ force: true })

      // Fill Customise HealthSource Tab for AppDynamics
      cy.wait('@ServiceCall')
      cy.wait('@MetricPackCall')

      cy.get('input[name="dynatraceService"]').click()
      cy.contains('p', ':4444').click({ force: true })

      cy.checkIfMetricThresholdsExists()

      cy.findByTestId('AddThresholdButton').click()

      cy.contains('div', 'Ignore Thresholds (1)').should('exist')

      cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Performance')

      cy.get('input[name="Performance"]').scrollIntoView().click({ force: true })

      cy.contains('p', 'Warning').should('be.visible')

      cy.contains('button', 'Confirm').should('be.visible')
      cy.contains('button', 'Confirm').click()

      cy.contains('div', 'Ignore Thresholds (0)').should('exist')
    })

    it('should show prompt, if custom metrics containing metric thresholds are being deleted', () => {
      cy.intercept('GET', queries.call, queries.response).as('QueriesCall')
      cy.intercept('GET', service.call, service.response).as('ServiceCall')
      cy.intercept('GET', metricPack.call, metricPack.response).as('MetricPackCall')
      cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')

      cy.addNewMonitoredServiceWithServiceAndEnv()

      // Fill Define HealthSource Tab with AppDynamics
      cy.populateDefineHealthSource(Connectors.DYNATRACE, 'dynatrace', 'dynatrace')
      cy.wait(1000)
      cy.contains('span', 'Next').click({ force: true })

      // Fill Customise HealthSource Tab for AppDynamics
      cy.wait('@ServiceCall')
      cy.wait('@MetricPackCall')

      cy.get('input[name="dynatraceService"]').click()
      cy.contains('p', ':4444').click({ force: true })

      // Adding custom metrics
      cy.contains('span', 'Add Metric').click()

      cy.get('input[name="groupName"]').click()
      cy.contains('p', '+ Add New').click({ force: true })
      cy.get('.bp3-overlay input[name="name"]').type('group 1')
      cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

      cy.contains('div', 'Assign').click({ force: true })
      cy.contains('span', 'Continuous Verification').scrollIntoView().click({ force: true })

      cy.checkIfMetricThresholdsExists()

      cy.findByTestId('AddThresholdButton').click()

      cy.contains('div', 'Ignore Thresholds (1)').should('exist')

      cy.get("input[name='ignoreThresholds.0.metricType']").click()

      cy.get('.Select--menuItem:nth-child(3)').should('have.text', 'Custom')
      cy.get('.Select--menuItem:nth-child(3)').click()

      // group name should have created group name option
      cy.get("input[name='ignoreThresholds.0.groupName']").click()

      cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'group 1')
      cy.get('.Select--menuItem:nth-child(1)').click()

      cy.get("input[name='ignoreThresholds.0.groupName']").should('have.value', 'group 1')
      // Selected group's metric name must be listed
      cy.get("input[name='ignoreThresholds.0.metricName']").click()

      cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'Dynatrace metric')
      cy.get('.Select--menuItem:nth-child(1)').click()

      cy.get('span[data-icon="main-delete"]').should('exist').scrollIntoView().click()

      cy.contains('p', 'Warning').should('be.visible')

      cy.contains('button', 'Confirm').should('be.visible')
      cy.contains('button', 'Confirm').click()

      cy.contains('div', 'Ignore Thresholds (0)').should('exist')
    })
  })
})
