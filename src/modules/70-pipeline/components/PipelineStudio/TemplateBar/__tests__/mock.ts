/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseTemplateResponse } from 'services/template-ng'

export const stageTemplate: ResponseTemplateResponse = {
  status: 'SUCCESS',
  data: {
    accountId: 'px7xd_BFRCi-pfWPYXVjvw',
    identifier: 'stgtempgit',
    name: 'stgtempgit',
    description: '',
    tags: {},
    yaml: 'template:\n  name: stgtempgit\n  identifier: stgtempgit\n  versionLabel: "1"\n  type: Stage\n  tags: {}\n  spec:\n    type: Deployment\n    spec:\n      deploymentType: Kubernetes\n      service:\n        serviceRef: <+input>\n        serviceInputs: <+input>\n      environment:\n        environmentRef: <+input>\n        deployToAll: false\n        environmentInputs: <+input>\n        infrastructureDefinitions: <+input>\n      execution:\n        steps:\n          - step:\n              name: Rollout Deployment\n              identifier: rolloutDeployment\n              type: K8sRollingDeploy\n              timeout: 10m\n              spec:\n                skipDryRun: false\n                pruningEnabled: false\n        rollbackSteps:\n          - step:\n              name: Rollback Rollout Deployment\n              identifier: rollbackRolloutDeployment\n              type: K8sRollingRollback\n              timeout: 10m\n              spec:\n                pruningEnabled: false\n    failureStrategies:\n      - onFailure:\n          errors:\n            - AllErrors\n          action:\n            type: StageRollback\n',
    versionLabel: '1',
    templateEntityType: 'Stage',
    childType: 'Deployment',
    templateScope: 'account',
    version: 0,
    gitDetails: {
      objectId: 'ad89031f5353ec10a7ae8261aea9aebb0b5ee3cb',
      branch: 'master',
      filePath: '.harness/stgtempgit_1.yaml',
      repoName: 'Ramya-test',
      commitId: '9fdfd27ee6b74e1087c161cb119699677b1d387c',
      fileUrl: 'https://github.com/wings-software/Ramya-test/blob/master/.harness/stgtempgit_1.yaml'
    },
    entityValidityDetails: {
      valid: true
    },
    lastUpdatedAt: 1675156177695,
    storeType: 'REMOTE',
    connectorRef: 'account.Ramya',
    cacheResponseMetadata: {
      cacheState: 'VALID_CACHE',
      ttlLeft: 259165572,
      lastUpdatedAt: 1685953457963
    },
    stableTemplate: true
  }
}
