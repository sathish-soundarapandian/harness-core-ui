/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { connectorsListNewestSort } from '../../support/35-connectors/constants'

describe('RUN PIPELINE MODAL - Jira Approval Stage', () => {
  const gitSyncCall =
    '/ng/api/git-sync/git-sync-enabled?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const stepsCall = '/pipeline/api/pipelines/v2/steps?routingId=accountId&accountId=accountId'
  const jirayamlSnippetCall = '/pipeline/api/approvals/stage-yaml-snippet?routingId=accountId&approvalType=JiraApproval'
  const jiraProjectsCall =
    '/ng/api/jira/projects?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=Jira_cloud'
  const jiraIssueTypesCall =
    'ng/api/jira/createMetadata?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&expand=projects.issuetypes&connectorRef=Jira_cloud&projectKey=ART'
  const jiraIssueTypeMetadataCall =
    'ng/api/jira/createMetadata?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&expand=projects.issuetypes.fields&connectorRef=Jira_cloud&projectKey=ART&issueType=Bug'
  const jiraStatusesCall =
    '/ng/api/jira/statuses?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=Jira_cloud'
  const accountLicense = 'ng/api/licenses/account?routingId=accountId&accountIdentifier=accountId'
  beforeEach(() => {
    cy.intercept('GET', gitSyncCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.intercept('GET', jirayamlSnippetCall, { fixture: 'pipeline/api/jiraStage/stageYamlSnippet' }).as('stageYaml')
    cy.intercept('POST', stepsCall, { fixture: 'pipeline/api/approvals/steps' })
    cy.intercept('GET', accountLicense, { fixture: 'pipeline/api/approvals/accountLicense' })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()
    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Approval').click()
    cy.fillName('JiraStageTest')
    cy.contains('p', 'Jira').click({ multiple: true })
    cy.clickSubmit()
  })

  //After adding Approval stage, add Jira
  it('should display the delete pipeline stage modal', () => {
    cy.wait('@stageYaml')
    cy.wait(1000)
    cy.get('[icon="play"]').click({ force: true, multiple: true })
    cy.wait(2000)
    cy.contains('p', 'JiraStageTest').trigger('mouseover')
    cy.get('[icon="cross"]').click({ force: true })
    cy.contains('p', 'Delete Pipeline Stage').should('be.visible')
    cy.contains('span', 'Delete').click({ force: true })
    cy.contains('span', 'Pipeline Stage Successfully removed.').should('be.visible')
  })

  describe('Jira Create Form Test', () => {
    it('Submit empty form Validations', () => {
      cy.wait('@stageYaml')
      cy.contains('span', 'Advanced').click({ force: true })
      cy.wait(1000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'Jira Create').click({ force: true })
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.contains('span', 'Apply Changes').click({ force: true })
      cy.contains('span', 'Jira Connector is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'Project is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'Issue Type is required').should('be.visible').should('have.class', 'FormError--error')
    })

    it('Submit form with empty required fields validations', () => {
      cy.intercept('POST', connectorsListNewestSort, { fixture: 'ng/api/jiraConnectors' })
      cy.intercept('GET', jiraProjectsCall, { fixture: 'ng/api/jiraProjects' })
      cy.intercept('GET', jiraIssueTypesCall, { fixture: 'ng/api/jiraIssueTypes' })
      cy.intercept('GET', jiraIssueTypeMetadataCall, { fixture: 'ng/api/jiraIssueTypesFields' }).as('issueTypeFields')
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(4000)
      cy.contains('p', 'Jira Create').click({ force: true })
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.contains('span', 'Select').click({ force: true })
      cy.contains('p', 'Jira cloudJira cloudJira cloudJira cloudJira cloudJira cloud').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.projectKey"]').click({ force: true })
      cy.contains('p', 'ART').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.issueType"]').click({ force: true })
      cy.contains('p', 'Bug').click({ force: true })
      cy.wait('@issueTypeFields')
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
      cy.contains('span', 'This is a required field').should('be.visible').should('have.class', 'FormError--error')
      cy.wait(1000)
    })

    it('Submit form after filling details', () => {
      cy.intercept('POST', connectorsListNewestSort, { fixture: 'ng/api/jiraConnectors' })
      cy.intercept('GET', jiraProjectsCall, { fixture: 'ng/api/jiraProjects' })
      cy.intercept('GET', jiraIssueTypesCall, { fixture: 'ng/api/jiraIssueTypes' })
      cy.intercept('GET', jiraIssueTypeMetadataCall, { fixture: 'ng/api/jiraIssueTypesFields' }).as('issueTypeFields')
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'Jira Create').click({ force: true })
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.contains('span', 'Select').click({ force: true })
      cy.contains('p', 'Jira cloudJira cloudJira cloudJira cloudJira cloudJira cloud').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.projectKey"]').click({ force: true })
      cy.contains('p', 'ART').click({ force: true })
      cy.wait(1000)
      cy.get('input[name="spec.issueType"]').click({ force: true })
      cy.contains('p', 'Bug').click({ force: true })
      cy.wait('@issueTypeFields')
      cy.wait(1000)
      cy.fillField('spec.selectedRequiredFields[0].value', 'Test_Description')
      cy.wait(1000)
      cy.fillField('spec.selectedRequiredFields[1].value', 'Test_Summary')
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
    })
  })

  describe('Jira Approval Form Test', () => {
    it('Submit empty form Validations', () => {
      cy.wait('@stageYaml')
      cy.contains('span', 'Advanced').click({ force: true })
      cy.wait(1000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'Jira Approval').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.contains('span', 'Apply Changes').click({ force: true })
      cy.contains('span', 'Jira Connector is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'Issue Key is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('p', 'At least one condition is required').should('be.visible')
    })

    it('Submit form after filling details', () => {
      cy.intercept('POST', connectorsListNewestSort, { fixture: 'ng/api/jiraConnectors' })
      cy.intercept('GET', jiraProjectsCall, { fixture: 'ng/api/jiraProjects' })
      cy.intercept('GET', jiraIssueTypesCall, { fixture: 'ng/api/jiraIssueTypes' })
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'Jira Approval').click()
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.get('button[data-testid="cr-field-spec.connectorRef"]').click({ force: true })
      cy.contains('p', 'Jira cloudJira cloudJira cloudJira cloudJira cloudJira cloud').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.fillField('spec.issueKey', 'TK101')
      cy.wait(1000)
      cy.contains('span', 'Add').click({ force: true })
      cy.wait(1000)
      cy.fillField('spec.approvalCriteria.spec.conditions[0].value', 'To Do')
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
    })
  })

  describe('Jira Update Form Test', () => {
    it('Submit empty form Validations', () => {
      cy.wait('@stageYaml')
      cy.contains('span', 'Advanced').click({ force: true })
      cy.wait(1000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'Jira Update').click({ force: true })
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.contains('span', 'Apply Changes').click({ force: true })
      cy.contains('span', 'Jira Connector is required').should('be.visible').should('have.class', 'FormError--error')
      cy.contains('span', 'Issue Key is required').should('be.visible').should('have.class', 'FormError--error')
    })

    it('Submit form after filling details', () => {
      cy.intercept('POST', connectorsListNewestSort, { fixture: 'ng/api/jiraConnectors' })
      cy.intercept('GET', jiraProjectsCall, { fixture: 'ng/api/jiraProjects' })
      cy.intercept('GET', jiraStatusesCall, { fixture: 'ng/api/jiraStatuses' })
      cy.wait(2000)
      cy.contains('span', 'Execution').click({ force: true })
      cy.wait(3000)
      cy.contains('p', 'Jira Update').click({ force: true })
      cy.visitPageAssertion('[class^=StepCommands]') //assert right-drawer opening
      cy.contains('span', 'Select').click({ force: true })
      cy.contains('p', 'Jira cloudJira cloudJira cloudJira cloudJira cloudJira cloud').click({ force: true })
      cy.contains('span', 'Apply Selected').click({ force: true })
      cy.wait(1000)
      cy.fillField('spec.issueKey', 'TP102')
      cy.wait(1000)
      cy.contains('span', 'Apply Changes').click({ force: true })
    })
  })
})
