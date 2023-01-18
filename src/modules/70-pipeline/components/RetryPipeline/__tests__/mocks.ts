/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type {
  ResponseInputSetTemplateResponse,
  ResponsePlanExecutionResponseDto,
  ResponseRetryInfo
} from 'services/pipeline-ng'

export const mockRetryStages: UseGetMockDataWithMutateAndRefetch<ResponseRetryInfo> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      errorMessage: null as unknown as undefined,
      groups: [
        {
          info: [
            {
              name: 'stage1',
              identifier: 'stage1',
              status: 'Success',
              createdAt: 1637196823530,
              parentId: '_erjqIYeSdyI32-Q3og1Vw',
              nextId: 'FkJ2JI9ySIaz4dMiOWiHTA'
            }
          ]
        },
        {
          info: [
            {
              name: 'stage2',
              identifier: 'stage2',
              status: 'Success',
              createdAt: 1637196843381,
              parentId: '_erjqIYeSdyI32-Q3og1Vw',
              nextId: 'MR-2RZXuTiKQniQcka-aAQ'
            }
          ]
        },
        {
          info: [
            {
              name: 'stage3',
              identifier: 'stage3',
              status: 'Failed',
              createdAt: 1637196850227,
              parentId: 'MR-2RZXuTiKQniQcka-aAQ',
              nextId: null as unknown as undefined
            },
            {
              name: 'stage4',
              identifier: 'stage4',
              status: 'Success',
              createdAt: 1637196850248,
              parentId: 'MR-2RZXuTiKQniQcka-aAQ',
              nextId: null as unknown as undefined
            }
          ]
        }
      ],
      resumable: true
    },
    metaData: null as unknown as undefined,
    correlationId: '04b10adc-2516-4185-bc53-67c35d12ab01'
  }
}

export const mockPostRetryPipeline: UseGetMockDataWithMutateAndRefetch<ResponsePlanExecutionResponseDto> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      planExecution: {
        uuid: 'puqa4ivwRzGDUrYJdrcPbg',
        createdAt: 1642671599437,
        planId: 'Jxslh-ffQEGkvqB_lrrjhQ',
        setupAbstractions: {
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          orgIdentifier: 'default',
          projectIdentifier: 'Bhavya'
        },
        validUntil: 1658309999431 as unknown as undefined,
        status: 'RUNNING',
        startTs: 1642671599431,
        endTs: null as unknown as undefined,
        metadata: {
          runSequence: 3,
          triggerInfo: {
            triggerType: 'MANUAL',
            triggeredBy: {
              uuid: 'KrWK5MceTGyjLqLVRh3FCw',
              identifier: 'bhavya.sinha@harness.io',
              extraInfo: {
                email: 'bhavya.sinha@harness.io'
              }
            },
            isRerun: false
          },
          pipelineIdentifier: 'pipeline2',
          executionUuid: 'puqa4ivwRzGDUrYJdrcPbg',
          moduleType: 'cd',
          retryInfo: {
            isRetry: true,
            rootExecutionId: '5E3H4VokRkWXLnpYV2_u2A',
            parentRetryId: '5E3H4VokRkWXLnpYV2_u2A'
          }
        },
        lastUpdatedAt: 1642671599437,
        version: 0,

        nodeType: 'PLAN'
      }
    },
    metaData: null as unknown as undefined,
    correlationId: '915c7b2f-8a53-483f-878d-3741408fe03e'
  }
}

export const mockInputsetYamlV2: UseGetMockDataWithMutateAndRefetch<ResponseInputSetTemplateResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      inputSetTemplateYaml:
        'pipeline:\n  identifier: "retrypipelinetest"\n  stages:\n  - stage:\n      identifier: "dev"\n      type: "Deployment"\n      spec:\n        execution:\n          steps:\n          - step:\n              identifier: "ShellScript"\n              type: "ShellScript"\n              timeout: "<+input>"\n  - stage:\n      identifier: "stage2"\n      type: "Deployment"\n      spec:\n        environment:\n          environmentRef: "<+input>"\n          environmentInputs: "<+input>"\n          infrastructureDefinitions: "<+input>"\n',
      inputSetYaml:
        'pipeline:\n  identifier: "retrypipelinetest"\n  stages:\n  - stage:\n      identifier: "dev"\n      type: "Deployment"\n      spec:\n        execution:\n          steps:\n          - step:\n              identifier: "ShellScript"\n              type: "ShellScript"\n              timeout: "10m"\n  - stage:\n      identifier: "stage2"\n      type: "Deployment"\n      spec:\n        environment:\n          environmentRef: "env1"\n          infrastructureDefinitions:\n          - identifier: "infra1"\n'
    },
    metaData: null as unknown as undefined,
    correlationId: 'e2a0a206-f944-4e87-ae97-ef54cbeeb21e'
  }
}
export const templateResponse: any = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: {
      hasInputSets: true,
      inputSetTemplateYaml:
        'pipeline:\n  identifier: "retrypipelinetest"\n  stages:\n  - stage:\n      identifier: "dev"\n      type: "Deployment"\n      spec:\n        execution:\n          steps:\n          - step:\n              identifier: "ShellScript"\n              type: "ShellScript"\n              timeout: "<+input>"\n  - stage:\n      identifier: "stage2"\n      type: "Deployment"\n      spec:\n        environment:\n          environmentRef: "<+input>"\n          environmentInputs: "<+input>"\n          infrastructureDefinitions: "<+input>"\n',
      modules: ['cd', 'pms']
    },
    metaData: null as unknown as undefined,
    correlationId: 'e2a0a206-f944-4e87-ae97-ef54cbeeb21e'
  }
}
