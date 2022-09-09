/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { environmentsCall, servicesCall, templatesListCall } from '../../../support/70-pipeline/constants'
import { featureFlagsCall } from '../../../support/85-cv/common'
import {
  countOfServiceAPI,
  environmentResponse,
  monitoredServiceListCall,
  monitoredServiceListResponse,
  servicesResponse
} from '../../../support/85-cv/monitoredService/constants'

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
    cy.intercept('POST', templatesListCall, { fixture: 'template/api/templatesList' }).as('templatesListCall')
    cy.visitSRMTemplate()
  })

  it('Add new empty monitored service ', () => {
    const applyTemplateCall =
      '/template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&getDefaultFromOtherRepo=true'
    cy.intercept('POST', applyTemplateCall, {
      fixture: 'cv/templates/emptyTemplate'
    }).as('applyTemplates')

    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('Empty Monitored Service Template', '1')
    cy.waitFor('@applyTemplates')
    cy.get('button').contains('span', 'Save').click()
    cy.contains('span', 'Service is required').should('be.visible')
    cy.contains('span', 'Environment is required').should('be.visible')

    cy.get('[data-testid="service"] input').click()
    cy.contains('p', '+ Add New').should('be.visible')
    cy.get('[data-testid="environment"] input').click()
    cy.contains('p', '+ Add New').should('be.visible')
    cy.contains('span', 'Add New Change Source').should('be.visible')
    cy.contains('span', 'Add New Health Source').should('be.visible')

    cy.setServiceEnvRuntime()
    cy.get('button').contains('span', 'Save').click()
    cy.get('[class*=bp3-dialog]').within(() => {
      cy.contains('p', 'Save Empty Monitored Service Template (1)').should('be.visible')
      cy.get('button[type="submit"]').click()
    })
    cy.contains('span', 'Template published successfully').should('be.visible')
  })

  it('Add new empty monitored environment and serviceas fixed value', () => {
    cy.intercept('GET', servicesCall, servicesResponse).as('ServiceCall')
    cy.intercept('GET', environmentsCall, environmentResponse).as('EnvCall')
    const applyTemplateCall =
      '/template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&getDefaultFromOtherRepo=true'
    cy.intercept('POST', applyTemplateCall, {
      fixture: 'cv/templates/emptyTemplate'
    }).as('applyTemplates')

    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('Empty Monitored Service Template', '1')
    cy.waitFor('@applyTemplates')
    cy.get('button').contains('span', 'Save').click()
    cy.contains('span', 'Service is required').should('be.visible')
    cy.contains('span', 'Environment is required').should('be.visible')
    cy.get('[data-testid="service"] input').click()
    cy.contains('p', 'Service 101').click({ force: true })
    cy.get('[data-testid="environment"] input').click()
    cy.contains('p', 'QA').click({ force: true })
    cy.get('button').contains('span', 'Save').click()
    cy.get('[class*=bp3-dialog]').within(() => {
      cy.contains('p', 'Save Empty Monitored Service Template (1)').should('be.visible')
      cy.get('button[type="submit"]').click()
    })
    cy.contains('span', 'Template published successfully').should('be.visible')
  })

  it('Add new empty monitored environment as fixed and service as runtime', () => {
    cy.intercept('GET', servicesCall, servicesResponse).as('ServiceCall')
    cy.intercept('GET', environmentsCall, environmentResponse).as('EnvCall')
    const applyTemplateCall =
      '/template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&getDefaultFromOtherRepo=true'
    cy.intercept('POST', applyTemplateCall, {
      fixture: 'cv/templates/emptyTemplate'
    }).as('applyTemplates')

    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('Empty Monitored Service Template', '1')
    cy.waitFor('@applyTemplates')
    cy.get('button').contains('span', 'Save').click()
    cy.contains('span', 'Service is required').should('be.visible')
    cy.contains('span', 'Environment is required').should('be.visible')
    cy.setMultiTypeService()
    cy.get('[data-testid="environment"] input').click()
    cy.contains('p', 'QA').click({ force: true })
    cy.get('button').contains('span', 'Save').click()
    cy.get('[class*=bp3-dialog]').within(() => {
      cy.contains('p', 'Save Empty Monitored Service Template (1)').should('be.visible')
      cy.get('button[type="submit"]').click()
    })
    cy.contains('span', 'Template published successfully').should('be.visible')
  })

  it('Add new empty monitored service as fixed and environment as runtime', () => {
    cy.intercept('GET', servicesCall, servicesResponse).as('ServiceCall')
    cy.intercept('GET', environmentsCall, environmentResponse).as('EnvCall')
    const applyTemplateCall =
      '/template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&getDefaultFromOtherRepo=true'
    cy.intercept('POST', applyTemplateCall, {
      fixture: 'cv/templates/emptyTemplate'
    }).as('applyTemplates')

    cy.addNewSRMTemplate()
    cy.populateTemplateDetails('Empty Monitored Service Template', '1')
    cy.waitFor('@applyTemplates')
    cy.get('button').contains('span', 'Save').click()
    cy.contains('span', 'Service is required').should('be.visible')
    cy.contains('span', 'Environment is required').should('be.visible')
    cy.get('[data-testid="service"] input').click()
    cy.contains('p', 'Service 101').click({ force: true })
    cy.setMultiTypeEnvironment()
    cy.get('button').contains('span', 'Save').click()
    cy.get('[class*=bp3-dialog]').within(() => {
      cy.contains('p', 'Save Empty Monitored Service Template (1)').should('be.visible')
      cy.get('button[type="submit"]').click()
    })
    cy.contains('span', 'Template published successfully').should('be.visible')
  })
})
