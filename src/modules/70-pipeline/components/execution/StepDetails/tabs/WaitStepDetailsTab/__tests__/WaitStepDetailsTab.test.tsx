/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, queryByAttribute } from '@testing-library/react'

import routes from '@common/RouteDefinitions'
import { useMarkWaitStep, ResponseWaitStepExecutionDetailsDto } from 'services/pipeline-ng'
import { TestWrapper, UseGetMockData } from '@common/utils/testUtils'
import { WaitStepDetailsTab } from '../WaitStepDetailsTab'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'

const data = {
  uuid: 'VsAwQ8XLTP2uktP0IPopTQ',
  setupId: 'Oo8abCrwTOektJy6r-Q_QA',
  name: 'Wait',
  identifier: 'wait',
  baseFqn: 'pipeline.stages.test1.spec.execution.steps.wait',
  outcomes: {},
  stepParameters: {
    identifier: ['abc'],
    name: ['Wait'],
    failureStrategies: [
      {
        onFailure: {
          errors: ['AUTHENTICATION_ERROR'],
          action: {
            type: undefined
          }
        }
      }
    ],
    type: ['Wait'],
    spec: {
      duration: {
        __recast: 'io.harness.yaml.core.timeout.Timeout',
        timeoutString: '10m',
        timeoutInMillis: 600000
      },
      uuid: 'VqFkDdyHSEOZ7P-3AyRx5Q'
    }
  },
  startTs: 1664018358249,
  endTs: 1664018376256,
  stepType: 'Wait',
  status: ExecutionStatusEnum.AsyncWaiting,
  failureInfo: {
    message: '',
    failureTypeList: [],
    responseMessages: []
  },
  skipInfo: undefined,
  nodeRunInfo: {
    whenCondition: '<+OnStageSuccess>',
    evaluatedCondition: true,
    expressions: [
      {
        expression: 'OnStageSuccess',
        expressionValue: 'true',
        count: 1
      }
    ]
  },
  executableResponses: [
    {
      async: {
        callbackIds: ['U_JW-LnoT8uxedli6iku_w'],
        logKeys: [],
        units: [],
        timeout: 600000
      }
    }
  ],
  unitProgresses: [],
  progressData: undefined,
  delegateInfoList: [],
  interruptHistories: [],
  stepDetails: {},
  strategyMetadata: undefined,
  executionInputConfigured: false
}
const mockDetailResponse: UseGetMockData<ResponseWaitStepExecutionDetailsDto> = {
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  refetch: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      createdAt: 123456789123,
      duration: 10,
      nodeExecutionId: 'abcd'
    }
  }
}
const mutate = jest.fn()
jest.mock('services/pipeline-ng', () => ({
  useExecutionDetails: jest.fn(() => mockDetailResponse),
  useMarkWaitStep: jest.fn(() => ({ mutate }))
}))

const showError = jest.fn()
jest.mock('@wings-software/uicore', () => ({
  ...jest.requireActual('@wings-software/uicore'),
  useToaster: jest.fn(() => ({ showError }))
}))

enum Strategies {
  MarkAsSuccess = 'MarkAsSuccess',
  MarkAsFailure = 'MarkAsFailure'
}
const AllStrategies = Object.values(Strategies)

describe('<WaitStepDetailsTab /> tests', () => {
  beforeEach(() => {
    mutate.mockClear()
    showError.mockClear()
  })

  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <WaitStepDetailsTab step={data as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test.each(AllStrategies)('interrupt %s works', async strategy => {
    const { container } = render(
      <TestWrapper>
        <WaitStepDetailsTab step={data as any} />
      </TestWrapper>
    )
    const btn = queryByAttribute('value', container, strategy)!
    fireEvent.click(btn)
    const waitStepRequestDto = { action: strategy === 'MarkAsFailure' ? 'MARK_AS_FAIL' : 'MARK_AS_SUCCESS' }
    await waitFor(() => {
      expect(mutate).toHaveBeenLastCalledWith(waitStepRequestDto, {
        headers: { 'content-type': 'application/json' },
        queryParams: {
          accountIdentifier: undefined,
          orgIdentifier: undefined,
          projectIdentifier: undefined
        }
      })
    })
  })
})
