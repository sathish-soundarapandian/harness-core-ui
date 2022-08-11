/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/dom'

import { TestWrapper } from '@common/utils/testUtils'
import type { SecretDTOV2 } from 'services/cd-ng'
import { useCreateWinRmCredModal } from '../useCreateWinRmCredModal'

const secretMock = {
  identifier: 'dummy identifier',
  name: 'dummy name',
  spec: {
    errorMessageForInvalidYaml: 'error message',
    auth: {
      type: 'NTLM',
      spec: {
        tgtGenerationMethod: undefined
      }
    }
  },
  type: 'WinRmCredentials'
}

jest.mock('@secrets/utils/SSHAuthUtils', () => ({
  getSecretReferencesforSSH: jest.fn().mockResolvedValue({
    passwordSecret: 'password'
  })
}))

describe('Test hook for correctness', () => {
  test('render useCreateWinRmCredModal hook edit view', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useCreateWinRmCredModal({
          onSuccess: jest.fn()
        }),
      { wrapper }
    )
    expect(Object.keys(result.current).indexOf('openCreateWinRmCredModal')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('closeCreateWinRmCredModal')).not.toBe(-1)
    const dialog = await waitFor(() => {
      result.current.openCreateWinRmCredModal(secretMock as SecretDTOV2)
    })
    expect(dialog).toBe(undefined)
  })

  test('render useCreateWinRmCredModal hook create view', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useCreateWinRmCredModal({
          onSuccess: jest.fn()
        }),
      { wrapper }
    )
    expect(Object.keys(result.current).indexOf('openCreateWinRmCredModal')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('closeCreateWinRmCredModal')).not.toBe(-1)
    const dialog = await waitFor(() => {
      result.current.openCreateWinRmCredModal(undefined)
    })
    expect(dialog).toBe(undefined)
  })
})
