import { metricPackResponse } from '../../../support/85-cv/monitoredService/health-sources/AppDynamics/constants'

import {
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import { Connectors } from '../../../utils/connctors-utils'
import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  awsRegionsCall,
  awsRegionsResponse,
  longInvalidName,
  metricPackCall,
  monitoredServicePostCall
} from '../../../support/85-cv/monitoredService/health-sources/CloudWatch/constants'

describe('Cloud watch health source without feature flag enabled tests', () => {
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

  it('should not render Cloud watch health source type, if the feature flag is disabled', () => {
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    cy.contains('span', 'Add New Health Source').click()

    cy.findByText(/CloudWatch/).should('not.exist')
  })
})

describe('Cloud watch health source', () => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'SRM_ENABLE_HEALTHSOURCE_CLOUDWATCH_METRICS',
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

  it('should render Cloud watch health source type, if the feature flag is enabled', () => {
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    // cy.populateDefineHealthSource(Connectors.AWS, 'cloudWatchTest', 'CloudWatch Metrics')
    cy.contains('span', 'Add New Health Source').click()

    cy.findByText(/CloudWatch/).should('exist')

    cy.get('input[name="healthSourceName"]').clear().type(longInvalidName)

    cy.findByText(/Limit of 63 characters is reached for Health Source Name/).should('exist')
  })

  it('should add cloud watch health source, if correct values are given', () => {
    cy.intercept('GET', metricPackCall, metricPackResponse).as('MetricPackCall')
    cy.intercept('GET', awsRegionsCall, awsRegionsResponse).as('regionsCall')

    cy.addNewMonitoredServiceWithServiceAndEnv()

    cy.populateDefineHealthSource(Connectors.AWS, 'testAWS', 'CloudWatch Metrics')
    cy.contains('span', 'Next').click({ force: true })

    cy.wait('@regionsCall')

    cy.get('input[name="region"]').click()
    cy.contains('p', 'region 1').click({ force: true })

    cy.findByTestId(/addCustomMetricButton/).should('not.be.disabled')

    cy.findByTestId(/addCustomMetricButton/).click()

    cy.findByTestId(/addCustomMetricButton/).should('be.disabled')

    cy.get('input[name="customMetrics.0.metricName"]').should('have.value', 'customMetric 1')

    cy.get('textarea[name="customMetrics.0.expression"]').type('SELECT *')

    cy.get('input[name="customMetrics.0.groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.get('input[name="customMetrics.0.groupName"]').should('have.value', 'group 1')

    cy.contains('div', 'Assign').scrollIntoView().click({ force: true })
    cy.get('input[name="customMetrics.0.sli.enabled"]').click({ force: true })

    cy.findByText(/Risk Category/).should('not.exist')
    cy.findByText(/Deviation Compared to Baseline/).should('not.exist')
    cy.findByText(/Service Instance Identifier/).should('not.exist')

    cy.get('input[name="customMetrics.0.analysis.liveMonitoring.enabled"]').click({ force: true })

    cy.findByText(/Service Instance Identifier/).should('not.exist')

    cy.get('input[name="customMetrics.0.analysis.deploymentVerification.enabled"]').click({ force: true })

    cy.findByText(/Risk Category/).should('exist')
    cy.findByText(/^Deviation Compared to Baseline$/).should('exist')

    cy.findByText(/Errors\/Number of Errors/).should('exist')
    cy.findByText(/Errors\/Number of Errors/).click()

    cy.findByText(/Higher value is higher risk/).should('exist')
    cy.findByText(/Higher value is higher risk/).click()

    cy.findByText(/Service Instance Identifier/).should('exist')

    cy.get('input[name="customMetrics.0.responseMapping.serviceInstanceJsonPath"]').type('test path')

    cy.findByRole('button', { name: /Submit/i }).click()

    // ✍🏻 Edit

    cy.findByText(/CloudWatch Metrics/).click()

    cy.get('span[data-icon="service-aws"]').should('exist')

    cy.get('input[name="healthSourceName"]').should('have.value', 'CloudWatch Metrics')

    cy.wait(100)

    cy.contains('span', 'Next').click({ force: true })

    cy.wait(100)

    cy.contains('p', 'AWS Region').should('exist')

    cy.get('input[name="customMetrics.0.groupName"]').should('have.value', 'group 1')
    cy.get('input[name="customMetrics.0.metricName"]').should('have.value', 'customMetric 1')
    cy.get('textarea[name="customMetrics.0.expression"]').should('have.value', 'SELECT *')
    cy.contains('div', 'Assign').scrollIntoView().click({ force: true })

    cy.get('input[name="customMetrics.0.sli.enabled"]').should('be.checked')

    cy.get('input[name="customMetrics.0.analysis.liveMonitoring.enabled"]').should('be.checked')

    cy.get('input[name="customMetrics.0.analysis.higherBaselineDeviation"]').scrollIntoView().should('be.checked')

    // ➕ Adding custom metric

    cy.findByTestId(/addCustomMetricButton/).click()

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.get('input[name="customMetrics.1.metricName"]').should('have.value', 'customMetric 2')

    cy.get('input[name="customMetrics.1.metricName"]').clear().type('customMetric 1')

    cy.contains('div', 'Assign').scrollIntoView().click({ force: true })

    cy.findByText(/Metric identifier must be unique./).should('exist')
    cy.findByText(/Group Name is required./).should('exist')
    cy.findByText(/Expression is required/).should('exist')
    cy.findByText(/One selection is required./).should('exist')

    cy.get('input[name="customMetrics.1.metricName"]').type('customMetric 2')

    cy.get('span[data-icon="main-delete"]').eq(1).click({ force: true })

    cy.findByText(/customMetric 2/).should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.intercept('POST', monitoredServicePostCall).as('monitoredServicePostCall')

    cy.findByRole('button', { name: /Save/i }).click()

    cy.wait('@monitoredServicePostCall').then(intercept => {
      const { sources } = intercept.request.body

      // Response assertion
      expect(sources?.healthSources?.[0]?.type).equals('CloudWatchMetrics')
      expect(sources?.healthSources?.[0]?.name).equals('CloudWatch Metrics')
      expect(sources?.healthSources?.[0]?.identifier).equals('CloudWatch_Metrics')
      expect(sources?.healthSources?.[0]?.spec?.region).equals('region 1')
      expect(sources?.healthSources?.[0]?.spec?.connectorRef).equals('testAWS')
      expect(sources?.healthSources?.[0]?.spec?.feature).equals('CloudWatch Metrics')
      expect(sources?.healthSources?.[0]?.spec?.metricDefinitions?.[0]?.expression).equals('SELECT *')
      expect(sources?.healthSources?.[0]?.spec?.metricDefinitions?.[0]?.groupName).equals('group 1')
      expect(sources?.healthSources?.[0]?.spec?.metricDefinitions?.[0]?.identifier).equals('customMetric_1')
      expect(sources?.healthSources?.[0]?.spec?.metricDefinitions?.[0]?.metricName).equals('customMetric 1')
    })
  })
})
