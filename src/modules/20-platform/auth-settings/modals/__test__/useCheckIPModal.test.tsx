/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { TestWrapper } from '@common/utils/testUtils'
import useCheckIPModal from '@auth-settings/modals/CheckIPModal/useCheckIPModal'

jest.mock('@auth-settings/components/CreateIPAllowlist/CreateIPAllowlistWizard')

describe('useCheckIPModal tests', () => {
  test('render useCheckIPModal hook with truthy data', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useCheckIPModal(), { wrapper })
    expect(Object.keys(result.current).indexOf('openCheckIPModal')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('closeCheckIPModal')).not.toBe(-1)
    await waitFor(() => {
      expect(result.current.openCheckIPModal()).toBe(undefined)
    })
    await waitFor(() => {
      expect(result.current.closeCheckIPModal()).toBe(undefined)
    })
  })
})
