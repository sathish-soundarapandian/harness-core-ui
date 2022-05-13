/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseNGTriggerResponse, ResponseNGTriggerDetailsResponse } from 'services/pipeline-ng'

export const GetTriggerResponse: UseGetReturnData<ResponseNGTriggerResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'ab',
      identifier: 'b',
      type: 'Webhook',
      accountIdentifier: 'accountIdentifier',
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      targetIdentifier: 'p1',
      yaml: 'trigger:\n  name: ab\n  identifier: b\n  tags: {}\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: aa\n                        releaseName: <+input>\n  source:\n    type: Webhook\n    spec:\n      type: BITBUCKET\n      spec:\n        repoUrl: aaaadsf\n        event: Pull Request\n        actions: []\n'
    },
    metaData: null as unknown as undefined,
    correlationId: '204d9325-4c5e-4e64-8965-b4a7b0539bdc'
  }
}

export const GetTriggerDetailsResponse: UseGetReturnData<ResponseNGTriggerDetailsResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'Trigger__1',
      identifier: 'Trigger__1',
      type: 'Webhook',
      lastTriggerExecutionDetails: {
        lastExecutionTime: 1608700041553,
        lastExecutionSuccessful: false,
        lastExecutionStatus: 'INVALID_RUNTIME_INPUT_YAML',
        message:
          'Failed while requesting Pipeline ExecutionNo content to map due to end-of-input\n at [Source: java.io.StringReader@5dfa93c7; line: 1, column: 1]'
      },
      webhookDetails: { webhookSourceRepo: 'Github' },
      tags: {},
      executions: [0, 0, 0, 0, 0, 0, 2],
      yaml: 'trigger:\n  name: Trigger__1\n  identifier: Trigger__1\n  target:\n    targetIdentifier: http\n    type: Pipeline\n    spec:\n      runtimeInputYaml:  ""\n  source:\n    type: Webhook\n    spec:\n      type: Github\n      spec:\n        repoUrl: https://github.com/wings-software/triggerNgDemo\n        event: Pull Request\n        actions:\n          - opened\n          - closed\n        payloadConditions:\n          - key: sourceBranch\n            operator: equals\n            value: ng-trigger-demo\n          - key: targetBranch\n            operator: in\n            value: master, main\n          - key: ${eventPayload.pull_request.user.id}\n            operator: equals\n            value: 56320710\n          - key: ${eventPayload.pull_request.head.ref}\n            operator: regex\n            value: ^ng-trigger-demo            ',
      enabled: true
    },
    metaData: null as unknown as undefined,
    correlationId: '204d9325-4c5e-4e64-8965-b4a7b0539bdc'
  }
}
