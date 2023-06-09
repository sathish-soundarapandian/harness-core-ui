/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getNexusRepositories } from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

// TODO: Complete and verify these test after verifying the Nexus3 Artifact Trigger UI flow
describe.skip('Nexus3 Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    const artifactTypeCy = 'Artifact_Nexus3'
    const connectorId = 'testAWS'
    const triggerName = 'Nexus3 Trigger'

    describe('1: Docker Repository Format', () => {
      const repositoryFormat = 'docker'
      const repository = 'todolist'
      const artifactPath = '/test-artifact-path'

      beforeEach(() => {
        cy.intercept('POST', getNexusRepositories({ connectorId, repositoryFormat }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Repositories.json'
        }).as('getNexusRepositories')
      })

      describe('1.1: Repository Url', () => {
        const repositoryUrl = 'www.test-repository-url.com'
        const fillArtifactData = (): void => {
          cy.get('input[name="repository"]').focus()
          cy.wait('@getNexusRepositories')
          cy.get('input[name="repository"]').clear().type(repository)
          cy.contains('p', repository).click()
          cy.get('input[name="artifactPath"]').clear().type(artifactPath)
          cy.get('input[name="repositoryUrl"]').clear().type(repositoryUrl)
        }

        it('1.1.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: ${repositoryFormat}\n        repository: ${repository}\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        repositoryUrl: ${repositoryUrl}\n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
          })
        })
        it('1.1.2: InputSetRefs', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            inputSetRefs: ['inputset1', 'inputset2'],
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: ${repositoryFormat}\n        repository: ${repository}\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        repositoryUrl: ${repositoryUrl}\n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
          })
        })
      })
      describe('1.2: Repository Port', () => {
        const repositoryPort = '8080'
        const fillArtifactData = (): void => {
          cy.get('input[name="repository"]').focus()
          cy.wait('@getNexusRepositories')
          cy.get('input[name="repository"]').clear().type(repository)
          cy.contains('p', repository).click()
          cy.get('input[name="artifactPath"]').clear().type(artifactPath)
          cy.get('input[name="repositoryPortorRepositoryURL"]').check('repositoryPort', { force: true })
          cy.get('input[name="repositoryPort"]').clear().type(repositoryPort)
        }

        it('1.2.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            triggerYAML: `trigger:\n  name: Nexus3 Trigger\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: testAWS\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: docker\n        repository: todolist\n        repositoryPortorRepositoryURL: repositoryPort\n        tag: <+trigger.artifact.build>\n        repositoryUrl: ""\n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        repositoryPort: "8080"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
          })
        })
        it('1.2.2: InputSetRefs', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            inputSetRefs: ['inputset1', 'inputset2'],
            triggerYAML: `trigger:\n  name: Nexus3 Trigger\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: testAWS\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: docker\n        repository: todolist\n        repositoryPortorRepositoryURL: repositoryPort\n        tag: <+trigger.artifact.build>\n        repositoryUrl: ""\n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        repositoryPort: "8080"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
          })
        })
      })
    })
    describe.skip('2: Maven Repository Format', () => {
      const repositoryFormat = 'Maven'
      const repository = 'todolist'
      const artifactPath = '/test-artifact-path'

      beforeEach(() => {
        cy.intercept('POST', getNexusRepositories({ connectorId, repositoryFormat: 'maven' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Repositories.json'
        }).as('getNexusRepositories')
      })

      describe('1.1: Repository Url', () => {
        const repositoryUrl = 'www.test-repository-url.com'
        const fillArtifactData = (): void => {
          cy.get('input[name="repositoryFormat"]').clear().type(repositoryFormat)
          cy.contains('p', repositoryFormat).click()
          cy.get('input[name="repository"]').focus()
          cy.wait('@getNexusRepositories')
          cy.get('input[name="repository"]').clear().type(repository)
          cy.contains('p', repository).click()
          cy.get('input[name="artifactPath"]').clear().type(artifactPath)
          cy.get('input[name="repositoryUrl"]').clear().type(repositoryUrl)
        }

        it('1.1.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: ${repositoryFormat}\n        repository: ${repository}\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        repositoryUrl: ${repositoryUrl}\n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
          })
        })
        it('1.1.2: InputSetRefs', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            inputSetRefs: ['inputset1', 'inputset2'],
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: ${repositoryFormat}\n        repository: ${repository}\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        repositoryUrl: ${repositoryUrl}\n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
          })
        })
      })
      describe('1.2: Repository Port', () => {
        const repositoryPort = '8080'
        const fillArtifactData = (): void => {
          cy.get('input[name="repositoryFormat"]').clear().type(repositoryFormat)
          cy.contains('p', repositoryFormat).click()
          cy.get('input[name="repository"]').focus()
          cy.wait('@getNexusRepositories')
          cy.get('input[name="repository"]').clear().type(repository)
          cy.contains('p', repository).click()
          cy.get('input[name="artifactPath"]').clear().type(artifactPath)
          cy.get('input[name="repositoryPortorRepositoryURL"]').check('repositoryPort', { force: true })
          cy.get('input[name="repositoryPort"]').clear().type(repositoryPort)
        }

        it('1.2.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            triggerYAML: `trigger:\n  name: Nexus3 Trigger\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: testAWS\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: docker\n        repository: todolist\n        repositoryPortorRepositoryURL: repositoryPort\n        tag: <+trigger.artifact.build>\n        repositoryUrl: ""\n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        repositoryPort: "8080"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
          })
        })
        it('1.2.2: InputSetRefs', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            inputSetRefs: ['inputset1', 'inputset2'],
            triggerYAML: `trigger:\n  name: Nexus3 Trigger\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: testAWS\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: docker\n        repository: todolist\n        repositoryPortorRepositoryURL: repositoryPort\n        tag: <+trigger.artifact.build>\n        repositoryUrl: ""\n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        repositoryPort: "8080"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
          })
        })
      })
    })
    describe('3: NPM Repository Format', () => {
      const repositoryFormat = 'NPM'
      const repository = 'todolist'
      const packageName = 'test-package-name'
      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').clear().type(repositoryFormat)
        cy.contains('p', repositoryFormat).click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getNexusRepositories')
        cy.get('input[name="repository"]').clear().type(repository)
        cy.contains('p', repository).click()
        cy.get('input[name="packageName"]').clear().type(packageName)
      }

      beforeEach(() => {
        cy.intercept('POST', getNexusRepositories({ connectorId, repositoryFormat: 'npm' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Repositories.json'
        }).as('getNexusRepositories')
      })

      it('3.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: testAWS\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: npm\n        repository: todolist\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        repositoryUrl: ""\n        artifactPath: ""\n        groupId: ""\n        artifactId: ""\n        packageName: test-package-name\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
        })
      })
      it('3.2: InputSetRefs', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          inputSetRefs: ['inputset1', 'inputset2'],
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: testAWS\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: npm\n        repository: todolist\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        repositoryUrl: ""\n        artifactPath: ""\n        groupId: ""\n        artifactId: ""\n        packageName: test-package-name\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
        })
      })
    })
    describe('4: NuGet Repository Format', () => {
      const repositoryFormat = 'NuGet'
      const repository = 'todolist'
      const packageName = 'test-package-name'
      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').clear().type(repositoryFormat)
        cy.contains('p', repositoryFormat).click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getNexusRepositories')
        cy.get('input[name="repository"]').clear().type(repository)
        cy.contains('p', repository).click()
        cy.get('input[name="packageName"]').clear().type(packageName)
      }

      beforeEach(() => {
        cy.intercept('POST', getNexusRepositories({ connectorId, repositoryFormat: 'nuget' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Repositories.json'
        }).as('getNexusRepositories')
      })

      it('4.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: ${repositoryFormat}\n        repository: ${repository}\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        repositoryUrl: \n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
        })
      })
      it('4.2: InputSetRefs', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          inputSetRefs: ['inputset1', 'inputset2'],
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: ${repositoryFormat}\n        repository: ${repository}\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        repositoryUrl: \n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
        })
      })
    })
    describe('5: Raw Repository Format', () => {
      const repositoryFormat = 'Raw'
      const repository = 'todolist'
      const packageName = 'test-package-name'
      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').clear().type(repositoryFormat)
        cy.contains('p', repositoryFormat).click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getNexusRepositories')
        cy.get('input[name="repository"]').clear().type(repository)
        cy.contains('p', repository).click()
        cy.get('input[name="packageName"]').clear().type(packageName)
      }

      beforeEach(() => {
        cy.intercept('POST', getNexusRepositories({ connectorId, repositoryFormat: 'raw' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Repositories.json'
        }).as('getNexusRepositories')
      })

      it('5.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: ${repositoryFormat}\n        repository: ${repository}\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        repositoryUrl: \n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
        })
      })
      it('5.2: InputSetRefs', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName,
          connectorId,
          fillArtifactData,
          inputSetRefs: ['inputset1', 'inputset2'],
          triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Nexus3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Nexus3Registry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ""\n        repositoryFormat: ${repositoryFormat}\n        repository: ${repository}\n        repositoryPortorRepositoryURL: repositoryUrl\n        tag: <+trigger.artifact.build>\n        repositoryUrl: \n        artifactPath: /test-artifact-path\n        groupId: ""\n        artifactId: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
        })
      })
    })
  })
})
