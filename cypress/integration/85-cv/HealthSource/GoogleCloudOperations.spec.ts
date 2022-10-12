import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  validations,
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import { metricPackResponse } from '../../../support/85-cv/monitoredService/health-sources/AppDynamics/constants'
import {
  dashboardDetailsAPI,
  dashboardDetailsResponse,
  dashboardsAPI,
  dashboardsResponse,
  logSampleDataAPI,
  logSampleDataResponse,
  metricPackAPI,
  monitoredService,
  sampleDataAPI,
  sampleDataResponse
} from '../../../support/85-cv/monitoredService/health-sources/GoogleCloudOperations/constants'
import { errorResponse } from '../../../support/85-cv/slos/constants'
import { Connectors } from '../../../utils/connctors-utils'

describe('Health Source - Google Cloud Operations', () => {
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

  it('should be able to add GCO Health Source with manual query', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.GCP, 'gcp-qa-target', 'Google Cloud Operations')

    cy.contains('span', 'product is a required field').should('be.visible')
    cy.get('input[name="product"]').click({ force: true })
    cy.contains('p', 'Cloud Metrics').click()
    cy.contains('span', 'product is a required field').should('not.exist')

    cy.intercept('GET', dashboardsAPI, errorResponse).as('dashboardsErrorResponse')

    cy.contains('span', 'Next').click()

    cy.wait('@dashboardsErrorResponse')
    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('be.visible')

    cy.intercept('GET', dashboardsAPI, dashboardsResponse).as('dashboardsResponse')

    cy.findByRole('button', { name: /Retry/i }).click()

    cy.wait('@dashboardsResponse')
    cy.contains('p', '+ Manually input query').click()

    cy.intercept('GET', metricPackAPI, metricPackResponse)

    cy.contains('h4', 'Add your Google Cloud Operations query').should('be.visible')
    cy.fillField('metricName', 'GCO Metric')
    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('h3', 'Query Specifications').should('be.visible')

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('span', 'Tags are required.').should('be.visible')
    cy.findByPlaceholderText('Type and press enter to create a tag').type('GCO')

    cy.fillField('query', '{}')
    cy.contains('span', 'Tags are required.').should('not.exist')

    cy.intercept('POST', sampleDataAPI, errorResponse)
    cy.findByRole('button', { name: /Fetch records/i }).click()
    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('exist')

    cy.intercept('POST', sampleDataAPI, sampleDataResponse).as('sampleDataResponse')
    cy.findByRole('button', { name: /Retry/i }).click()
    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('not.exist')

    cy.wait('@sampleDataResponse')

    cy.contains('span', validations.assign).should('be.visible')
    cy.get('input[name="sli"]').click({ force: true })
    cy.contains('span', validations.assign).should('not.exist')

    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[name="healthScore"]').click({ force: true })

    cy.contains('span', validations.riskCategory).should('exist')
    cy.contains('label', 'Errors').click()
    cy.contains('span', validations.riskCategory).should('not.exist')

    cy.contains('span', validations.assign).should('exist')
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })
    cy.contains('span', validations.assign).should('not.exist')

    cy.contains('span', validations.serviceInstanceIdentifier).should('exist')
    cy.fillField('serviceInstanceField', 'gco_service')
    cy.contains('span', validations.serviceInstanceIdentifier).should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('should be able to add GCO Health Source with existing dashboard', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.GCP, 'gcp-qa-target', 'Google Cloud Operations')

    cy.contains('span', 'product is a required field').should('be.visible')
    cy.get('input[name="product"]').click({ force: true })
    cy.contains('p', 'Cloud Metrics').click()
    cy.contains('span', 'product is a required field').should('not.exist')

    cy.intercept('GET', dashboardsAPI, errorResponse).as('dashboardsErrorResponse')

    cy.contains('span', 'Next').click()

    cy.wait('@dashboardsErrorResponse')
    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('be.visible')

    cy.intercept('GET', dashboardsAPI, dashboardsResponse).as('dashboardsResponse')

    cy.findByRole('button', { name: /Retry/i }).click()

    cy.wait('@dashboardsResponse')
    cy.contains('p', 'TestDashboard').click()

    cy.intercept('GET', metricPackAPI, metricPackResponse)
    cy.intercept('GET', dashboardDetailsAPI, dashboardDetailsResponse)

    cy.findAllByRole('button', { name: /Next/g }).last().click()

    cy.contains('h3', 'Query Specifications').should('be.visible')

    cy.intercept('POST', sampleDataAPI, sampleDataResponse).as('sampleDataResponse')
    cy.findByRole('button', { name: /Fetch records/i }).click()

    cy.wait('@sampleDataResponse')
    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('span', validations.assign).should('be.visible')
    cy.get('input[name="sli"]').click({ force: true })
    cy.contains('span', validations.assign).should('not.exist')

    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[name="healthScore"]').click({ force: true })

    cy.contains('span', validations.riskCategory).should('exist')
    cy.contains('label', 'Errors').click()
    cy.contains('span', validations.riskCategory).should('not.exist')

    cy.contains('span', validations.assign).should('exist')
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })
    cy.contains('span', validations.assign).should('not.exist')

    cy.contains('span', validations.serviceInstanceIdentifier).should('exist')
    cy.fillField('serviceInstanceField', 'gco_service')
    cy.contains('span', validations.serviceInstanceIdentifier).should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('should be able to add GCO Health Source with Cloud Logs', () => {
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.GCP, 'gcp-qa-target', 'Google Cloud Operations')

    cy.contains('span', 'product is a required field').should('be.visible')
    cy.get('input[name="product"]').click({ force: true })
    cy.contains('p', 'Cloud Logs').click()
    cy.contains('span', 'product is a required field').should('not.exist')

    cy.intercept('GET', dashboardsAPI, errorResponse).as('dashboardsErrorResponse')

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mappings').should('be.visible')

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('span', validations.query).should('be.visible')
    cy.fillField('query', '{}')
    cy.contains('span', validations.query).should('not.exist')

    cy.contains('p', 'Submit query to see records from Stackdriver Logs').should('be.visible')

    cy.intercept('POST', logSampleDataAPI, errorResponse)
    cy.findByRole('button', { name: /Fetch records/i }).click()

    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('exist')

    cy.intercept('POST', logSampleDataAPI, logSampleDataResponse)
    cy.findByRole('button', { name: /Retry/i }).click()

    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('not.exist')

    cy.contains('span', validations.serviceInstance).should('be.visible')
    cy.findByRole('button', { name: /Select path for service instance/i }).click()
    cy.contains('p', 'Select path for service instance').should('be.visible')
    cy.contains('span', 'logName').click()
    cy.contains('span', validations.serviceInstance).should('not.exist')

    cy.contains('span', 'Message Identifier is required.').should('be.visible')
    cy.findByRole('button', { name: /Select path for message identifier/i }).click()
    cy.contains('p', 'Select path for message identifier').should('be.visible')
    cy.contains('span', 'cluster_name').click()
    cy.contains('span', 'Message Identifier is required.').should('not.exist')

    cy.findByRole('button', { name: /Add Query/i }).click()

    cy.fillField('query', '{}')
    cy.intercept('POST', logSampleDataAPI, logSampleDataResponse)
    cy.findByRole('button', { name: /Fetch records/i }).click()

    cy.contains('p', 'Submit query to see records from Stackdriver Logs').should('not.exist')

    cy.findByRole('button', { name: /Select path for service instance/i }).click()
    cy.contains('p', 'Select path for service instance').should('be.visible')
    cy.contains('span', 'logName').click()

    cy.findByRole('button', { name: /Select path for message identifier/i }).click()
    cy.contains('p', 'Select path for message identifier').should('be.visible')
    cy.contains('span', 'cluster_name').click()

    cy.findByRole('button', { name: /Submit/i }).click()

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service created').should('be.visible')
  })

  it('should be able to edit an existing GCO health source', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', monitoredService)

    cy.wait(2000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.contains('div', 'Google Cloud Operations').click()

    cy.intercept('POST', logSampleDataAPI, logSampleDataResponse)
    cy.findByRole('button', { name: /Next/i }).click()

    cy.findByRole('button', { name: /Submit/i }).click()

    // Creating the monitored service.
    cy.findByRole('button', { name: /Save/i }).click()
    cy.findByText('Monitored Service updated').should('be.visible')
  })

  it('should be able to edit an existing GCO health source with a Dashboard query', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', monitoredService)

    cy.wait(2000)

    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit service').click()

    cy.contains('div', 'GCO Dashboard').click()

    cy.intercept('GET', dashboardsAPI, dashboardsResponse).as('dashboardsResponse')

    cy.findByRole('button', { name: /Next/i }).click()

    cy.intercept('GET', dashboardDetailsAPI, dashboardDetailsResponse)

    cy.wait('@dashboardsResponse')
    cy.findAllByRole('button', { name: /Next/g }).last().click()
    cy.get('textarea[name="query"]').should('not.be.empty')

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('div', 'GCO Metric').click()
    cy.get('.Card--selected [data-icon="service-stackdriver"]').should('be.visible')

    cy.findByRole('button', { name: /Next/i }).click()

    cy.get('textarea[name="query"]').should('not.be.empty')
  })
})
describe('GCO metric thresholds', () => {
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
    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', monitoredService)
    cy.intercept('GET', dashboardsAPI, dashboardsResponse).as('dashboardsResponse')
    cy.intercept('GET', metricPackAPI, metricPackResponse)

    cy.populateDefineHealthSource(Connectors.GCP, 'gcp-qa-target', 'Google Cloud Operations')

    cy.get('input[name="product"]').click({ force: true })
    cy.contains('p', 'Cloud Metrics').click()

    cy.findByRole('button', { name: /Next/i }).click()

    cy.wait('@dashboardsResponse')

    cy.findAllByRole('button', { name: /Next/i }).last().click()

    cy.contains('span', '+ Manually input query').click()

    cy.get('input[name="metricName"]').clear()

    cy.contains('h4', 'Add your Google Cloud Operations query').should('be.visible')
    cy.fillField('metricName', 'GCO Metric')
    cy.get('.ManualInputModal button[type="submit"]').click()

    cy.contains('span', 'Continuous Verification').click()

    cy.contains('.Accordion--label', 'Advanced (Optional)').scrollIntoView().should('exist')
  })

  it('should render metric thresholds and perform its features', () => {
    cy.intercept('GET', '/cv/api/monitored-service/service1_env1?*', monitoredService)
    cy.intercept('GET', dashboardsAPI, dashboardsResponse).as('dashboardsResponse')
    cy.intercept('GET', metricPackAPI, metricPackResponse)

    cy.addNewMonitoredServiceWithServiceAndEnv()
    cy.populateDefineHealthSource(Connectors.GCP, 'gcp-qa-target', 'Google Cloud Operations')

    cy.get('input[name="product"]').click({ force: true })
    cy.contains('p', 'Cloud Metrics').click()

    cy.findByRole('button', { name: /Next/i }).click()

    cy.wait('@dashboardsResponse')

    cy.findAllByRole('button', { name: /Next/i }).last().click()

    cy.contains('span', '+ Manually input query').click()

    cy.get('input[name="metricName"]').clear()

    cy.contains('h4', 'Add your Google Cloud Operations query').should('be.visible')
    cy.fillField('metricName', 'GCO Metric')
    cy.get('.ManualInputModal button[type="submit"]').click()

    cy.contains('h3', 'Query Specifications').should('be.visible')

    cy.contains('span', 'Continuous Verification').click({ force: true })

    cy.contains('span', '+ Manually input query').click()

    cy.contains('h4', 'Add your Google Cloud Operations query').should('be.visible')

    cy.get('.ManualInputModal input[name="metricName"]').should('exist')
    cy.get('.ManualInputModal input[name="metricName"]').type('GCO Metric 2')
    cy.get('.ManualInputModal button[type="submit"]').click()

    cy.contains('.Accordion--label', 'Advanced (Optional)').should('exist')

    cy.findByTestId('AddThresholdButton').click()

    cy.contains('div', 'Ignore Thresholds (1)').should('exist')

    cy.get("input[name='ignoreThresholds.0.metricType']").should('be.disabled')
    cy.get("input[name='ignoreThresholds.0.metricType']").should('have.value', 'Custom')

    // validations
    cy.findByRole('button', { name: /Submit/i }).click()

    cy.findAllByText('Required').should('have.length', 3)

    cy.get("input[name='ignoreThresholds.0.metricName']").click()

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'GCO Metric')

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

    cy.get('.Select--menuItem:nth-child(1)').should('have.text', 'GCO Metric')

    cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('be.disabled')

    cy.get("input[name='failFastThresholds.0.spec.action']").click()
    cy.contains('p', 'Fail after multiple occurrences').click()
    cy.get("input[name='failFastThresholds.0.spec.spec.count']").should('not.be.disabled')
    cy.get("input[name='failFastThresholds.0.spec.spec.count']").type('4')

    cy.get("input[name='failFastThresholds.0.criteria.spec.greaterThan']").type('21')
    cy.get("input[name='failFastThresholds.0.criteria.spec.lessThan']").type('78')
  })
})
