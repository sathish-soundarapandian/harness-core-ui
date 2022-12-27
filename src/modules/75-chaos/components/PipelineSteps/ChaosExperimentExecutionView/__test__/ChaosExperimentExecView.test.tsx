/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import type { ResponseMessage } from 'services/pipeline-ng'
import ChaosExperimentExecView, { ActionButtons } from '../ChaosExperimentExecView'
import executionMetadata from './executionMetadata.json'

const mutate = jest.fn()
jest.mock('services/pipeline-ng', () => ({
  useHandleManualInterventionInterrupt: jest.fn(() => ({ mutate }))
}))

const showError = jest.fn()
jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError }))
}))

// eslint-disable-next-line react/display-name
jest.mock('microfrontends/ChildAppMounter', () => () => {
  return <div data-testid="error-tracking-child-mounter">mounted</div>
})

describe('ChaosExperimentExecView Test', () => {
  beforeEach(() => {
    mutate.mockClear()
    showError.mockClear()
  })

  test('renders snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <ChaosExperimentExecView
          step={{
            status: ExecutionStatusEnum.Success
          }}
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
        <ChaosExperimentExecView
          step={{
            status: ExecutionStatusEnum.Failed,
            failureInfo: {
              responseMessages: [responseMessage]
            }
          }}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('error in step evaluation', () => {
    const { container } = render(
      <TestWrapper>
        <ChaosExperimentExecView
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
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('action buttons', () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <ActionButtons
          step={{
            status: ExecutionStatusEnum.InterventionWaiting
          }}
          allowedStrategies={['Abort', 'Ignore', 'MarkAsSuccess', 'PipelineRollback', 'Retry', 'StageRollback']}
          isManualInterruption={true}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    fireEvent.click(getByText('common.performAction'))
    expect(container).toMatchSnapshot()

    fireEvent.click(getByTestId('MarkAsSuccess'))

    expect(container).toMatchSnapshot()
  })
})
