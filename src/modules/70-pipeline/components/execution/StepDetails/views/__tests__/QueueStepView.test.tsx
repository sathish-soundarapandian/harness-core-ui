/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { ExecutionNode, ResourceConstraintDetail, useGetResourceConstraintsExecutionInfo } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { QueueStepView } from '../QueueStepView/QueueStepView'

const step: ExecutionNode = {
  uuid: 'WRx4GOK2RYO3Q4CL1eklhg',
  setupId: 'qB9Am2ETQmaRqjG13u3wJA',
  name: 'queue1',
  identifier: 'queue1',
  baseFqn: 'pipeline.stages.deploy.spec.execution.steps.queue1',
  startTs: 1656354060613,
  endTs: 1656354061136,
  stepType: 'Queue',
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
      sync: {
        logKeys: [],
        units: []
      }
    }
  ],
  unitProgresses: [],
  progressData: undefined,
  delegateInfoList: [],
  interruptHistories: [],
  stepDetails: undefined,
  strategyMetadata: undefined
}

jest.mock('services/pipeline-ng', () => ({
  useGetResourceConstraintsExecutionInfo: jest.fn(() => ({}))
}))

const mockData = (resourceConstraints: ResourceConstraintDetail[]) => {
  // eslint-disable-next-line
  // @ts-ignore
  useGetResourceConstraintsExecutionInfo.mockImplementation(() => ({
    refetch: jest.fn(),
    mutate: jest.fn(),
    loading: false,
    data: {
      correlationId: '',
      status: 'SUCCESS',
      metaData: null as unknown as undefined,
      data: {
        resourceConstraints
      }
    }
  }))
}

describe('Queue Step View Test', () => {
  test('snapshot test - empty resourceConstraints', () => {
    mockData([])
    const { container } = render(
      <TestWrapper>
        <QueueStepView step={step} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('test - have resourceConstraints', () => {
    mockData([
      {
        accountId: 'ACCOUNT_ID_1',
        orgIdentifier: 'ORG_1',
        pipelineIdentifier: 'PIPELINE_1',
        pipelineName: 'ishant pipeline',
        planExecutionId: 'PLAN_EXECUTION_1',
        projectIdentifier: 'PROJ_1',
        state: 'ACTIVE',
        startTs: 1658257698974
      },
      {
        accountId: 'ACCOUNT_ID_1',
        orgIdentifier: 'ORG_2',
        pipelineIdentifier: 'PIPELINE_2',
        pipelineName: 'ishant pipeline_2',
        planExecutionId: 'PLAN_EXECUTION_2',
        projectIdentifier: 'PROJ_12',
        state: 'BLOCKED',
        startTs: 1658257711585
      }
    ])
    render(
      <TestWrapper pathParams={{ executionIdentifier: 'PLAN_EXECUTION_1' }}>
        <QueueStepView step={step} />
      </TestWrapper>
    )
    expect(document.getElementsByClassName('detailsTab')[0]).toMatchSnapshot('2 resource constraints')
  })
})
