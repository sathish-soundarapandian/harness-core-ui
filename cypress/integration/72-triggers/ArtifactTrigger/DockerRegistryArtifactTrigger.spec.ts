/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

describe('Docker Registry Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    const artifactTypeCy = 'Artifact_Docker Registry'
    const connectorId = 'testAWS'
    const triggerName = 'Docker Registry Trigger'
    const fillArtifactData = (): void => {
      cy.get('input[name="imagePath"]').clear().type('/test-image-path')
    }

    it('1: Pipeline Input', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Docker_Registry_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: DockerRegistry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: /test-image-path\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      })
    })
    it('2: InputSetRefs', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        inputSetRefs: ['inputset1', 'inputset2'],
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Docker_Registry_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: DockerRegistry\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: /test-image-path\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
      })
    })
  })
})
