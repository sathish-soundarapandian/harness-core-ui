/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import Step1Setup from '../Step1Setup/Step1Setup'

const nextStepFn = jest.fn().mockImplementation(() => undefined)

jest.mock('services/portal', () => ({
  useGetDelegateSizes: jest.fn().mockImplementation(() => {
    return {
      data: [
        {
          size: 'MEDIUM',
          label: 'medium',
          ram: '16',
          cpu: '4'
        }
      ],
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  validateDockerDelegatePromise: jest.fn().mockImplementation(() => Promise.resolve({ responseMessages: [] }))
}))

jest.mock('services/cd-ng', () => ({
  useCreateDelegateToken: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => undefined)
  })),
  useGetDelegateTokens: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => ({
      resource: [
        {
          name: 'Token 1'
        },
        {
          name: 'Token 2'
        }
      ]
    }))
  }))
}))

describe('Create Docker Step1Setup', () => {
  test('render step1 initial', () => {
    const { container } = render(
      <TestWrapper>
        <Step1Setup />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('render step1 with previous data', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <Step1Setup
          prevStepData={{
            name: 'delegate1docker',
            identifier: 'delegate1ident',
            description: '',
            tags: ['tag1', 'tag2'],
            tokenName: 'Token 1'
          }}
          nextStep={nextStepFn}
        />
      </TestWrapper>
    )
    const submitBtn = getByRole('button', { name: /continue/ })
    userEvent.click(submitBtn!)

    await waitFor(() => {
      expect(nextStepFn).toBeCalled()
    })
  })
})
