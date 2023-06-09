/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getArtifactsArtifactoryImagePaths, getArtifactsArtifactoryRepositoriesDetails } from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

describe('Artifactory Registry Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    const artifactTypeCy = 'Artifact_Artifactory'
    const connectorId = 'testAWS'
    const triggerName = 'Artifactory Trigger'

    describe('1:Repository Format = Generic', () => {
      beforeEach(() => {
        cy.intercept('GET', getArtifactsArtifactoryRepositoriesDetails({ connectorId, repositoryType: 'generic' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Artifactory_Repositories_Details.json'
        }).as('getArtifactsArtifactoryRepositoriesDetails')
      })
      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').click()
        cy.contains('p', 'Generic').click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getArtifactsArtifactoryRepositoriesDetails')
        cy.get('input[name="repository"]').clear().type('lambda')
        cy.contains('p', 'lambda').click()
        cy.get('input[name="artifactDirectory"]').clear().type('/test-artifact-directory')
      }
      it('1.1:  Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Artifactory_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: ArtifactoryRegistry\n      spec:\n        repositoryFormat: generic\n        repository: lambda\n        artifactPath: <+trigger.artifact.build>\n        artifactDirectory: /test-artifact-directory\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
        })
      })
      it('1.2: InputSetRefs', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          inputSetRefs: ['inputset1', 'inputset2'],
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Artifactory_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: ArtifactoryRegistry\n      spec:\n        repositoryFormat: generic\n        repository: lambda\n        artifactPath: <+trigger.artifact.build>\n        artifactDirectory: /test-artifact-directory\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
        })
      })
    })
    describe('2:Repository Format = Docker', () => {
      const repository = 'lambda'
      beforeEach(() => {
        cy.intercept('GET', getArtifactsArtifactoryRepositoriesDetails({ connectorId, repositoryType: 'docker' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Artifactory_Repositories_Details.json'
        }).as('getArtifactsArtifactoryRepositoriesDetails')

        cy.intercept('GET', getArtifactsArtifactoryImagePaths({ connectorId, repository }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Image_Paths.json'
        }).as('getArtifactsArtifactoryImagePaths')
      })
      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').click()
        cy.contains('p', 'Docker').click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getArtifactsArtifactoryRepositoriesDetails')
        cy.get('input[name="repository"]').clear().type(repository)
        cy.contains('p', repository).click()
        cy.get('input[name="artifactPath"]').focus()
        cy.wait('@getArtifactsArtifactoryImagePaths')
        cy.get('input[name="artifactPath"]').clear().type('alpine')
        cy.contains('p', 'alpine').click()
        cy.get('input[name="repositoryUrl"]').clear().type('www.test-repository-url.com')
      }
      it('2.1:  Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Artifactory_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: ArtifactoryRegistry\n      spec:\n        repositoryFormat: docker\n        repository: ${repository}\n        artifactPath: alpine\n        repositoryUrl: www.test-repository-url.com\n        tag: <+trigger.artifact.build>\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
        })
      })
      it('2.2: InputSetRefs', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          inputSetRefs: ['inputset1', 'inputset2'],
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Artifactory_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: ArtifactoryRegistry\n      spec:\n        repositoryFormat: docker\n        repository: ${repository}\n        artifactPath: alpine\n        repositoryUrl: www.test-repository-url.com\n        tag: <+trigger.artifact.build>\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
        })
      })
    })
  })
})
