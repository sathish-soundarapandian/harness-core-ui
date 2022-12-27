/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import type { ResponseMessage } from 'services/pipeline-ng'

import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { StageType } from '@pipeline/utils/stageHelpers'

import { PolicyEvaluationView } from '../PolicyEvaluationView/PolicyEvaluationView'
import { executionMetadata } from './mock'

describe('Policy Evaluation View Test', () => {
  test('renders snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <PolicyEvaluationView
          step={{
            status: ExecutionStatusEnum.InterventionWaiting
          }}
          stageType={StageType.DEPLOY}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('failure responses', () => {
    const responseMessage: ResponseMessage = {
      code: 'DEFAULT_ERROR_CODE'
    }
    const { container } = render(
      <TestWrapper>
        <PolicyEvaluationView
          step={{
            status: ExecutionStatusEnum.Failed,
            failureInfo: {
              responseMessages: [responseMessage]
            }
          }}
          stageType={StageType.DEPLOY}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('error in step evaluation', () => {
    const { container } = render(
      <TestWrapper>
        <PolicyEvaluationView
          step={{
            status: ExecutionStatusEnum.Failed,
            executableResponses: [
              {
                skipTask: {
                  message: 'Failure to evaluate step'
                }
              }
            ]
          }}
          stageType={StageType.DEPLOY}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
