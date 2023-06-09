/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getAzureArtifactsFeeds, getAzureArtifactsPackages, getAzureArtifactsProjects } from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

describe('Azure Artifacts Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    const artifactTypeCy = 'Artifact_Azure Artifacts'
    const connectorId = 'testAWS'
    const triggerName = 'Azure Trigger'
    const feed = 'feedproject'
    const pkg = 'com.bugsnag:bugsnag'

    describe('1: Project Scope', () => {
      const project = 'automation-cdc'
      describe('1.1: Maven Package Type', () => {
        const packageType = 'maven'
        const fillArtifactData = (): void => {
          cy.get('input[name="project"]').focus()
          cy.wait('@getAzureArtifactsProjects')
          cy.get('input[name="project"]').clear().type(project)
          cy.contains('p', project).click()
          cy.get('input[name="feed"]').focus()
          cy.wait('@getAzureArtifactsFeeds')
          cy.get('input[name="feed"]').clear().type(feed)
          cy.contains('p', feed).click()
          cy.get('input[name="package"]').focus()
          cy.wait('@getAzureArtifactsPackages')
          cy.get('input[name="package"]').clear().type(pkg)
          cy.contains('p', pkg).click()
        }

        beforeEach(() => {
          cy.intercept('GET', getAzureArtifactsProjects({ connectorId }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Projects.json'
          }).as('getAzureArtifactsProjects')
          cy.intercept('GET', getAzureArtifactsFeeds({ connectorId, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Feeds.json'
          }).as('getAzureArtifactsFeeds')
          cy.intercept('GET', getAzureArtifactsPackages({ connectorId, packageType, feed, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Packages.json'
          }).as('getAzureArtifactsPackages')
        })
        it('1.1.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Azure_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: project\n        feed: ${feed}\n        packageType: ${packageType}\n        package: ${pkg}\n        project: ${project}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
          })
        })
        it('1.1.2: InputSetRefs', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            inputSetRefs: ['inputset1', 'inputset2'],
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Azure_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: project\n        feed: ${feed}\n        packageType: ${packageType}\n        package: ${pkg}\n        project: ${project}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
          })
        })
      })
      describe('1.2: NuGet Package Type', () => {
        const packageType = 'nuget'
        const fillArtifactData = (): void => {
          cy.get('input[name="project"]').focus()
          cy.wait('@getAzureArtifactsProjects')
          cy.get('input[name="project"]').clear().type(project)
          cy.contains('p', project).click()
          cy.get('input[name="feed"]').focus()
          cy.wait('@getAzureArtifactsFeeds')
          cy.get('input[name="feed"]').clear().type(feed)
          cy.contains('p', feed).click()
          cy.get('input[name="packageType"]').clear().type(packageType)
          cy.contains('p', 'NuGet').click()
          cy.get('input[name="package"]').focus()
          cy.wait('@getAzureArtifactsPackages')
          cy.get('input[name="package"]').clear().type(pkg)
          cy.contains('p', pkg).click()
        }

        beforeEach(() => {
          cy.intercept('GET', getAzureArtifactsProjects({ connectorId }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Projects.json'
          }).as('getAzureArtifactsProjects')
          cy.intercept('GET', getAzureArtifactsFeeds({ connectorId, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Feeds.json'
          }).as('getAzureArtifactsFeeds')
          cy.intercept('GET', getAzureArtifactsPackages({ connectorId, packageType, feed, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Packages.json'
          }).as('getAzureArtifactsPackages')
        })
        it('1.2.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Azure_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: project\n        feed: ${feed}\n        packageType: ${packageType}\n        package: ${pkg}\n        project: ${project}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
          })
        })
        it('1.2.2: InputSetRefs', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            inputSetRefs: ['inputset1', 'inputset2'],
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Azure_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: project\n        feed: ${feed}\n        packageType: ${packageType}\n        package: ${pkg}\n        project: ${project}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
          })
        })
      })
    })
    describe('2: Org Scope', () => {
      const scope = 'org'
      const project = ''
      describe('2.1: Maven Package Type', () => {
        const packageType = 'maven'
        const fillArtifactData = (): void => {
          cy.get('input[name="scope"]').clear().type(scope)
          cy.contains('p', 'Org').click()
          cy.get('input[name="feed"]').focus()
          cy.wait('@getAzureArtifactsFeeds')
          cy.get('input[name="feed"]').clear().type(feed)
          cy.contains('p', feed).click()
          cy.get('input[name="package"]').focus()
          cy.wait('@getAzureArtifactsPackages')
          cy.get('input[name="package"]').clear().type(pkg)
          cy.contains('p', pkg).click()
        }

        beforeEach(() => {
          cy.intercept('GET', getAzureArtifactsFeeds({ connectorId, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Feeds.json'
          }).as('getAzureArtifactsFeeds')
          cy.intercept('GET', getAzureArtifactsPackages({ connectorId, packageType, feed, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Packages.json'
          }).as('getAzureArtifactsPackages')
        })
        it('2.1.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Azure_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: ${scope}\n        feed: ${feed}\n        packageType: ${packageType}\n        package: ${pkg}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
          })
        })
        it('2.1.2: InputSetRefs', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            inputSetRefs: ['inputset1', 'inputset2'],
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Azure_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: ${scope}\n        feed: ${feed}\n        packageType: ${packageType}\n        package: ${pkg}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
          })
        })
      })
      describe('2.2: NuGet Package Type', () => {
        const packageType = 'nuget'
        const fillArtifactData = (): void => {
          cy.get('input[name="scope"]').clear().type(scope)
          cy.contains('p', 'Org').click()
          cy.get('input[name="feed"]').focus()
          cy.wait('@getAzureArtifactsFeeds')
          cy.get('input[name="feed"]').clear().type(feed)
          cy.contains('p', feed).click()
          cy.get('input[name="packageType"]').clear().type(packageType)
          cy.contains('p', 'NuGet').click()
          cy.get('input[name="package"]').focus()
          cy.wait('@getAzureArtifactsPackages')
          cy.get('input[name="package"]').clear().type(pkg)
          cy.contains('p', pkg).click()
        }

        beforeEach(() => {
          cy.intercept('GET', getAzureArtifactsFeeds({ connectorId, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Feeds.json'
          }).as('getAzureArtifactsFeeds')
          cy.intercept('GET', getAzureArtifactsPackages({ connectorId, packageType, feed, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Packages.json'
          }).as('getAzureArtifactsPackages')
        })
        it('2.2.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Azure_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: ${scope}\n        feed: ${feed}\n        packageType: ${packageType}\n        package: ${pkg}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
          })
        })
        it('2.2.2: InputSetRefs', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName,
            connectorId,
            fillArtifactData,
            inputSetRefs: ['inputset1', 'inputset2'],
            triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Azure_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AzureArtifacts\n      spec:\n        connectorRef: ${connectorId}\n        scope: ${scope}\n        feed: ${feed}\n        packageType: ${packageType}\n        package: ${pkg}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
          })
        })
      })
    })
  })
})
