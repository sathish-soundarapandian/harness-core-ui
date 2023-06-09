/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getAWSRegions, getS3BucketsV2 } from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

describe('Amazon S3 Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    const artifactTypeCy = 'Artifact_Amazon S3'
    const connectorId = 'testAWS'
    const triggerName = 'Amazon S3 Trigger'
    const region = 'us-east-1'
    const bucketName = 'may12020'
    const filePathRegex = '/*'
    const fillArtifactData = (): void => {
      cy.wait('@getAWSRegions')
      cy.get('input[name="region"]').clear().type('US East')
      cy.contains('p', 'US East (N. Virginia)').click()
      cy.get('input[name="bucketName"]').focus()
      cy.wait('@getS3BucketsV2')
      cy.get('input[name="bucketName"]').clear().type(bucketName)
      cy.contains('p', bucketName).click()
      cy.get('input[name="filePathRegex"]').clear().type(filePathRegex)
    }

    beforeEach(() => {
      cy.intercept('GET', getAWSRegions, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_AWS_Regions.json'
      }).as('getAWSRegions')

      cy.intercept('GET', getS3BucketsV2({ connectorId, region }), {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_S3_Buckets_V2.json'
      }).as('getS3BucketsV2')
    })

    it('1: Pipeline Input', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Amazon_S3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AmazonS3\n      spec:\n        bucketName: ${bucketName}\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        filePathRegex: /*\n        region: ${region}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      })
    })
    it('2: InputSetRefs', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        inputSetRefs: ['inputset1', 'inputset2'],
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Amazon_S3_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AmazonS3\n      spec:\n        bucketName: ${bucketName}\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        filePathRegex: /*\n        region: ${region}\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
      })
    })
  })
})
