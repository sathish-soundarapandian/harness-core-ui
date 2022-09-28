import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  validations,
  countOfServiceAPI,
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
  cy.contains('span', validations.groupName).should('be.visible')

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
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
    cy.visitSRMMonitoredServicePage()
  })

  it('Add new Custom HealthSource ', () => {
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

describe('Custom health metric thresholds', () => {
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

  it('should render metric thresholds only if any group is created', () => {
    cy.intercept('GET', baseURLCall, baseURLResponse).as('BaseURLCall')
    cy.intercept('POST', fetchRecordsCall, fetchRecordsRespose).as('FetchRecordsCall')
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.CUSTOM_HEALTH, 'customconnector', 'Custom Health Source')

    cy.selectFeature('Custom Health Metrics')

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.get('input[name="metricName"]').clear()

    cy.fillField('metricName', 'Prometheus Metric')

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('not.exist')

    cy.addingGroupName('Group 1')

    cy.contains('div', 'Assign').click({ force: true })
    cy.contains('span', 'Continuous Verification').scrollIntoView().click({ force: true })

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')
  })

  it('should render metric thresholds and perform its features', () => {
    cy.intercept('GET', baseURLCall, baseURLResponse).as('BaseURLCall')
    cy.intercept('POST', fetchRecordsCall, fetchRecordsRespose).as('FetchRecordsCall')
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.CUSTOM_HEALTH, 'customconnector', 'Custom Health Source')

    cy.selectFeature('Custom Health Metrics')

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mapping').should('be.visible')

    cy.get('input[name="metricName"]').clear()

    cy.fillField('metricName', 'Custom health Metric')

    cy.addingGroupName('Group 1')

    cy.contains('div', 'Assign').click({ force: true })
    cy.contains('span', 'Continuous Verification').scrollIntoView().click({ force: true })

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')

    cy.findByTestId('AddThresholdButton').click()

    cy.contains('div', 'Ignore Thresholds (1)').should('exist')

    cy.get("input[name='ignoreThresholds.0.metricType']").should('be.disabled')
    cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Custom')

    // validations
    cy.findByRole('button', { name: /Submit/i }).click()

    cy.findAllByText('Required').should('have.length', 3)

    cy.get("input[name='ignoreThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'Custom health Metric')

    cy.get('.Select--menuItem:nth-child(1)').click()

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

    cy.get("input[name='ignoreThresholds.0.criteria.spec.lessThan']").type('12')

    // Fail fast thresholds
    cy.contains('div', 'Fail-Fast Thresholds (0)').click()

    cy.findByTestId('AddThresholdButton').click()

    cy.get("input[name='failFastThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'Custom health Metric')

    cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('be.disabled')

    cy.get("input[name='failFastThresholds.0.spec.action']").click()
    cy.contains('p', 'Fail after multiple occurrences').click()
    cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('not.be.disabled')
    cy.get("input[name='failFastThresholds.0.spec.spec.count']").type('4')

    cy.get("input[name='failFastThresholds.0.criteria.spec.greaterThan']").type('21')
    cy.get("input[name='failFastThresholds.0.criteria.spec.lessThan']").type('78')
  })
})
