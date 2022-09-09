import { templatesListCall } from '../../../support/70-pipeline/constants'
import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse
} from '../../../support/85-cv/monitoredService/constants'
import { metricPackResponse } from '../../../support/85-cv/monitoredService/health-sources/AppDynamics/constants'
import {
  dashboardsAPI,
  dashboardsResponse,
  logSampleDataAPI,
  logSampleDataResponse,
  metricPackAPI,
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
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListResponse)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.intercept('POST', templatesListCall, { fixture: 'template/api/templatesList' }).as('templatesListCall')
    cy.visitSRMTemplate()
  })

  it('should be able to add GCO Health Source with manual query', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('AppD Template', '1')
    // set rutime
    cy.setServiceEnvRuntime()
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

    cy.get('div[class="view-lines"]').type('{}')
    cy.contains('span', 'Tags are required.').should('not.exist')

    cy.intercept('POST', sampleDataAPI, errorResponse)
    cy.findByRole('button', { name: /Fetch records/i }).click()
    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('exist')

    cy.intercept('POST', sampleDataAPI, sampleDataResponse).as('sampleDataResponse')
    cy.findByRole('button', { name: /Retry/i }).click()
    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('not.exist')

    cy.wait('@sampleDataResponse')

    cy.contains('span', 'One selection is required.').should('be.visible')
    cy.get('input[name="sli"]').click({ force: true })
    cy.contains('span', 'One selection is required.').should('not.exist')

    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[name="healthScore"]').click({ force: true })

    cy.contains('span', 'Risk Category is required.').should('exist')
    cy.contains('label', 'Errors').click()
    cy.contains('span', 'Risk Category is required.').should('not.exist')

    cy.contains('span', 'One selection is required.').should('exist')
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })
    cy.contains('span', 'One selection is required.').should('not.exist')

    cy.contains('span', 'Service Instance Identifier is required.').should('exist')
    cy.fillField('serviceInstanceField', 'gco_service')
    cy.contains('span', 'Service Instance Identifier is required.').should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()
    // Creating the template.
    cy.findByRole('button', { name: /Save/i }).click()
    // Saving modal.
    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })

  it.only('should be able to add GCO Health Source with manual runtime query', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('AppD Template', '1')
    // set rutime
    cy.setServiceEnvRuntime()
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

    cy.get('span[data-icon="fixed-input"]').first().should('be.visible').click()
    cy.get('a.bp3-menu-item').should('have.length', 3).as('valueList')
    cy.get('@valueList').eq(0).should('contain.text', 'Fixed value').as('fixedValue')
    cy.get('@valueList').eq(1).should('contain.text', 'Runtime input').as('runtimeValue')
    cy.get('@valueList').eq(2).should('contain.text', 'Expression').as('expressionValue')
    cy.get('@runtimeValue').click()

    cy.contains('span', 'One selection is required.').should('be.visible')
    cy.get('input[name="sli"]').click({ force: true })
    cy.contains('span', 'One selection is required.').should('not.exist')

    cy.get('input[name="continuousVerification"]').click({ force: true })
    cy.get('input[name="healthScore"]').click({ force: true })

    cy.contains('span', 'Risk Category is required.').should('exist')
    cy.contains('label', 'Errors').click()
    cy.contains('span', 'Risk Category is required.').should('not.exist')

    cy.contains('span', 'One selection is required.').should('exist')
    cy.get('input[name="higherBaselineDeviation"]').click({ force: true })
    cy.contains('span', 'One selection is required.').should('not.exist')

    cy.contains('span', 'Service Instance Identifier is required.').should('exist')
    cy.fillField('serviceInstanceField', 'gco_service')
    cy.contains('span', 'Service Instance Identifier is required.').should('not.exist')

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.findByText('Google Cloud Operations').click()
    cy.contains('span', 'Next').click()
    cy.findAllByRole('button', { name: /Next/g }).last().click()
    cy.get('input[name="query"]').should('have.value', '<+input>')

    cy.findByRole('button', { name: /Submit/i }).click()
    // Creating the template.
    cy.findByRole('button', { name: /Save/i }).click()
    // Saving modal.
    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })

  it('should be able to add GCO Health Source with Cloud Logs', () => {
    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('AppD Template', '1')
    // set rutime
    cy.setServiceEnvRuntime()
    cy.populateDefineHealthSource(Connectors.GCP, 'gcp-qa-target', 'Google Cloud Operations')

    cy.contains('span', 'product is a required field').should('be.visible')
    cy.get('input[name="product"]').click({ force: true })
    cy.contains('p', 'Cloud Logs').click()
    cy.contains('span', 'product is a required field').should('not.exist')

    cy.intercept('GET', dashboardsAPI, errorResponse).as('dashboardsErrorResponse')

    cy.findByRole('button', { name: /Next/i }).click()

    cy.contains('h2', 'Query Specifications and Mappings').should('be.visible')

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.contains('span', 'Query is required.').should('be.visible')
    cy.get('div[class="view-lines"]').type('{}')
    cy.contains('span', 'Query is required.').should('not.exist')

    cy.contains('p', 'Submit query to see records from Stackdriver Logs').should('be.visible')

    cy.intercept('POST', logSampleDataAPI, errorResponse)
    cy.findByRole('button', { name: /Fetch records/i }).click()

    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('exist')

    cy.intercept('POST', logSampleDataAPI, logSampleDataResponse)
    cy.findByRole('button', { name: /Retry/i }).click()

    cy.contains('p', 'Oops, something went wrong on our end. Please contact Harness Support.').should('not.exist')

    cy.contains('span', 'Service Instance is required.').should('be.visible')
    cy.findByRole('button', { name: /Select path for service instance/i }).click()
    cy.contains('p', 'Select path for service instance').should('be.visible')
    cy.contains('span', 'logName').click()
    cy.contains('span', 'Service Instance is required.').should('not.exist')

    cy.contains('span', 'Message Identifier is required.').should('be.visible')
    cy.findByRole('button', { name: /Select path for message identifier/i }).click()
    cy.contains('p', 'Select path for message identifier').should('be.visible')
    cy.contains('span', 'cluster_name').click()
    cy.contains('span', 'Message Identifier is required.').should('not.exist')

    cy.findByRole('button', { name: /Add Query/i }).click()

    cy.get('div[class="view-lines"]').type('{}')
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

    // Creating the template.
    cy.findByRole('button', { name: /Save/i }).click()
    // Saving modal.
    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()
    cy.findByText('Template published successfully').should('be.visible')
  })
})
