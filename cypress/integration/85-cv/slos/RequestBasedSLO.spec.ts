import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  getSLOMetrics,
  getUserJourneysCall,
  listMonitoredServices,
  listMonitoredServicesCallResponse,
  listSLOMetricsCallResponse,
  listSLOsCall,
  listUserJourneysCallResponse,
  updatedListSLOsCallResponse,
  getSLORiskCount,
  saveSLO,
  getSLORiskCountResponse,
  getMonitoredService,
  getMonitoredServiceResponse,
  listMonitoredServicesForSLOs,
  listMonitoredServicesCallResponseForSLOs,
  createSloV2,
  sliMetricGraph,
  onboardingGraph
} from '../../../support/85-cv/slos/constants'

const requestBasedMockPayload = {
  name: 'SLO-1',
  type: 'Simple',
  identifier: 'SLO1',
  userJourneyRefs: ['newone'],
  orgIdentifier: 'default',
  projectIdentifier: 'project1',
  notificationRuleRefs: [],
  sloTarget: { sloTargetPercentage: 99, type: 'Rolling', spec: { periodLength: '7d' } },
  spec: {
    monitoredServiceRef: 'cvng_prod',
    healthSourceRef: 'appd_cvng_prod',
    serviceLevelIndicators: [
      {
        name: 'SLO1_https_errors_per_min',
        identifier: 'SLO1_https_errors_per_min',
        type: 'Request',
        spec: { eventType: 'Bad', metric1: 'number_of_slow_calls', metric2: 'https_errors_per_min' }
      }
    ]
  }
}

const ratioBasedMockPayload = {
  name: 'SLO-1',
  type: 'Simple',
  identifier: 'SLO1',
  userJourneyRefs: ['newone'],
  orgIdentifier: 'default',
  projectIdentifier: 'project1',
  notificationRuleRefs: [],
  sloTarget: { sloTargetPercentage: 99, type: 'Rolling', spec: { periodLength: '7d' } },
  spec: {
    monitoredServiceRef: 'cvng_prod',
    healthSourceRef: 'appd_cvng_prod',
    serviceLevelIndicators: [
      {
        name: 'SLO1_https_errors_per_min',
        identifier: 'SLO1_https_errors_per_min',
        type: 'Window',
        spec: {
          sliMissingDataType: 'Good',
          type: 'Ratio',
          spec: {
            eventType: 'Bad',
            metric1: 'number_of_slow_calls',
            metric2: 'https_errors_per_min',
            thresholdType: '<',
            thresholdValue: 2
          }
        }
      }
    ]
  }
}

