/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  newProjectLevelFreezeRoute,
  existingProjectLevelFreezeRoute,
  projLevelPostFreezeCall,
  projLevelPutFreezeCall,
  projLevelGetFreezeCall,
  multiscopeServiceCall,
  multiScopeEnvWithTypeFilterCall
} from './constants'

describe('Project Level Freeze', () => {
  beforeEach(() => {
    cy.initializeRoute()
    cy.intercept('POST', projLevelPostFreezeCall, { fixture: 'pipeline/api/freeze/createFreeze' }).as(
      'createFreezeCall'
    )
    cy.intercept('PUT', projLevelPutFreezeCall).as('updateFreezeCall')
    cy.intercept('GET', projLevelGetFreezeCall, { fixture: 'pipeline/api/freeze/getProjectLevelFreeze' })
    cy.intercept('GET', multiscopeServiceCall, { fixture: 'pipeline/api/freeze/multiScopeServiceCall' }).as(
      'multiScopeServiceCall'
    )
    cy.intercept('POST', multiScopeEnvWithTypeFilterCall, { fixture: 'pipeline/api/freeze/multiScopeEnvCall' }).as(
      'multiScopeEnvWithTypeFilterCall'
    )
  })

  it('should go to freeze creation page in Project Level and init config, and add a rule in Config Section', () => {
    // should go to freeze creation page in Project Level and init config
    cy.visit(newProjectLevelFreezeRoute, { timeout: 30000 })
    cy.visitPageAssertion('.PillToggle--item')
    cy.get('.bp3-dialog input[name="name"]')
      .should('be.visible')
      .type('project level freeze')
      .should('have.value', 'project level freeze')
    cy.get('[class*=bp3-dialog]').within(() => {
      cy.get('button[type="submit"]').click()
    })

    // Check if Header has required nodes
    cy.get('.bp3-switch span').should('not.be.checked')
    cy.get('.PillToggle--optionBtns').should('have.length', 1)
    cy.get('.PillToggle--item').should('have.length', 2)

    // Click on Freeze Config Tab
    cy.get('#bp3-tab-title_freezeWindowStudio_FREEZE_CONFIG').should('be.visible').click()
    cy.get('h4').contains('Freeze any deployments that have the following resources defined in the rules below')

    // Click on Add rule
    cy.get('button span[icon="plus"]').click()
    cy.wait(500)

    // Formik - Rules section
    cy.get('[data-testid="config-edit-mode_0"]').should('have.length', 1)

    // Fill Rule form
    cy.get('input[name="entity[0].name"]')
      .should('be.visible')
      .type('Rule Number 1')
      .should('have.value', 'Rule Number 1')
    cy.get('button span.bp3-icon-tick').click()
    cy.wait(500)

    // formik form vanishes now, and content is replaced with view layer
    cy.get('[data-testid="config-edit-mode_0"]').should('have.length', 0)
    cy.get('[data-testid="config-view-mode_0"]').should('have.length', 1)

    /*** Add another rule ***/

    cy.get('button span[icon="plus"]').click()
    cy.wait(500)
    cy.get('[data-testid="config-edit-mode_1"]').should('have.length', 1)

    cy.get('button span.bp3-icon-tick').click()
    cy.wait(500)

    // Check Validation Error
    cy.get('.FormError--error').contains('Name is required')

    cy.get('input[name="entity[1].name"]').should('be.visible').type('Rule Number 2')

    cy.get('button span.bp3-icon-tick').click()
    cy.wait(500)
    cy.get('[data-testid="config-edit-mode_1"]').should('have.length', 0)
    cy.get('[data-testid="config-view-mode_0"]').should('have.length', 1)
    cy.get('[data-testid="config-view-mode_1"]').should('have.length', 1)

    // Edit First Rule
    cy.get('[data-testid="config-view-mode_0"] button span[data-icon="Edit"]').click()
    cy.get('[data-testid="config-view-mode_0"]').should('have.length', 0)
    cy.get('[data-testid="config-edit-mode_0"]').should('have.length', 1)

    //entity[0].EnvType

    // Change env Type in First rule
    cy.get('input[name="entity[0].EnvType"]').should('be.visible').click()
    cy.get('li.Select--menuItem').should('have.length', 3).as('envTypeMenuItem')
    cy.get('@envTypeMenuItem').eq(0).should('contain.text', 'All Environments').as('typeAllEnv')
    cy.get('@envTypeMenuItem').eq(1).should('contain.text', 'Production').as('typeProd')
    cy.get('@envTypeMenuItem').eq(2).should('contain.text', 'Pre-Production').as('typePreProd')

    cy.get('@typeProd').click({ force: true })

    // Select Service
    cy.get('[data-id="entity[0].Service__0_allServices-2"] input').should('be.checked').as('allServiceCheckbox')
    cy.get('@allServiceCheckbox').click({ force: true })
    cy.get('@allServiceCheckbox').should('not.be.checked')

    cy.get('[data-testid="config-edit-mode_0"]').contains('p', 'Services').should('be.visible').click()
    cy.wait('@multiScopeServiceCall')
    cy.contains('p', 'Id: testService').should('be.visible').click()
    cy.get('button[aria-label="Apply Selected"]').click()

    // Select Env
    cy.get('[data-id="entity[0].Environment__0_allEnvironments-5"] input').should('be.checked').as('allEnvCheckbox')
    cy.get('@allEnvCheckbox').click({ force: true })
    cy.get('@allEnvCheckbox').should('not.be.checked')

    cy.get('[data-testid="config-edit-mode_0"]').contains('p', 'Environments').should('be.visible').click()
    cy.wait('@multiScopeEnvWithTypeFilterCall')
    cy.contains('p', 'Id: testEnv').should('be.visible').click()
    cy.get('button[aria-label="Apply Selected"]').click()

    // Hit Tick button
    cy.get('button span.bp3-icon-tick').click()
    cy.wait(500)
    cy.get('[data-testid="config-edit-mode_1"]').should('have.length', 0)
    cy.get('[data-testid="config-view-mode_0"]').should('have.length', 1)
    cy.get('[data-testid="config-view-mode_1"]').should('have.length', 1)

    // Go To YAML - validate YAML
    cy.contains('div[data-name="toggle-option-two"]', 'YAML').should('be.visible').click()
    cy.wait(500)
    cy.get('.view-lines div').should('have.length', 34)
    cy.contains('span', 'freeze').should('be.visible')
    cy.contains('span', 'name:').should('be.visible')
    cy.contains('span', 'project level freeze').should('be.visible')
    cy.contains('span', 'identifier').should('be.visible')
    cy.contains('span', 'project_level_freeze').should('be.visible')
    cy.contains('span', 'entityConfigs').should('be.visible')
    cy.contains('span', 'Rule Number 1').should('be.visible')
    cy.contains('span', 'entities').should('be.visible')
    cy.contains('span', 'type').should('be.visible')
    cy.contains('span', 'Service').should('be.visible')
    cy.contains('span', 'filterType').should('be.visible')
    cy.contains('span', 'EnvType').should('be.visible')
    cy.contains('span', 'Equals').should('be.visible')
    cy.contains('span', 'entityRefs').should('be.visible')
    cy.contains('span', 'Production').should('be.visible')
    cy.contains('span', 'Equals').should('be.visible')
    cy.contains('span', 'entityRefs').should('be.visible')
    cy.contains('span', 'testService').should('be.visible')
    cy.contains('span', 'testEnv').should('be.visible')
    cy.contains('span', 'status').should('be.visible')
    cy.contains('span', 'Disabled').should('be.visible')
    cy.contains('span', 'orgIdentifier').should('be.visible')
    cy.contains('span', 'default').should('be.visible')
    cy.contains('span', 'projectIdentifier').should('be.visible')
    cy.contains('span', 'project1').should('be.visible')

    // Hit Save Button
    cy.get('button span.bp3-button-text').contains('Save').click()
    cy.contains('p', 'Loading, please wait...').should('be.visible')

    // Check Save API Payload
    cy.get('@createFreezeCall').should(req => {
      cy.contains('.bp3-toast span.bp3-toast-message', 'Freeze window created successfully').should('be.visible')
      expect(req.request.method).to.equal('POST')
      expect(req.request.body).to.equal(`freeze:
  name: project level freeze
  identifier: project_level_freeze
  entityConfigs:
    - name: Rule Number 1
      entities:
        - type: Pipeline
          filterType: All
        - type: Service
          filterType: Equals
          entityRefs:
            - testService
        - type: Environment
          filterType: Equals
          entityRefs:
            - testEnv
        - type: EnvType
          filterType: Equals
          entityRefs:
            - Production
    - name: Rule Number 2
      entities:
        - type: Pipeline
          filterType: All
        - type: Service
          filterType: All
        - type: Environment
          filterType: All
        - type: EnvType
          filterType: All
  status: Disabled
  orgIdentifier: default
  projectIdentifier: project1
`)
    })

    // save and Discard buttons should be disabled by default
    cy.get('button').contains('span', 'Save').parent().should('be.disabled')
    cy.get('button').contains('span', 'Discard').parent().should('be.disabled')
  })

  it('should go render in Edit View, update fields, and submit successfully', () => {
    // should go to existing freeze studio page in Project Level
    cy.visit(existingProjectLevelFreezeRoute, { timeout: 30000 })
    cy.visitPageAssertion('.PillToggle--item')

    // save and Discard buttons should be disabled by default
    cy.get('button').contains('span', 'Save').parent().should('be.disabled')
    cy.get('button').contains('span', 'Discard').parent().should('be.disabled')

    // Should land on Config Tab
    cy.get('h4').contains('Freeze any deployments that have the following resources defined in the rules below')
    cy.get('[data-testid="config-view-mode_0"]').should('have.length', 1)
    cy.get('[data-testid="config-view-mode_1"]').should('have.length', 1)

    // Delete Rule 2
    cy.get('[data-testid="config-view-mode_1"] button span[data-icon="main-trash"]').click()
    cy.get('button').contains('span', 'Save').parent().should('not.be.disabled')
    cy.get('button').contains('span', 'Discard').parent().should('not.be.disabled')

    cy.get('button span').contains('Unsaved changes')
    cy.get('button span.bp3-button-text').contains('Save').click()
    cy.contains('p', 'Loading, please wait...').should('be.visible')

    cy.get('@updateFreezeCall').should(req => {
      cy.contains('.bp3-toast span.bp3-toast-message', 'Freeze window updated successfully').should('be.visible')
      expect(req.request.method).to.equal('PUT')
      expect(req.request.body).to.equal(`freeze:
  name: project level freeze
  identifier: project_level_freeze
  entityConfigs:
    - name: Rule Number 1
      entities:
        - type: Pipeline
          filterType: All
        - type: Service
          filterType: Equals
          entityRefs:
            - testService
        - type: EnvType
          filterType: Equals
          entityRefs:
            - Production
  status: Disabled
  orgIdentifier: default
  projectIdentifier: project1
  description: ""
`)
    })
  })
})
