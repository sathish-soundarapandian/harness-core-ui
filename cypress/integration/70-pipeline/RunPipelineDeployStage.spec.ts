/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  gitSyncEnabledCall,
  cdFailureStrategiesYaml,
  invalidYAMLErrorMsgOnEmptyStageSave,
  pipelineSaveCallWithStoreType
} from '../../support/70-pipeline/constants'

describe('RUN PIPELINE MODAL - deploy stage', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    switch (Cypress.currentTest.title) {
      case 'error validations on pipeline save from API':
        break
      default:
        cy.createDeploymentStage()
        break
    }

    cy.intercept('GET', cdFailureStrategiesYaml, { fixture: 'pipeline/api/pipelines/failureStrategiesYaml' }).as(
      'cdFailureStrategiesYaml'
    )
  })

  it('should display the delete pipeline stage modal', () => {
    cy.wait(2000)
    cy.get('[icon="play"]').click({ force: true })
    cy.wait(2000)
    cy.contains('p', 'testStage_Cypress').trigger('mouseover')
    cy.get('[icon="cross"]').click({ force: true })
    cy.contains('p', 'Delete Pipeline Stage').should('be.visible')
    cy.contains('span', 'Delete').click({ force: true })
    cy.contains('span', 'Pipeline Stage Successfully removed.').should('be.visible')
  })

  it('error validations on pipeline save from API', () => {
    cy.intercept('POST', pipelineSaveCallWithStoreType, { fixture: 'pipeline/api/pipelines.post.emptyPipeline' }).as(
      'pipelineSave'
    )
    cy.wait(1000)
    cy.contains('div', 'Unsaved changes').should('be.visible')
    cy.contains('span', 'Save').click({ force: true })
    cy.wait('@pipelineSave')

    cy.contains('span', 'Invalid request: Field for key [stages] does not exist').should('be.visible')
    cy.intercept('POST', pipelineSaveCallWithStoreType, { fixture: 'pipeline/api/pipelines.post.emptyStage' }).as(
      'pipelineSaveStage'
    )
    cy.createDeploymentStage()
    cy.wait(1000)
    cy.contains('span', 'Save').click({ force: true })
    cy.wait('@pipelineSaveStage')

    cy.contains('span', 'Invalid yaml: $.pipeline.stages[0].stage.spec.execution: is missing but it is required')
      .should('be.visible')
      .invoke('text')
      .then(text => {
        expect(text).equal(invalidYAMLErrorMsgOnEmptyStageSave)
      })
  })
})
