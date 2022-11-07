/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { SecretDTOV2 } from 'services/cd-ng'

import useCreateSSHCredModal from '../useCreateSSHCredModal'
import { getV2SecretMock } from './mock'

jest.useFakeTimers()

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),

  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(getV2SecretMock))
}))

describe('Create SSH Cred Modal', () => {
  const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
    <TestWrapper>{children}</TestWrapper>
  )
  test('should render form create edit', async () => {
    const { result } = renderHook(
      () =>
        useCreateSSHCredModal({
          onSuccess: jest.fn(),
          onClose: jest.fn()
        }),
      { wrapper }
    )

    expect(Object.keys(result.current).indexOf('openCreateSSHCredModal')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('closeCreateSSHCredModal')).not.toBe(-1)

    const dialog = await waitFor(() => {
      result.current.openCreateSSHCredModal({
        type: 'SSHKey',
        name: 'test-ssh-cred',
        identifier: 'testsshcred',
        orgIdentifier: 'default',
        projectIdentifier: 'SSH_Testing',
        tags: {},
        description: '',
        spec: {
          port: 22,
          auth: {
            spec: {
              credentialType: 'KeyReference',
              spec: {
                userName: 'a1',
                key: 'secretpemawsqasetup',
                encryptedPassphrase: null
              }
            },
            type: 'SSH'
          }
        }
      } as SecretDTOV2)
    })
    expect(dialog).toBe(undefined)

    expect(result.current.openCreateSSHCredModal).toBeDefined()
  })

  test('should render form create view', async () => {
    const { result } = renderHook(
      () =>
        useCreateSSHCredModal({
          onSuccess: jest.fn(),
          onClose: jest.fn()
        }),
      { wrapper }
    )

    const dialog = await waitFor(() => {
      result.current.openCreateSSHCredModal(undefined)
    })
    expect(dialog).toBe(undefined)

    expect(result.current.openCreateSSHCredModal).toBeDefined()
  })
})
