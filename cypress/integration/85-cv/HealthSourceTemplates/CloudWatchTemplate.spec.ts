import {
  countOfServiceAPI,
  monitoredServiceListCall,
  monitoredServiceListResponse,
  riskCategoryMock
} from '../../../support/85-cv/monitoredService/constants'
import { Connectors } from '../../../utils/connctors-utils'
import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  awsRegionsCall,
  awsRegionsResponse,
  riskCategoryCall
} from '../../../support/85-cv/monitoredService/health-sources/CloudWatch/constants'

describe('CloudWatch templates', () => {
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
          },
          {
            uuid: null,
            name: 'CVNG_TEMPLATE_MONITORED_SERVICE',
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

    cy.visitSRMTemplate()
  })

  it('should render Cloud watch templates and its features', () => {
    cy.intercept('GET', riskCategoryCall, riskCategoryMock).as('riskCategoryCall')
    cy.intercept('GET', awsRegionsCall, awsRegionsResponse).as('regionsCall')

    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('CloudWatch template', '1')
    cy.setServiceEnvRuntime()

    cy.populateDefineHealthSource(Connectors.AWS, 'testAWS', 'CloudWatch Metrics')

    cy.contains('span', 'Next').click({ force: true })

    cy.wait('@regionsCall')

    cy.get('input[name="region"]').click()
    cy.contains('p', 'region 1').click({ force: true })

    cy.findByTestId(/addCustomMetricButton/).should('not.be.disabled')

    cy.findByTestId(/addCustomMetricButton/).click()

    cy.findByTestId(/addCustomMetricButton/).should('be.disabled')

    cy.get('input[name="customMetrics.0.groupName"]').click()
    cy.contains('p', '+ Add New').click({ force: true })
    cy.get('.bp3-overlay input[name="name"]').type('group 1')
    cy.get('.bp3-overlay button[type="submit"]').click({ force: true })

    cy.get('.bp3-label[for="customMetrics.0.expression"] button').click({ force: true })

    cy.findByText('Runtime input').click({ force: true })

    cy.contains('div', 'Assign').scrollIntoView().click({ force: true })

    cy.get('input[name="customMetrics.0.analysis.deploymentVerification.enabled"]').click({ force: true })

    cy.findByText(/Risk Category/).should('exist')
    cy.findByText(/^Deviation Compared to Baseline$/).should('exist')

    cy.findByText(/Performance\/Other/).should('exist')
    cy.findByText(/Performance\/Other/).click()

    cy.findByText(/Higher value is higher risk/).should('exist')
    cy.findByText(/Higher value is higher risk/).click()

    cy.findByText(/Service Instance Identifier/).should('exist')

    cy.get('.bp3-label[for="customMetrics.0.responseMapping.serviceInstanceJsonPath"] + div button').click({
      force: true
    })

    cy.findByText('Runtime input').click({ force: true })

    cy.findByRole('button', { name: /Submit/i }).click()

    cy.intercept('POST', '/template/api/templates/applyTemplates?*').as('templateSave')

    cy.findByText('Save').click()

    cy.get('.bp3-dialog').findByRole('button', { name: /Save/i }).click()

    cy.wait('@templateSave').then(intercept => {
      const { originalEntityYaml } = intercept.request.body

      // Response assertion
      expect(originalEntityYaml).contains(`expression: <+input>`)
      expect(originalEntityYaml).contains(`serviceInstanceJsonPath: <+input>`)
      expect(originalEntityYaml).contains(`serviceRef: <+input>`)
      expect(originalEntityYaml).contains(`environmentRef: <+input>`)
    })
  })
})
