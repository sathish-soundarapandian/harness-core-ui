/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

describe('RUN PIPELINE MODAL - approval stage', () => {
  const gitSyncCall =
    '/ng/api/git-sync/git-sync-enabled?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const resolvedPipelineDetailsCall =
    '/template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&pipelineIdentifier=testPipeline_Cypress&projectIdentifier=project1&getDefaultFromOtherRepo=true'
  const pipelineVariablesCall =
    '/pipeline/api/pipelines/v2/variables?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'

  const yamlSnippetCall = '/pipeline/api/approvals/stage-yaml-snippet?routingId=accountId&approvalType=HarnessApproval'
  const userGroupCall = 'ng/api/aggregate/acl/usergroups?accountIdentifier=accountId&orgIdentifier=default&searchTerm='
  const stepsCall = '/pipeline/api/pipelines/v2/steps?routingId=accountId&accountId=accountId'

  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.intercept('GET', yamlSnippetCall, { fixture: 'pipeline/api/approvals/stageYamlSnippet' })
    cy.intercept('GET', userGroupCall, { fixture: 'pipeline/api/approvals/userGroup' })
    cy.intercept('POST', stepsCall, { fixture: 'pipeline/api/approvals/steps' })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()
    cy.wait(1000)

    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Approval').click()
    cy.fillName('testStage')
    cy.contains('p', 'Harness Approval').click({ multiple: true })
    cy.clickSubmit()
  })

  it('should display the delete pipeline stage modal', () => {
    cy.intercept('GET', yamlSnippetCall, { fixture: 'pipeline/api/approvals/stageYamlSnippet' })
    cy.wait(2000)
    cy.get('[icon="play"]').click({ force: true, multiple: true })
    cy.wait(1000)
    cy.contains('p', 'testStage').trigger('mouseover')
    cy.get('[icon="cross"]').click({ force: true })
    cy.contains('p', 'Delete Pipeline Stage').should('be.visible')
    cy.contains('span', 'Delete').click({ force: true })
    cy.contains('span', 'Pipeline Stage Successfully removed.').should('be.visible')
  })

  it('adding step information ,apply changes without adding user groups', () => {
    // Toggle to variable view
    cy.intercept('GET', yamlSnippetCall, { fixture: 'pipeline/api/approvals/stageYamlSnippet' })
    cy.wait(2000)
    cy.contains('span', 'Advanced').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Execution').click({ force: true })
    cy.wait(3000)
    cy.contains('p', 'Approval').click()
    cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
    cy.contains('p', 'Select User Group(s)').should('be.visible')
    cy.contains('span', 'Apply Changes').click({ force: true })
    cy.contains('span', 'Atleast one user group is required').should('be.visible')
  })

  it('adding step information ,apply changes after adding groups', () => {
    // Toggle to variable view
    cy.intercept('GET', yamlSnippetCall, { fixture: 'pipeline/api/approvals/stageYamlSnippet' })
    cy.intercept('GET', userGroupCall, { fixture: 'pipeline/api/approvals/userGroup' })
    cy.wait(2000)
    cy.contains('span', 'Advanced').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Execution').click({ force: true })
    cy.wait(3000)
    cy.contains('p', 'Approval').click()
    cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
    cy.contains('p', 'Select User Group(s)').should('be.visible')
    cy.contains('p', 'Select User Group(s)').click()
    cy.wait(2000)
    cy.contains('div', 'Organization').click()
    cy.findByTestId('Checkbox-test').click({ force: true })
    cy.contains('span', 'Apply Selected').click()
    cy.contains('span', 'Apply Changes').click({ force: true })
  })

  it('visual to variable view for stage configuration', () => {
    // Toggle to variable view
    cy.intercept('POST', pipelineVariablesCall, { fixture: 'pipeline/api/runpipeline/pipelines.variables' })
    cy.intercept('POST', resolvedPipelineDetailsCall, { fixture: 'pipeline/api/approvals/getresolvedpipeline' })
    cy.wait(2000)
    cy.contains('span', 'Advanced').click({ force: true })
    cy.wait(1000)
    cy.contains('span', 'Execution').click({ force: true })
    cy.wait(2000)
    cy.contains('span', 'Variables').click()
    cy.wait(4000)

    cy.get('#pipeline-panel').contains('span', 'testPipeline_Cypress').should('be.visible')
    cy.get('#pipeline-panel').contains('span', 'testStage').should('be.visible')
  })
})
