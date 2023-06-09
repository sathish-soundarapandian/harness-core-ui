/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getArtifactsJenkinsChildJobs, getArtifactsJenkinsJobPaths, getArtifactsJenkinsJobs } from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

describe('Jenkins Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    const artifactTypeCy = 'Artifact_Jenkins'
    const connectorId = 'testAWS'
    const triggerName = 'Jenkins Trigger'
    const jobName = 'AutomationQA'
    const parentJobName = 'CDTest'
    const childJobName = 'CDTest/folder1/Redis_Job'
    const artifactPath = 'function.tar.gz'

    beforeEach(() => {
      cy.intercept('GET', getArtifactsJenkinsJobs({ connectorId }), {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Jobs.json'
      }).as('getArtifactsJenkinsJobs')
    })

    describe('1: With parent job only', () => {
      const fillArtifactData = (): void => {
        cy.wait('@getArtifactsJenkinsJobs')
        cy.get('input[name="jobName"]').clear().type(jobName)
        cy.contains('p', jobName).click()
        cy.get('input[name="artifactPath"]').focus()
        cy.wait('@getArtifactsJenkinsJobPaths')
        cy.get('input[name="artifactPath"]').clear().type(artifactPath)
        cy.contains('p', artifactPath).click()
      }

      beforeEach(() => {
        cy.intercept('GET', getArtifactsJenkinsJobPaths({ connectorId, job: encodeURIComponent(jobName) }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Job_Path.json'
        }).as('getArtifactsJenkinsJobPaths')
      })

      it('1.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Jenkins_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Jenkins\n      spec:\n        connectorRef: testAWS\n        artifactPath: ${artifactPath}\n        jobName: ${jobName}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
        })
      })
      it('1.2: InputSetRefs', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          inputSetRefs: ['inputset1', 'inputset2'],
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Jenkins_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Jenkins\n      spec:\n        connectorRef: testAWS\n        artifactPath: ${artifactPath}\n        jobName: ${jobName}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
        })
      })
    })
    describe('2: With parent and child job', () => {
      const fillArtifactData = (): void => {
        cy.wait('@getArtifactsJenkinsJobs')
        cy.get('input[name="jobName"]').clear().type(parentJobName)
        cy.contains('p', parentJobName).click()
        cy.wait('@getArtifactsJenkinsChildJobs')
        cy.get('input[name="childJobName"]').clear().type(childJobName)
        cy.contains('p', childJobName).click()
        cy.get('input[name="artifactPath"]').focus()
        cy.wait('@getArtifactsJenkinsJobParentChildPaths')
        cy.get('input[name="artifactPath"]').clear().type(artifactPath)
        cy.contains('p', artifactPath).click()
      }

      beforeEach(() => {
        cy.intercept('GET', getArtifactsJenkinsChildJobs({ connectorId, parentJobName: parentJobName }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Child_Jobs.json'
        }).as('getArtifactsJenkinsChildJobs')
        cy.intercept('GET', getArtifactsJenkinsJobPaths({ connectorId, job: encodeURIComponent(childJobName) }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Job_Path.json'
        }).as('getArtifactsJenkinsJobParentChildPaths')
      })

      it('2.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Jenkins_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Jenkins\n      spec:\n        connectorRef: testAWS\n        artifactPath: ${artifactPath}\n        jobName: ${childJobName}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
        })
      })
      it('2.2: InputSetRefs', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          inputSetRefs: ['inputset1', 'inputset2'],
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Jenkins_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Jenkins\n      spec:\n        connectorRef: testAWS\n        artifactPath: ${artifactPath}\n        jobName: ${childJobName}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
        })
      })
    })
  })
})
