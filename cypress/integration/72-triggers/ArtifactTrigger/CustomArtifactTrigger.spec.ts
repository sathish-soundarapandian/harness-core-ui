/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

describe('Custom Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    const artifactTypeCy = 'Artifact_Custom'
    const triggerName = 'Custom Trigger'
    const script = 'echo "Hello World"'
    const artifactsArrayPath = 'test-artifacts-Array-Path'
    const versionPath = 'test-version-Path'
    const scriptInputVariables = [
      { name: 'Var_A', type: 'String', value: 'A' },
      { name: 'Var_b', type: 'Number', value: '1' }
    ]
    const fillArtifactData = (): void => {
      cy.get('.react-monaco-editor-container').click().focused().type(script)
      cy.get('input[name="artifactsArrayPath"]').clear().type(artifactsArrayPath)
      cy.get('input[name="versionPath"]').clear().type(versionPath)
      scriptInputVariables.forEach((scriptInputVariable, index) => {
        const { name, type, value } = scriptInputVariable
        cy.contains('span', 'Add Input Variable').click()
        cy.get(`input[name="inputs.[${index}].name"]`).clear().type(name)
        cy.get(`input[name="inputs.[${index}].type"]`).clear().type(type)
        cy.contains('p', type).click()
        cy.get(`input[name="inputs.[${index}].value"]`).clear().type(value)
      })
    }

    it('1: Pipeline Input', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        fillArtifactData,
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Custom_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: CustomArtifact\n      spec:\n        artifactsArrayPath: test-artifacts-Array-Path\n        inputs:\n          - name: Var_A\n            type: String\n            value: A\n          - name: Var_b\n            type: Number\n            value: "1"\n        script: echo "Hello World"\n        version: <+trigger.artifact.build>\n        versionPath: test-version-Path\n        connectorRef: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      })
    })
    it('2: InputSetRefs', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        fillArtifactData,
        inputSetRefs: ['inputset1', 'inputset2'],
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Custom_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: CustomArtifact\n      spec:\n        artifactsArrayPath: test-artifacts-Array-Path\n        inputs:\n          - name: Var_A\n            type: String\n            value: A\n          - name: Var_b\n            type: Number\n            value: "1"\n        script: echo "Hello World"\n        version: <+trigger.artifact.build>\n        versionPath: test-version-Path\n        connectorRef: ""\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
      })
    })
  })
})
