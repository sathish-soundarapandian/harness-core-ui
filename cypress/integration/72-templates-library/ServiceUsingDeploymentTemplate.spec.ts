/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  serviceName,
  artifactRepoTypes,
  gitSyncEnabledCall,
  featureFlagsCall,
  servicesRoute,
  afterSaveServiceResponse,
  afterSaveServiceNameResponse,
  afterSaveServiceHeaderResponse
} from '../../support/70-pipeline/constants'
import {
  useTemplateResponse,
  afterUseTemplateListResponse,
  deploymentTemplatesListCall,
  useTemplateCall,
  afterUseTemplateListCall,
  afterSaveServiceEndpointPOST,
  afterSaveServiceNameEndpoint,
  afterSaveServiceHeaderEndpoint
} from '../../support/72-templates-library/constants'

describe('ServiceV2 - Deployment Template', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })

    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })

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
          },
          {
            uuid: null,
            name: 'NG_DEPLOYMENT_TEMPLATE',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      }).as('enableFeatureFlag')
    })

    cy.initializeRoute()

    cy.visit(servicesRoute, {
      timeout: 30000
    })
  })

  it('Create ServiceV2', () => {
    cy.intercept('POST', afterSaveServiceEndpointPOST, afterSaveServiceResponse).as('afterSaveService')
    cy.intercept('GET', afterSaveServiceNameEndpoint, afterSaveServiceNameResponse).as('afterSaveServiceName')
    cy.intercept('GET', afterSaveServiceHeaderEndpoint, afterSaveServiceHeaderResponse).as('afterSaveServiceHeader')
    cy.intercept('POST', deploymentTemplatesListCall, { fixture: '/ng/api/deploymentTemplateList' }).as('templateList')

    cy.intercept('GET', useTemplateCall, useTemplateResponse).as('useTemplate')
    cy.intercept('POST', afterUseTemplateListCall, afterUseTemplateListResponse).as('afterUseTemplateList')

    cy.visitPageAssertion('[id*="serviceLandingPageTabs_manageServices"]')
    cy.get('div[id*="serviceLandingPageTabs_manageServices"]').click({ force: true })
    cy.contains('span', 'New Service').should('be.visible').click()
    cy.fillField('name', serviceName)
    cy.contains('span', 'Save').click()
    cy.contains('span', 'Service created successfully').should('be.visible')

    cy.contains('p', 'Deployment Template').should('be.visible').click()
    cy.contains('p', 'dep temp test').should('be.visible').click()
    cy.contains('span', 'Use Template').should('be.visible').click()
    cy.contains('span', 'Add Primary Artifact').should('be.visible').click()

    cy.get('[class*="ArtifactConnector-module_wrapping_sbruUF"]').within(() => {
      artifactRepoTypes.forEach(item => {
        cy.contains('p', item).should('be.visible')
      })
    })

    cy.get('span[icon="small-cross"]').should('be.visible').click()
    cy.contains('span', 'Save').should('be.visible').click()
    cy.contains('span', 'Service updated successfully').should('be.visible')
  })
})
