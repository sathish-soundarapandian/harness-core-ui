/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  cdFailureStrategiesYaml,
  invalidYAMLErrorMsgOnEmptyStageSave,
  pipelineSaveCall
} from '../../support/70-pipeline/constants'

describe.skip('RUN PIPELINE MODAL', () => {
  const gitSyncCall =
    '/ng/api/git-sync/git-sync-enabled?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const resolvedPipelineDetailsCall =
    '/template/api/templates/applyTemplates?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&pipelineIdentifier=testPipeline_Cypress&projectIdentifier=project1&getDefaultFromOtherRepo=true'
  const pipelineVariablesCall =
    '/pipeline/api/pipelines/variables?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const servicesCall =
    '/ng/api/servicesV2?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const environmentsCall =
    '/ng/api/environmentsV2?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const connectorsCall =
    '/ng/api/connectors?accountIdentifier=accountId&type=K8sCluster&searchTerm=&projectIdentifier=project1&orgIdentifier=default'
  const yamlSnippetCall = '/pipeline/api/approvals/stage-yaml-snippet?routingId=accountId&approvalType=HarnessApproval'
  const userGroupCall = 'ng/api/aggregate/acl/usergroups?accountIdentifier=accountId&orgIdentifier=default&searchTerm='
  const stepsCall = '/pipeline/api/pipelines/v2/steps?routingId=accountId&accountId=accountId'
  const jirayamlSnippetCall = '/pipeline/api/approvals/stage-yaml-snippet?routingId=accountId&approvalType=JiraApproval'
  const jiraConnectorsCall =
    '/ng/api/connectors?accountIdentifier=accountId&type=Jira&searchTerm=&pageIndex=0&pageSize=10&projectIdentifier=project1&orgIdentifier=default'
  const jiraProjectsCall =
    '/ng/api/jira/projects?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=Jira_cloud'
  const jiraIssueTypesCall =
    'ng/api/jira/createMetadata?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=Jira_cloud&projectKey=ART'
  const jiraStatusesCall =
    '/ng/api/jira/statuses?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&connectorRef=Jira_cloud'
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()
  })

  describe('Tests close without saving dialog for pipeline', () => {
    it('should display the close without saving dialog for pipeline', () => {
      cy.contains('p', 'Pipelines').click()
      cy.contains('p', 'Close without saving?').should('be.visible')
      cy.contains('span', 'Confirm').click({ force: true })
      cy.wait(2000)
      cy.contains('span', 'Create a Pipeline').should('be.visible')
    })
  })

  describe('For deploy stage', () => {
    beforeEach(() => {
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
      cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.post.emptyPipeline' }).as(
        'pipelineSave'
      )
      cy.wait(1000)
      cy.contains('div', 'Unsaved changes').should('be.visible')
      cy.contains('span', 'Save').click({ force: true })
      cy.wait('@pipelineSave')

      cy.contains('span', 'Invalid request: Field for key [stages] does not exist').should('be.visible')
      cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.post.emptyStage' }).as(
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

    describe('Checks visual to YAML and visual to variable view parity', () => {
      beforeEach(() => {
        cy.intercept('GET', cdFailureStrategiesYaml, { fixture: 'pipeline/api/pipelines/failureStrategiesYaml' })
        cy.intercept('GET', servicesCall, { fixture: 'ng/api/servicesV2' })
        cy.intercept('GET', environmentsCall, { fixture: 'ng/api/environmentsV2' })
        cy.intercept('GET', connectorsCall, { fixture: 'ng/api/connectors' })
        cy.intercept('POST', pipelineVariablesCall, { fixture: 'pipeline/api/runpipeline/pipelines.variables' })
        cy.intercept('POST', resolvedPipelineDetailsCall, req => {
          req.continue(res => {
            res.send({
              status: 'SUCCESS',
              data: {
                mergedPipelineYaml: req.body.originalEntityYaml,
                templateReferenceSummaries: []
              },
              metaData: null,
              correlationId: 'fa9edc77-c155-42f5-b0af-93c1f0546911'
            })
          })
        })

        cy.wait(1000)

        // Service tab config
        cy.get('input[name="serviceRef"]').click({ force: true })
        cy.contains('p', 'testService').click({ force: true })
        cy.wait(1000)

        // Infrastructure tab config
        cy.contains('span', 'Infrastructure').click({ force: true })
        cy.wait(1000)
        cy.get('input[name="environmentRef"]').click({ force: true })
        cy.contains('p', 'testEnv').click({ force: true })
        cy.wait(1000)

        cy.contains('p', /^Kubernetes$/).click()
        cy.wait(1000)

        cy.contains('span', 'Select Connector').click({ force: true })
        cy.contains('p', 'test1111').click({ force: true })
        cy.contains('span', 'Apply Selected').click({ force: true })

        cy.fillField('namespace', 'cypress')
        cy.wait(1000)
      })

      it.skip('visual to YAML conversion for stage configuration', () => {
        // Toggle to YAML view

        cy.get('[data-name="toggle-option-two"]').click({ force: true })
        cy.wait(1000)

        cy.contains('div', 'Unsaved changes').should('be.visible')
        //Verify all details in YAML view
        cy.contains('span', 'testPipeline_Cypress').should('be.visible')
        cy.contains('span', 'testStage_Cypress').should('be.visible')
        cy.contains('span', 'Deployment').should('be.visible')

        cy.contains('span', 'serviceRef').should('be.visible')
        cy.contains('span', 'testService').should('be.visible')

        cy.contains('span', 'environmentRef').should('be.visible')
        cy.contains('span', 'testEnv').should('be.visible')

        cy.contains('span', 'KubernetesDirect').should('be.visible')

        cy.contains('span', 'connectorRef').should('be.visible')
        cy.contains('span', 'test1111').should('be.visible')

        cy.contains('span', 'namespace').should('be.visible')
        cy.contains('span', 'cypress').should('be.visible')
      })

      it.skip('visual to variable view for stage configuration', () => {
        // Toggle to variable view
        cy.contains('span', 'Variables').click()
        cy.wait(2000)

        cy.get('#pipeline-panel').contains('span', 'testPipeline_Cypress').should('be.visible')
        cy.get('#pipeline-panel').contains('span', 'testStage_Cypress').should('be.visible')

        cy.get('#pipeline-panel').contains('span', 'connectorRef').should('be.visible')
        cy.get('#pipeline-panel').contains('span', 'test1111').should('be.visible')

        cy.get('#pipeline-panel').contains('span', 'namespace').should('be.visible')
        cy.get('#pipeline-panel').contains('span', 'cypress').should('be.visible')
      })
    })
  })
  describe('For approval stage', () => {
    beforeEach(() => {
      cy.get('[icon="plus"]').click()
      cy.findByTestId('stage-Approval').click()
      cy.fillName('testStage')
      cy.contains('p', 'Harness Approval').click({ multiple: true })
      cy.clickSubmit()
      cy.intercept('GET', yamlSnippetCall, { fixture: 'pipeline/api/approvals/stageYamlSnippet' })
      cy.intercept('GET', userGroupCall, { fixture: 'pipeline/api/approvals/userGroup' })
      cy.intercept('POST', stepsCall, { fixture: 'pipeline/api/approvals/steps' })
    })

    it('should display the delete pipeline stage modal', () => {
      cy.intercept('GET', yamlSnippetCall, { fixture: 'pipeline/api/approvals/stageYamlSnippet' })
      cy.wait(2000)
      cy.get('[icon="play"]').click({ force: true, multiple: true })
      cy.wait(2000)
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
      cy.wait(4000)
      cy.contains('p', 'Approval').click()
      cy.wait(4000)
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
      cy.wait(4000)
      cy.contains('p', 'Approval').click()
      cy.wait(4000)
      cy.contains('p', 'Select User Group(s)').should('be.visible')
      cy.contains('p', 'Select User Group(s)').click()
      cy.wait(2000)
      cy.contains('div', 'Organization').click()
      cy.findByTestId('Checkbox-test').click({ force: true })
      cy.contains('span', 'Apply Selected').click()
      cy.contains('span', 'Apply Changes').click({ force: true })
    })

    it.skip('visual to variable view for stage configuration', () => {
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

  //After adding Approval stage, add Jira
  describe('For Approval Stage-Jira', () => {
    beforeEach(() => {
      cy.get('[icon="plus"]').click()
      cy.findByTestId('stage-Approval').click()
      cy.fillName('JiraStageTest')
      cy.contains('p', 'Jira').click({ multiple: true })
      cy.clickSubmit()
      cy.intercept('GET', jirayamlSnippetCall, { fixture: 'pipeline/api/jiraStage/stageYamlSnippet' }).as('stageYaml')
      cy.intercept('POST', stepsCall, { fixture: 'pipeline/api/approvals/steps' })
    })
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
        cy.wait(4000)
        cy.contains('p', 'Jira Create').click()
        cy.wait(4000)
        cy.contains('span', 'Apply Changes').click({ force: true })
        cy.contains('span', 'Jira Connector is required').should('be.visible').should('have.class', 'FormError--error')
        cy.contains('span', 'Project is required').should('be.visible').should('have.class', 'FormError--error')
        cy.contains('span', 'Issue Type is required').should('be.visible').should('have.class', 'FormError--error')
        cy.contains('span', 'Summary is required').should('be.visible').should('have.class', 'FormError--error')
      })

      it('Submit form after filling details', () => {
        cy.intercept('GET', jiraConnectorsCall, { fixture: 'ng/api/jiraConnectors' })
        cy.intercept('GET', jiraProjectsCall, { fixture: 'ng/api/jiraProjects' })
        cy.intercept('GET', jiraIssueTypesCall, { fixture: 'ng/api/jiraIssueTypes' })
        cy.wait(2000)
        cy.contains('span', 'Execution').click({ force: true })
        cy.wait(4000)
        cy.contains('p', 'Jira Create').click()
        cy.wait(4000)
        cy.contains('span', 'Select Connector').click({ force: true })
        cy.contains('p', 'Jira cloudJira cloudJira cloudJira cloudJira cloudJira cloud').click({ force: true })
        cy.contains('span', 'Apply Selected').click({ force: true })
        cy.wait(1000)
        cy.get('input[name="spec.projectKey"]').click({ force: true })
        cy.contains('p', 'ART').click({ force: true })
        cy.wait(1000)
        cy.get('input[name="spec.issueType"]').click({ force: true })
        cy.contains('p', 'Bug').click({ force: true })
        cy.wait(1000)
        cy.fillField('spec.summary', 'Test_Summary')
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
        cy.wait(4000)
        cy.contains('p', 'Jira Approval').click()
        cy.wait(4000)
        cy.contains('span', 'Apply Changes').click({ force: true })
        cy.contains('span', 'Jira Connector is required').should('be.visible').should('have.class', 'FormError--error')
        cy.contains('span', 'Issue Key is required').should('be.visible').should('have.class', 'FormError--error')
        cy.contains('p', 'At least one condition is required').should('be.visible')
      })

      it('Submit form after filling details', () => {
        cy.intercept('GET', jiraConnectorsCall, { fixture: 'ng/api/jiraConnectors' })
        cy.intercept('GET', jiraProjectsCall, { fixture: 'ng/api/jiraProjects' })
        cy.intercept('GET', jiraIssueTypesCall, { fixture: 'ng/api/jiraIssueTypes' })
        cy.wait(2000)
        cy.contains('span', 'Execution').click({ force: true })
        cy.wait(4000)
        cy.contains('p', 'Jira Approval').click()
        cy.wait(4000)
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
        cy.wait(4000)
        cy.contains('p', 'Jira Update').click()
        cy.wait(4000)
        cy.contains('span', 'Apply Changes').click({ force: true })
        cy.contains('span', 'Jira Connector is required').should('be.visible').should('have.class', 'FormError--error')
        cy.contains('span', 'Issue Key is required').should('be.visible').should('have.class', 'FormError--error')
      })

      it('Submit form after filling details', () => {
        cy.intercept('GET', jiraConnectorsCall, { fixture: 'ng/api/jiraConnectors' })
        cy.intercept('GET', jiraProjectsCall, { fixture: 'ng/api/jiraProjects' })
        cy.intercept('GET', jiraStatusesCall, { fixture: 'ng/api/jiraStatuses' })
        cy.wait(2000)
        cy.contains('span', 'Execution').click({ force: true })
        cy.wait(4000)
        cy.contains('p', 'Jira Update').click()
        cy.wait(4000)
        cy.contains('span', 'Select Connector').click({ force: true })
        cy.contains('p', 'Jira cloudJira cloudJira cloudJira cloudJira cloudJira cloud').click({ force: true })
        cy.contains('span', 'Apply Selected').click({ force: true })
        cy.wait(1000)
        cy.fillField('spec.issueKey', 'TP102')
        cy.wait(1000)
        cy.contains('span', 'Apply Changes').click({ force: true })
      })
    })
  })
})
