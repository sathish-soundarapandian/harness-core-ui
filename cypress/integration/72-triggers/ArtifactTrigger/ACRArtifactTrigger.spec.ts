/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  getArtifactsACRContainerRegistries,
  getArtifactsACRContainerRegistryRepositories,
  getAzureSubscriptions
} from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

describe('ACR Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    const artifactTypeCy = 'Artifact_ACR'
    const connectorId = 'testAWS'
    const triggerName = 'ACR Trigger'
    const subscriptionId = '12d2db62-5aa9-471d-84bb-faa489b3e319'
    const registry = 'automationci'
    const repository = 'automation'
    const fillArtifactData = (): void => {
      cy.wait(`@getAzureSubscriptions`)
      cy.get('input[name="subscriptionId"]').clear().type(subscriptionId)
      cy.contains('p', 'Harness-Test: 12d2db62-5aa9-471d-84bb-faa489b3e319').click()
      cy.wait('@getArtifactsACRContainerRegistries')
      cy.get('input[name="registry"]').clear().type(registry)
      cy.contains('p', registry).click()
      cy.wait('@getArtifactsACRContainerRegistryRepositories')
      cy.get('input[name="repository"]').clear().type(repository)
      cy.contains('p', repository).click()
    }

    beforeEach(() => {
      cy.intercept('GET', getAzureSubscriptions({ connectorId }), {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Subscriptions.json'
      }).as('getAzureSubscriptions')
      cy.intercept('GET', getArtifactsACRContainerRegistries({ connectorId, subscriptionId }), {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_ACR_Container_Registries.json'
      }).as('getArtifactsACRContainerRegistries')
      cy.intercept('GET', getArtifactsACRContainerRegistryRepositories({ registry, connectorId, subscriptionId }), {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_ACR_Container_Registry_Repositories.json'
      }).as('getArtifactsACRContainerRegistryRepositories')
    })

    it('1: Pipeline Input', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: ACR_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Acr\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        registry: ${registry}\n        repository: automation\n        subscriptionId: ${subscriptionId}\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      })
    })
    it('2: InputSetRefs', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        inputSetRefs: ['inputset1', 'inputset2'],
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: ACR_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Acr\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        registry: ${registry}\n        repository: automation\n        subscriptionId: ${subscriptionId}\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
      })
    })
  })
})
