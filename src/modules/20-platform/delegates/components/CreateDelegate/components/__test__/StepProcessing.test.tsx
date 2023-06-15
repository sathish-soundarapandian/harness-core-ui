/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import StepProcessing from '../StepProcessing/StepProcessing'

const mockGetCallFunction = jest.fn()

jest.mock('services/portal', () => ({
  useGetDelegatesHeartbeatDetailsV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegatesInitializationDetailsV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Create StepProcessing Component', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <StepProcessing />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