describe('Request Based SLO', () => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'SRM_ENABLE_REQUEST_SLO',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })

    cy.login('test', 'test')
    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse).as('updatedListSLOsCallResponse')
    cy.intercept('GET', getSLORiskCount, getSLORiskCountResponse).as('sloRiskCountCall')
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', getMonitoredService, getMonitoredServiceResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', listMonitoredServicesForSLOs, listMonitoredServicesCallResponseForSLOs)
    cy.intercept('GET', getSLOMetrics, listSLOMetricsCallResponse)
    cy.visitChangeIntelligenceForSLOs()
  })

  it('should be able to create request based SLO by filling all the details.', () => {
    cy.intercept('POST', createSloV2).as('saveSLO')
    cy.intercept('POST', sliMetricGraph).as('sliMetricGraph')
    cy.intercept('POST', onboardingGraph).as('onboardingGraph')

    cy.contains('p', 'SLOs').click()
    cy.contains('span', 'Create SLO').click()

    // Filling details Under Name tab for SLO creation
    cy.fillName('SLO-1')

    // selecting monitored service
    cy.get('input[name="monitoredServiceRef"]').click()
    cy.contains('p', 'cvng_prod').click({ force: true })

    // selecting user journey
    cy.findByTestId('multiSelectService').click()
    cy.contains('label', 'new-one').click({ force: true })

    cy.contains('span', 'Next').click({ force: true })

    // selecting health source
    cy.get('input[name="healthSourceRef"]').click()
    cy.contains('p', 'appd_cvng_prod').click({ force: true })

    // Select Request
    cy.contains('div', 'REQUEST').click({ force: true })

    // selecting event type
    cy.get('input[name="eventType"]').click()
    cy.contains('p', 'Bad').click({ force: true })

    // selecting Metric for Good requests
    cy.get('input[name="goodRequestMetric"]').click()
    cy.contains('p', 'number_of_slow_calls').click({ force: true })

    // selecting Metric for Good requests
    cy.wait('@sliMetricGraph').then(data => {
      expect(JSON.stringify(data.request.body)).equal(JSON.stringify(['number_of_slow_calls']))
    })
    cy.get('input[name="validRequestMetric"]').click()
    cy.contains('p', 'https_errors_per_min').click({ force: true })
    cy.wait('@sliMetricGraph').then(data => {
      expect(JSON.stringify(data.request.body)).equal(JSON.stringify(['number_of_slow_calls', 'https_errors_per_min']))
    })
    cy.wait('@onboardingGraph').then(data => {
      expect(JSON.stringify({ ...data.request.body })).equal(
        JSON.stringify({
          name: 'SLO-1',
          identifier: 'SLO1',
          healthSourceRef: 'appd_cvng_prod',
          type: 'Request',
          spec: { eventType: 'Bad', metric1: 'number_of_slow_calls', metric2: 'https_errors_per_min' }
        })
      )
    })
    cy.contains('span', 'Next').click({ force: true })

    // selecting condition for SLI value
    cy.get('input[name="periodLength"]').click()
    cy.contains('p', '7').click({ force: true })

    cy.intercept('POST', saveSLO, { statusCode: 200 }).as('saveSLO')
    cy.intercept('POST', saveSLO, { statusCode: 200 })
    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse).as('updatedListSLOsCallResponse')

    cy.contains('span', 'Save').click({ force: true })
    cy.wait('@saveSLO').then(data => {
      expect(JSON.stringify({ ...data.request.body })).equal(JSON.stringify({ ...requestBasedMockPayload }))
    })

    cy.contains('span', 'SLO created successfully').should('be.visible')

    cy.wait('@updatedListSLOsCallResponse')

    cy.contains('p', 'cvng').should('be.visible')
    cy.contains('p', 'prod').should('be.visible')
    cy.contains('p', '287.00%').should('be.visible')
    cy.contains('p', '-2196.04%').should('be.visible')
    cy.contains('p', '99%').should('be.visible')
    cy.contains('p', 'UserJoruney-1').should('be.visible')
  })

  it('should be able to create time window raio based SLO by filling all the details', () => {
    cy.intercept('POST', createSloV2).as('saveSLO')
    cy.intercept('POST', sliMetricGraph).as('sliMetricGraph')
    cy.intercept('POST', onboardingGraph).as('onboardingGraph')

    cy.contains('p', 'SLOs').click()
    cy.contains('span', 'Create SLO').click()

    // Filling details Under Name tab for SLO creation
    cy.fillName('SLO-1')

    // selecting monitored service
    cy.get('input[name="monitoredServiceRef"]').click()
    cy.contains('p', 'cvng_prod').click({ force: true })

    // selecting user journey
    cy.findByTestId('multiSelectService').click()
    cy.contains('label', 'new-one').click({ force: true })

    cy.contains('span', 'Next').click({ force: true })

    // selecting health source
    cy.get('input[name="healthSourceRef"]').click()
    cy.contains('p', 'appd_cvng_prod').click({ force: true })

    // selecting event type
    cy.get('input[name="eventType"]').click()
    cy.contains('p', 'Bad').click({ force: true })

    // selecting Metric for Good requests
    cy.get('input[name="goodRequestMetric"]').click()
    cy.contains('p', 'number_of_slow_calls').click({ force: true })

    // selecting Metric for Good requests
    cy.wait('@sliMetricGraph').then(data => {
      expect(JSON.stringify(data.request.body)).equal(JSON.stringify(['number_of_slow_calls']))
    })
    cy.get('input[name="validRequestMetric"]').click()
    cy.contains('p', 'https_errors_per_min').click({ force: true })
    cy.wait('@sliMetricGraph').then(data => {
      expect(JSON.stringify(data.request.body)).equal(JSON.stringify(['number_of_slow_calls', 'https_errors_per_min']))
    })

    cy.get('input[name="objectiveValue"]').type('2')

    cy.get('input[name="objectiveComparator"]').click({ force: true })
    cy.contains('p', '<').click({ force: true })
    cy.get('input[name="SLIMissingDataType"]').first().click({ force: true })

    cy.wait('@onboardingGraph').then(data => {
      expect(JSON.stringify({ ...data.request.body })).equal(
        JSON.stringify({
          name: 'SLO-1',
          identifier: 'SLO1',
          healthSourceRef: 'appd_cvng_prod',
          type: 'Window',
          spec: {
            sliMissingDataType: 'Good',
            type: 'Ratio',
            spec: {
              eventType: 'Bad',
              metric1: 'number_of_slow_calls',
              metric2: 'https_errors_per_min',
              thresholdType: '<',
              thresholdValue: 2
            }
          }
        })
      )
    })

    cy.contains('span', 'Next').click({ force: true })

    // selecting condition for SLI value
    cy.get('input[name="periodLength"]').click()
    cy.contains('p', '7').click({ force: true })

    cy.intercept('POST', saveSLO, { statusCode: 200 }).as('saveSLO')
    cy.intercept('POST', saveSLO, { statusCode: 200 })
    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse).as('updatedListSLOsCallResponse')

    cy.contains('span', 'Save').click({ force: true })
    cy.wait('@saveSLO').then(data => {
      expect(JSON.stringify({ ...data.request.body })).equal(JSON.stringify({ ...ratioBasedMockPayload }))
    })

    cy.contains('span', 'SLO created successfully').should('be.visible')

    cy.wait('@updatedListSLOsCallResponse')

    cy.contains('p', 'cvng').should('be.visible')
    cy.contains('p', 'prod').should('be.visible')
    cy.contains('p', '287.00%').should('be.visible')
    cy.contains('p', '-2196.04%').should('be.visible')
    cy.contains('p', '99%').should('be.visible')
    cy.contains('p', 'UserJoruney-1').should('be.visible')
  })

  it('Validate switchig between Request and TimeWindow', () => {
    cy.intercept('POST', createSloV2).as('saveSLO')
    cy.intercept('POST', sliMetricGraph).as('sliMetricGraph')
    cy.intercept('POST', onboardingGraph).as('onboardingGraph')

    cy.contains('p', 'SLOs').click()
    cy.contains('span', 'Create SLO').click()

    // Filling details Under Name tab for SLO creation
    cy.fillName('SLO-1')

    // selecting monitored service
    cy.get('input[name="monitoredServiceRef"]').click()
    cy.contains('p', 'cvng_prod').click({ force: true })

    // selecting user journey
    cy.findByTestId('multiSelectService').click()
    cy.contains('label', 'new-one').click({ force: true })

    cy.contains('span', 'Next').click({ force: true })

    // selecting health source
    cy.get('input[name="healthSourceRef"]').click()
    cy.contains('p', 'appd_cvng_prod').click({ force: true })

    // select Threshold
    cy.contains('p', 'Threshold').click({ force: true })
    cy.get('input[name="validRequestMetric"]').click()
    cy.contains('p', 'https_errors_per_min').click({ force: true })
    cy.wait('@sliMetricGraph')

    cy.get('input[name="objectiveValue"]').type('2')
    cy.get('input[name="objectiveComparator"]').click({ force: true })
    cy.contains('p', '<').click({ force: true })
    cy.get('input[name="SLIMissingDataType"]').first().click({ force: true })
    cy.wait('@onboardingGraph')
    cy.contains('h6', 'Metric for valid requests ( https_errors_per_min )').should('be.visible')
    cy.contains('p', 'SLI based on the objective value').should('be.visible')

    // Select Request
    cy.contains('div', 'REQUEST').click({ force: true })
    cy.contains('h6', 'Metric for valid requests ( https_errors_per_min )').should('not.exist')
    cy.contains('p', 'SLI based on the objective value').should('not.exist')
    cy.contains('p', 'Please fill the required fields to see the SLI data').should('be.visible')
    cy.get('input[name="eventType"]').click()
    cy.contains('p', 'Bad').click({ force: true })
    cy.wait('@sliMetricGraph')
    cy.contains('h6', 'Metric for valid requests ( https_errors_per_min )').should('be.visible')
    cy.get('input[name="goodRequestMetric"]').click()
    cy.contains('p', 'https_errors_per_min').click({ force: true })
    cy.wait('@onboardingGraph')
    cy.contains('p', 'Metric for good/bad and valid requests should be different').should('be.visible')
    cy.get('input[name="goodRequestMetric"]').click()
    cy.contains('p', 'number_of_slow_calls').click({ force: true })
    cy.contains('p', 'Metric for good/bad and valid requests should be different').should('not.exist')
  })

  it('Check validation', () => {
    cy.intercept('POST', createSloV2).as('saveSLO')
    cy.intercept('POST', sliMetricGraph).as('sliMetricGraph')
    cy.intercept('POST', onboardingGraph).as('onboardingGraph')

    cy.contains('p', 'SLOs').click()
    cy.contains('span', 'Create SLO').click()

    // Filling details Under Name tab for SLO creation
    cy.fillName('SLO-1')

    // selecting monitored service
    cy.get('input[name="monitoredServiceRef"]').click()
    cy.contains('p', 'cvng_prod').click({ force: true })

    // selecting user journey
    cy.findByTestId('multiSelectService').click()
    cy.contains('label', 'new-one').click({ force: true })

    cy.contains('span', 'Next').click({ force: true })

    // selecting health source
    cy.get('input[name="healthSourceRef"]').click()
    cy.contains('p', 'appd_cvng_prod').click({ force: true })

    // Select request
    cy.contains('div', 'REQUEST').click({ force: true })
    cy.contains('span', 'Next').click({ force: true })

    cy.contains('p', 'Metric is required').should('be.visible')
    cy.contains('span', 'Metric is required').should('be.visible')
    cy.get('.FormError--error').its('length').should('eq', 3)

    // select TIME WINDOW
    cy.contains('div', 'TIME WINDOW').click({ force: true })
    cy.contains('span', 'SLI Missing data type is required').should('be.visible')
    cy.get('.FormError--error').its('length').should('eq', 6)
  })
})
