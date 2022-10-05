/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { templatesListRoute, gitSyncEnabledCall, pipelinesRoute } from '../../support/70-pipeline/constants'
import {
  versionLabel,
  pipelineTemplateName,
  pipelineMadeFromTemplate,
  incompleteTemplateCreationResponse,
  pipelineTemplatePublishResponse,
  selectedPipelineTemplateResponse,
  applyTemplateResponse,
  selectedTemplateListFromPipeline,
  templateListCallAfterSelectionResponse,
  afterUseTemplateEndpointResponse,
  afterUseTemplatePipelineTemplateNameResponse,
  afterUseTemplateApplyTemplateResponse,
  afterUseTemplatePipelineTemplateInputsResponse
} from '../../support/72-templates-library/constants'

describe('Pipeline Template creation and assertion', () => {
  const templateDetailsCall =
    '/template/api/templates/templateInputs/testPipelineTemplate?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&versionLabel=v1.0&getDefaultFromOtherRepo=true'
  const pipelineTemplatePublishCall =
    '/template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&getDefaultFromOtherRepo=true'
  const pipelineTemplateCreationCall =
    '/template/api/templates?accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&comments='
  const templatesListCall =
    '/template/api/templates/list?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&templateListType=Stable&searchTerm=&page=0&size=20&includeAllTemplatesAvailableAtScope=true'

  const templateListCallAfterSelection =
    '//template/api/templates/list?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&module=cd&templateListType=All'
  const applyTemplateEndpoint =
    '/template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&getDefaultFromOtherRepo=true'
  const afterUseTemplateEndPoint =
    '/template/api/templates/list?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&templateListType=Stable&getDefaultFromOtherRepo=true'
  const afterUseTemplatePipelineTemplateName =
    '/template/api/templates/testPipelineTemplate?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&versionLabel=v1.0&getDefaultFromOtherRepo=true'
  const afterUseTemplateApplyTemplateEndpoint =
    '/template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&pipelineIdentifier=Pipeline_From_Template_Test&getDefaultFromOtherRepo=true'
  const afterUseTemplatePipelineTemplateInputsEndpoint =
    '/template/api/templates/templateInputs/testPipelineTemplate?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&versionLabel=v1.0&getDefaultFromOtherRepo=true'
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.initializeRoute()
  })

  it('asserting error when creating a pipeline template', () => {
    cy.visit(templatesListRoute, {
      timeout: 30000
    })

    cy.intercept('POST', pipelineTemplateCreationCall, incompleteTemplateCreationResponse).as(
      'pipelineTemplateCreation'
    )
    cy.intercept('POST', pipelineTemplatePublishCall, pipelineTemplatePublishResponse).as('pipelineTemplatePublish')

    cy.visitPageAssertion('[class*=TemplatesPage-module_templatesPageBody]')

    cy.contains('span', 'New Template').click()
    cy.get('.bp3-menu > :nth-child(3)').click() // querying "Pipeline" in "New Template" menu and clicking it

    cy.contains('p', 'Create New Pipeline Template').should('be.visible')
    cy.contains('p', 'PIPELINE').should('be.visible') //
    //clicking "Start" without entering version label assertion
    cy.get('button[type="submit"]').click()
    cy.contains('span', 'Version Label is required').should('be.visible') //

    cy.get('input[name="name"]').clear().type(pipelineTemplateName)
    cy.get('input[name="versionLabel"]').clear().type(versionLabel)
    cy.get('button[type="submit"]').click()

    cy.contains('p', pipelineTemplateName).should('be.visible') //
    cy.contains('span', 'Unsaved changes').should('be.visible') //

    cy.contains('span', 'Save').click()
    cy.get('button[type="submit"]').click()

    cy.contains('span', 'yamlNode provided doesn not have root yaml field: pipeline').should('be.visible') //
  })
  it('create pipeline with pipeline template', () => {
    cy.intercept('POST', templatesListCall, selectedTemplateListFromPipeline).as('templateListCallPipelineTemplate')
    cy.intercept('GET', templateDetailsCall, selectedPipelineTemplateResponse).as('selectedPipelineTemplateResponse')
    cy.intercept('POST', applyTemplateEndpoint, applyTemplateResponse).as('applyTemplateCall')
    cy.intercept('POST', templateListCallAfterSelection, templateListCallAfterSelectionResponse).as(
      'templateListCallAfterSelection'
    )
    cy.intercept('POST', afterUseTemplateEndPoint, afterUseTemplateEndpointResponse).as('afterUseTemplate')
    cy.intercept('GET', afterUseTemplatePipelineTemplateName, afterUseTemplatePipelineTemplateNameResponse).as(
      'afterUseTemplatePipelineTemplateName'
    )
    cy.intercept('POST', afterUseTemplateApplyTemplateEndpoint, afterUseTemplateApplyTemplateResponse).as(
      'afterUseTemplateApplyTemplate'
    )
    cy.intercept('GET', afterUseTemplatePipelineTemplateInputsEndpoint, afterUseTemplatePipelineTemplateInputsResponse)

    cy.visit(pipelinesRoute, {
      timeout: 30000
    })
    cy.contains('span', 'Create a Pipeline').eq(0).should('be.visible')
    cy.contains('span', 'Create a Pipeline').eq(0).click()
    cy.contains('span', 'Start with Template').should('be.visible')
    cy.contains('span', 'Start with Template').click()
    cy.contains('span', 'Pipeline Name is a required field').should('be.visible')

    cy.fillField('name', pipelineMadeFromTemplate)
    cy.contains('span', 'Start with Template').click()

    cy.contains('p', 'PIPELINE').should('be.visible')
    cy.contains('p', 'PIPELINE').click({ force: true })
    cy.wait(1000)

    cy.get('p[data-testid="testPipelineTemplate"]').should('be.visible') //
    cy.contains('p', 'testPipelineTemplate').should('be.visible') //
    cy.contains('p', 'testPipelineTemplate (v1.0)').should('be.visible') //
    cy.contains('p', 'Type').should('be.visible')
    cy.contains('p', 'Tags').should('be.visible')
    cy.contains('p', 'Description').should('be.visible')
    cy.contains('p', 'Version Label').should('be.visible')
    cy.contains('p', /^Stage:/).should('have.text', 'Stage: teststage')

    cy.contains('span', 'Use Template').click()

    cy.contains('div', 'Pipeline Studio').should('be.visible')
    cy.contains('a', 'Pipeline Studio').should('be.visible')
    cy.contains('p', /^Using Template:/).should('have.text', 'Using Template: testPipelineTemplate (v1.0)')
    cy.contains('p', pipelineMadeFromTemplate).should('be.visible')
    cy.contains('div', 'Unsaved changes').should('be.visible')
    cy.contains('span', 'Run').should('be.visible')
    cy.contains('teststage').should('be.visible')
    cy.contains('p', /^Stage:/).should('have.text', 'Stage: teststage')

    cy.contains('span', 'Save').click()
    cy.contains(
      'span',
      'Invalid yaml: $.pipeline.stages[0].stage.spec.execution: is missing but it is required'
    ).should('be.visible')
  })
})
