/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { ExecutionNode } from 'services/pipeline-ng'
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

describe('Queue Step View Test', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <QueueStepView step={step} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
