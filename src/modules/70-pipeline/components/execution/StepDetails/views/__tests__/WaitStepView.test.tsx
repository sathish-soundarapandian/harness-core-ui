/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import type { ResponseWaitStepExecutionDetailsDto } from 'services/pipeline-ng'
import { TestWrapper, UseGetMockData } from '@common/utils/testUtils'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'

import { WaitStepView } from '../WaitStepView/WaitStepView'
import { executionMetadata, policyOutputDetails } from './mock'

let mockDate: jest.SpyInstance<unknown> | undefined
let mocktime: jest.SpyInstance<unknown> | undefined

beforeAll(() => {
  mockDate = jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('17:00')
  mocktime = jest.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('2022-03-04')
})

afterAll(() => {
  mockDate?.mockRestore()
  mocktime?.mockRestore()
})
const step = (status: any) => ({
  uuid: 'VsAwQ8XLTP2uktP0IPopTQ',
  setupId: 'Oo8abCrwTOektJy6r-Q_QA',
  name: 'Wait',
  identifier: 'wait',
  baseFqn: 'pipeline.stages.test1.spec.execution.steps.wait',
  outcomes: policyOutputDetails,
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
  stepType: 'Wait',
  status: status,
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
})

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
  useMarkWaitStep: jest.fn(() => ({ mutate })),
  useHandleManualInterventionInterrupt: jest.fn(() => ({ mutate }))
}))

const checkPolicyEnforcementTab = async (): Promise<HTMLElement> => {
  const policyEnforcementTab = await screen.findByRole('tab', {
    name: 'pipeline.policyEnforcement.title'
  })
  await userEvent.click(policyEnforcementTab)
  const tabpanel = screen.getByRole('tabpanel', {
    name: 'pipeline.policyEnforcement.title'
  })
  const policyEvaluationText = await within(tabpanel).findByText('pipeline.policyEvaluations.title')

  expect(policyEvaluationText).toBeInTheDocument()
  return tabpanel
}

describe('Wait Step View Test', () => {
  test('renders snapshot', async () => {
    const data = step(ExecutionStatusEnum.Success)
    const { container } = render(
      <TestWrapper>
        <WaitStepView step={data} isStageExecutionInputConfigured={false} executionMetadata={executionMetadata} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    const policyEnforcementTabPanel = await checkPolicyEnforcementTab()
    expect(policyEnforcementTabPanel).toMatchSnapshot('Policy Enforcement Tab - Wait Step View')
  })

  test('renders snapshot for manual intervention', () => {
    const data = step(ExecutionStatusEnum.InterventionWaiting)
    const { container } = render(
      <TestWrapper>
        <WaitStepView step={data} isStageExecutionInputConfigured={false} executionMetadata={executionMetadata} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
