/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  templatesListRoute,
  gitSyncEnabledCall,
  templatesListCall,
  templatesListCallWithListType,
  stepLibrary,
  featureFlagsCall,
  stepTemplateSchemaEndpoint
} from '../../support/70-pipeline/constants'

describe('Template Schema Validation', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncEnabledCall, {
      connectivityMode: null,
      gitSyncEnabled: false,
      gitSimplificationEnabled: false
    })
    cy.intercept('POST', templatesListCall, { fixture: 'template/api/templatesList' }).as('templatesListCall')
    cy.intercept('POST', templatesListCallWithListType, { fixture: 'template/api/templatesList' }).as(
      'templatesListCallForDrawer'
    )

    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'TEMPLATE_SCHEMA_VALIDATION',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      }).as('enableFeatureFlag')
    })
    cy.initializeRoute()
    cy.visit(templatesListRoute, {
      timeout: 30000
    })
    cy.wait(2000)
    cy.visitPageAssertion('[class*=TemplatesPage-module_templatesPageBody]')
    cy.wait('@templatesListCall', { timeout: 10000 })
  })
  it('Step Template Yaml', () => {
    cy.intercept('POST', stepLibrary, { fixture: 'ng/api/stepNg/stepLibrary' })
    cy.intercept('GET', stepTemplateSchemaEndpoint, { fixture: 'ng/api/templateYamlSchema/templateSchema' }).as(
      'templateSchemaFlow'
    )

    cy.contains('span', 'New Template').eq(0).click()
    cy.contains('p', 'Step').click()

    cy.clickSubmit()
    cy.contains('span', 'Template Name is required').should('be.visible')
    cy.contains('span', 'Version Label is required').should('be.visible')
    cy.get('input[name="name"]').type('testStep_Cypress')
    cy.get('input[name="versionLabel"]').type('1122')
    cy.clickSubmit()

    cy.get('span[data-icon="utility"]').click()
    cy.get('div[data-testid="step-card-Shell Script"]').click({ force: true })
    cy.wait(1000)

    cy.get('[data-name="toggle-option-two"]').click({ force: true })

    cy.contains('span', 'Edit YAML').click()

    cy.get('div[class="view-lines"]').should('be.visible')
    cy.contains('span', 'testStep_Cypress.yaml').should('be.visible')
    cy.contains('p', 'testStep_Cypress').should('be.visible')
    cy.contains('span', 'template').should('be.visible')
    cy.contains('span', 'name').should('be.visible')
    cy.contains('span', 'identifier').should('be.visible')
    cy.get('div[class="view-lines"]').click()

    cy.get('div[class="view-lines"]').within(() => {
      cy.get('span').filter(`:contains('testStep_Cypress')`).should('have.length', 4)

      cy.contains('span', 'project1').should('be.visible')
      cy.contains('span', 'default').should('be.visible')

      cy.contains('span', 'versionLabel').should('be.visible')
      cy.contains('span', 'projectIdentifier').should('be.visible')
      cy.contains('span', 'orgIdentifier').should('be.visible')
      cy.contains('span', 'tags').should('be.visible')
      cy.contains('span', 'timeout').should('be.visible')
      cy.contains('span', '10m').should('be.visible')
    })

    cy.get('div[class="view-lines"]').within(() => {
      cy.contains('span', 'ShellScript').type('{del}')
      cy.wait(1000)
    })
    cy.contains('span', 'Invalid').should('be.visible')
    cy.contains('span', 'Invalid').trigger('mouseover')
    cy.wait(1000)

    cy.get(`li[title^="Value is not accepted. Valid values: "]`).should('be.visible')

    cy.contains('span', 'Shellcript').type('S')
    cy.contains('span', 'Invalid').trigger('mouseout')
    cy.wait(1000)
    cy.contains('span', 'Invalid').should('not.exist')
  })
})
