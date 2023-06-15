/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import Step3Verify from '../Step3Verify/Step3Verify'

const createGroupFn = jest.fn().mockReturnValue({
  ok: true
})
jest.mock('services/portal', () => ({
  useCreateDelegateGroup: jest.fn().mockImplementation(() => {
    return {
      mutate: createGroupFn
    }
  }),
  useGetDelegatesHeartbeatDetailsV2: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Create Docker Step3Verify', () => {
  test('render data and create delegate group', async () => {
    const { container, getByRole } = render(
      <TestWrapper>
        <Step3Verify onClose={() => jest.fn()} />
      </TestWrapper>
    )

    const doneBtn = getByRole('button', { name: 'done' })
    act(() => {
      userEvent.click(doneBtn!)
    })

    expect(container).toMatchSnapshot()
  })
  test('render data and go back', () => {
    const { container } = render(
      <TestWrapper>
        <Step3Verify />
      </TestWrapper>
    )

    const backBtn = container.querySelector('button') as HTMLButtonElement

    userEvent.click(backBtn!)

    expect(container).toMatchSnapshot()
  })
})
