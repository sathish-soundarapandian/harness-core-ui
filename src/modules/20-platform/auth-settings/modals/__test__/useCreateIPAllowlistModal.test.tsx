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
import useCreateIPAllowlistModal from '@auth-settings/modals/IPAllowlistModal/useCreateIPAllowlistModal'
import CreateIPAllowlistWizard from '@auth-settings/components/CreateIPAllowlist/CreateIPAllowlistWizard'
import { mockIPAllowlistConfigs } from '@auth-settings/modals/__test__/mocks/ipAllowlistModals.mock'

jest.mock('@auth-settings/components/CreateIPAllowlist/CreateIPAllowlistWizard')
;(CreateIPAllowlistWizard as jest.Mock).mockImplementation(() => 'CreateIPAllowlistWizard')

describe('useCreateIPAllowlistModal tests', () => {
  test('render useCreateIPAllowlistModal hook with truthy data', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useCreateIPAllowlistModal(), { wrapper })
    expect(Object.keys(result.current).indexOf('openIPAllowlistModal')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('closeIPAllowlistModal')).not.toBe(-1)
    await waitFor(() => {
      expect(result.current.openIPAllowlistModal(true, undefined, mockIPAllowlistConfigs[0])).toBe(undefined)
    })
    await waitFor(() => {
      expect(result.current.closeIPAllowlistModal()).toBe(undefined)
    })
  })
})
