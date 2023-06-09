/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getAWSRegions, getArtifactsECRGetImages } from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

describe('ECR Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    beforeEach(() => {
      cy.intercept('GET', getAWSRegions, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_AWS_Regions.json'
      }).as('getAWSRegions')

      cy.intercept('POST', getArtifactsECRGetImages({ connectorId, region: 'us-east-1' }), {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_ECR_Images.json'
      }).as('getArtifactsECRGetImages')
    })

    const artifactTypeCy = 'Artifact_ECR'
    const connectorId = 'testAWS'
    const triggerName = 'ECR Trigger'
    const fillArtifactData = (): void => {
      cy.wait('@getAWSRegions')
      cy.get('input[name="region"]').clear().type('US East')
      cy.contains('p', 'US East (N. Virginia)').click()
      cy.get('input[name="imagePath"]').focus()
      cy.wait('@getArtifactsECRGetImages')
      cy.get('input[name="imagePath"]').clear().type('todo')
      cy.contains('p', 'todolist').click()
    }

    it('1: Pipeline Input', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: ECR_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Ecr\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: todolist\n        region: us-east-1\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      })
    })
    it('2: InputSetRefs', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        inputSetRefs: ['inputset1', 'inputset2'],
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: ECR_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Ecr\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: todolist\n        region: us-east-1\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
      })
    })
  })
})
