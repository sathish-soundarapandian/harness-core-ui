/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ExecutionErrorTrackingView from '../ExecutionErrorTrackingView'
import {
  mockExecutionContext,
  mockExecutionContextUndefinedExecutionSummary,
  mockExecutionContextUndefinedPipelineIdentifier,
  mockExecutionContextUndefinedRunSequence,
  mockExecutionContextUndefinedStartTs
} from './ExecutionErrorTrackingView.mock'

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <ExecutionErrorTrackingView />
    </TestWrapper>
  )
}

// eslint-disable-next-line react/display-name
jest.mock('microfrontends/ChildAppMounter', () => () => {
  return <div data-testid="error-tracking-child-mounter">mounted</div>
})
let mockContext: any = mockExecutionContext
jest.mock('@pipeline/context/ExecutionContext', () => ({
  useExecutionContext: jest.fn().mockImplementation(() => mockContext)
}))

test('Verify if Error Tracking View is rendered when required params are defined', async () => {
  const { getByTestId } = render(<WrapperComponent />)
  expect(getByTestId('error-tracking-child-mounter')).toBeDefined()
})

test('Verify if Error Tracking View is NOT rendered when required params are NOT defined', async () => {
  mockContext = undefined
  expect(render(<WrapperComponent />).queryByTestId('error-tracking-child-mounter')).toBeNull()

  mockContext = mockExecutionContextUndefinedRunSequence
  expect(render(<WrapperComponent />).queryByTestId('error-tracking-child-mounter')).toBeNull()

  mockContext = mockExecutionContextUndefinedPipelineIdentifier
  expect(render(<WrapperComponent />).queryByTestId('error-tracking-child-mounter')).toBeNull()

  mockContext = mockExecutionContextUndefinedStartTs
  expect(render(<WrapperComponent />).queryByTestId('error-tracking-child-mounter')).toBeNull()

  mockContext = mockExecutionContextUndefinedExecutionSummary
  expect(render(<WrapperComponent />).queryByTestId('error-tracking-child-mounter')).toBeNull()
})
