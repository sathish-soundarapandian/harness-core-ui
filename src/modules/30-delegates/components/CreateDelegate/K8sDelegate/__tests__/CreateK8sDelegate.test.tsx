/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as constants from '@delegates/constants'
import CreateK8sDelegate from '../CreateK8sDelegate'
import DelegateSizesmock from './DelegateSizesmock.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateProfilesV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegateSizes: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: DelegateSizesmock, refetch: jest.fn(), error: null, loading: false }
  }),
  useValidateKubernetesYaml: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      mutate: jest.fn().mockImplementation(() =>
        Promise.resolve({
          responseMessages: [],
          resource: 'yaml value'
        })
      )
    }
  })
}))

jest.mock('services/cd-ng', () => ({
  useListDelegateProfilesNg: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useCreateDelegateToken: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(() => undefined)
  })),
  useGetDelegateTokens: jest.fn().mockReturnValue({
    data: {
      resource: [{ name: 'Token1' }]
    },
    refetch: jest.fn().mockImplementation(() => ({
      resource: [{ name: 'Token1' }]
    }))
  })
}))
jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn()
  })
}))
const onBack = jest.fn()

describe('Create K8s Delegate', () => {
  test('test component flow', async () => {
    jest.spyOn(constants, 'isHelmDelegateEnabled').mockImplementation(() => false)
    const { container, getByRole } = render(
      <TestWrapper>
        <CreateK8sDelegate onBack={onBack} />
      </TestWrapper>
    )

    const delegateNameInput = container.getElementsByTagName('input')[0]

    fireEvent.change(delegateNameInput, {
      target: { value: 'new-delegate-name' }
    })

    const continueBtn = getByRole('button', { name: /continue/ })
    userEvent.click(continueBtn!)

    await waitFor(() => {
      expect(document.body.innerHTML).not.toContain('continue')
    })
  })
  test('test back btn', () => {
    const { container } = render(
      <TestWrapper>
        <CreateK8sDelegate onBack={onBack} />
      </TestWrapper>
    )
    const buttons = container.getElementsByTagName('button')
    const backBtn = buttons[1]
    act(() => {
      fireEvent.click(backBtn!)
    })
    expect(onBack).toBeCalled()
  })
})
