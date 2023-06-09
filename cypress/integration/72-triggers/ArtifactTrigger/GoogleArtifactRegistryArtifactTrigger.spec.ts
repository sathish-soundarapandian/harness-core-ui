/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getGARRegions } from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

describe('Google Artifact Registry Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    const artifactTypeCy = 'Artifact_Google Artifact Registry'
    const connectorId = 'testAWS'
    const triggerName = 'Google Artifact Registry Trigger'
    const project = 'test-project'
    const region = 'asia'
    const repositoryName = 'test-repository-name'
    const pkg = 'test-package'
    const fillArtifactData = (): void => {
      cy.wait('@getGARRegions')
      cy.get('input[name="project"]').clear().type(project)
      cy.get('input[name="region"]').clear().type(region)
      cy.contains('p', region).click()
      cy.get('input[name="repositoryName"]').clear().type(repositoryName)
      cy.get('input[name="package"]').clear().type(pkg)
    }

    beforeEach(() => {
      cy.intercept('GET', getGARRegions, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_GAR_Regions.json'
      }).as('getGARRegions')
    })

    it('1: Pipeline Input', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Google_Artifact_Registry_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: GoogleArtifactRegistry\n      spec:\n        package: ${pkg}\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        project: ${project}\n        region: ${region}\n        repositoryName: ${repositoryName}\n        version: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      })
    })
    it('2: InputSetRefs', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        inputSetRefs: ['inputset1', 'inputset2'],
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Google_Artifact_Registry_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: GoogleArtifactRegistry\n      spec:\n        package: ${pkg}\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        project: ${project}\n        region: ${region}\n        repositoryName: ${repositoryName}\n        version: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
      })
    })
  })
})
