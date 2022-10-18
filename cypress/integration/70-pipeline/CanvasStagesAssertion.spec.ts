/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  gitSyncEnabledCall,
  testParallelNodesPipelineRoute,
  featureFlagsCall,
  canvasExecutionPipelineCall,
  canvasExecutionStageNodeCall
} from '../../support/70-pipeline/constants'

describe('Canvas Stages Assertion', () => {
  //function to drag element vertically
  function dragElementVerticallyBy(el, pageYDragAmount) {
    const rect = el[0].getBoundingClientRect()

    cy.window().then(window => {
      const pageY = rect.top + window.pageYOffset

      cy.wrap(el)
        .trigger('mousedown', {
          which: 1,
          clientX: rect.left,
          clientY: pageY,
          force: true
        })
        .trigger('mousemove', {
          clientX: rect.left,
          clientY: pageY + pageYDragAmount,
          force: true
        })
        .trigger('mousemove', { force: true }) 
        .trigger('mouseup', {
          which: 1,
          force: true
        })
    })
  }
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
          }
        ]
      }).as('enableFeatureFlag')
      cy.initializeRoute()
    })
  })
  it('Parallel Nodes Pipeline Assertion', () => {
    cy.visit(testParallelNodesPipelineRoute, {
      timeout: 30000
    })
    cy.intercept('GET', canvasExecutionPipelineCall, { fixture: 'ng/api/canvasExecutionParallelNodes.json' }).as(
      'executionPipeline'
    )
    cy.intercept('GET', canvasExecutionStageNodeCall, { fixture: 'ng/api/canvasExecutionParallelStageNodes.json' }).as(
      'canvasExecutionStageNodeResponse'
    )
    cy.wait('@executionPipeline', { timeout: 15000 })
    cy.wait('@canvasExecutionStageNodeResponse', { timeout: 15000 })
    cy.contains('div', 'testParallelNodesPipeline').should('be.visible')

    cy.contains('p', 'test1').should('be.visible')

    //dragging down the resizer
    cy.get('span[class="Resizer horizontal "]').then(el => dragElementVerticallyBy(el, 200))
    cy.contains('p', 'test2').should('be.visible')
    cy.contains('p', 'test20').should('be.visible')
    cy.contains('p', '7 more stages').should('be.visible')
    //dragging up the node 15
    cy.get('div[id="ref_test15"]').then(el => dragElementVerticallyBy(el, -350))
    cy.contains('p', 'test20').should('be.visible')
    cy.contains('p', '4 more stages').should('be.visible')
    cy.contains('p', 'test13').should('be.visible')
    cy.contains('p', 'test14').should('be.visible')
    cy.contains('p', 'test15').should('be.visible')

    //testing zoom out
    cy.get('span[data-icon="zoom-out"]').eq(0).should('be.visible').click().click()

    cy.contains('p', 'test13').scrollIntoView()
    cy.contains('p', 'test16').should('be.visible')
    cy.get('span[data-icon="zoom-out"]').eq(0).should('be.visible').click().click().click()
    cy.contains('p', 'test14').scrollIntoView()

    cy.contains('p', 'test15').should('be.visible')
    cy.contains('p', 'test16').should('be.visible')
    cy.contains('p', 'test17').should('be.visible')
    cy.contains('p', 'test18').should('be.visible')
    cy.contains('p', 'test19').should('be.visible')
    cy.contains('p', 'test20').should('be.visible')

    //testing zoom in
    cy.get('span[data-icon="zoom-in"]').eq(0).should('be.visible').click({ force: true }).click().click()
    cy.contains('p', 'test14').scrollIntoView()
    cy.contains('p', '3 more stages').should('be.visible')
  })
})
