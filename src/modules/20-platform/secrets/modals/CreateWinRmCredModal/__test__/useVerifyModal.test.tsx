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
import { useVerifyModal } from '../useVerifyModal'

const secretMock: SecretDTOV2 = {
  identifier: 'dummy identifier',
  name: 'dummy name',
  spec: {
    errorMessageForInvalidYaml: 'error message'
  },
  type: 'WinRmCredentials'
}

describe('Test hook for correctness', () => {
  test('render useVerifyModal hook with truthy data', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useVerifyModal(), { wrapper })
    expect(Object.keys(result.current).indexOf('openVerifyModal')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('closeVerifyModal')).not.toBe(-1)
    await waitFor(() => {
      expect(result.current.openVerifyModal(secretMock)).toBe(undefined)
    })
  })

  test('render useVerifyModal hook with falsy data', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useVerifyModal(), { wrapper })
    expect(Object.keys(result.current).indexOf('openVerifyModal')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('closeVerifyModal')).not.toBe(-1)
    await waitFor(() => {
      expect(result.current.openVerifyModal(undefined)).toBe(undefined)
    })
  })
})
