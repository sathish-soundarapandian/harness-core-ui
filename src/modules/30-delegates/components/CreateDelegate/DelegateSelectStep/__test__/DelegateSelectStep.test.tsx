/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, wait } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DelegateTypes } from '@delegates/constants'
import DelegateSelectStep from '../DelegateSelectStep'

const mockFn = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSizes: jest.fn().mockImplementation(() => {
    return {
      data: {
        resource: [
          {
            size: 'MEDIUM',
            label: 'medium',
            ram: '16',
            cpu: '4'
          }
        ]
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
jest.mock('services/cd-ng', () => ({
  useIsImmutableDelegateEnabled: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  })
}))
describe('Delgate Select StepWizard', () => {
  test('render DelegateSelectStep', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectStep type={DelegateTypes.KUBERNETES_CLUSTER} name={'Step 1'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Click continue button', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectStep type={DelegateTypes.KUBERNETES_CLUSTER} name={'Step 1'} onClick={mockFn} />
      </TestWrapper>
    )
    const step1ContinueButton = container?.querySelector('#step1ContinueButton')
    fireEvent.click(step1ContinueButton!)
    await wait()
    expect(container).toMatchSnapshot()
  })
})
