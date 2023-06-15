import { pageHeaderClassName, featureFlagsCall } from '../../support/70-pipeline/constants'
import {
  environmentConfigurationCall,
  infrastructureDetailsDrawerRoute,
  infrastructureListCall
} from '../../support/75-cd/constants'
const accountLicense = 'ng/api/licenses/account?routingId=accountId&accountIdentifier=accountId'

describe('Infrastructure Details Drawer', () => {
  beforeEach(() => {
    cy.intercept('GET', accountLicense, { fixture: 'pipeline/api/approvals/accountLicense' })
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'NG_SVC_ENV_REDESIGN',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })

    cy.initializeRoute()
    cy.visit(infrastructureDetailsDrawerRoute, {
      timeout: 30000
    })
  })

  it('Editing even a single letter shows unsaved changes', () => {
    cy.intercept('GET', environmentConfigurationCall, {
      fixture: 'ng/api/environmentConfiguration/environmentConfiguration.json'
    })
    cy.intercept('GET', infrastructureListCall, {
      fixture: 'ng/api/infrastructureDetailsDrawer/infrastructuresList.json'
    })
    cy.wait(3000)
    cy.visitPageAssertion(pageHeaderClassName)

    cy.contains('p', 'Infra 1').click()
    cy.contains('div[data-name="toggle-option-two"]', 'YAML').click()

    cy.contains('button[type="button"]', 'Edit YAML').click()

    cy.get('.react-monaco-editor-container')
      .click()
      .get('div[class="view-lines"]')
      .within(() => {
        cy.contains('<+input>').should('be.visible')
        cy.contains('span', 'infraNS').should('be.visible').type('{end}{backspace}')
      })

    cy.contains('Unsaved changes').should('be.visible').click()

    cy.get('.bp3-dialog').within(() => {
      cy.get('.editor.modified')
        .should('not.contain', 'infraNS')
        .within(() => {
          cy.contains('span', 'infraN').should('be.visible')
        })

      cy.get('.editor.original').within(() => {
        cy.contains('span', 'infraNS').should('be.visible')
      })
    })
  })
})
