/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseNGTriggerResponse } from 'services/pipeline-ng'

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
