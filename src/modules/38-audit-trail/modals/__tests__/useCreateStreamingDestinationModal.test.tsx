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
import useCreateStreamingDestinationModal from '@audit-trail/modals/StreamingDestinationModal/useCreateStreamingDestinationModal'
import { CreateStreamingDestinationWizard } from '@audit-trail/components/CreateStreamingDestination/CreateStreamingDestinationWizard'
import { mockAggregateListResponse } from '@audit-trail/pages/AuditTrails/views/__tests__/mockAuditLogStreaming'

jest.mock('@audit-trail/components/CreateStreamingDestination/CreateStreamingDestinationWizard.tsx')
;(CreateStreamingDestinationWizard as jest.Mock).mockImplementation(() => 'CreateStreamingDestinationWizard')

describe('useCreateStreamingDestinationModal tests', () => {
  test('render useCreateStreamingDestinationModal hook with truthy data', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useCreateStreamingDestinationModal(), { wrapper })
    expect(Object.keys(result.current).indexOf('openStreamingDestinationModal')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('closeStreamingDestinationModal')).not.toBe(-1)
    await waitFor(() => {
      expect(result.current.openStreamingDestinationModal(true, undefined, mockAggregateListResponse[0])).toBe(
        undefined
      )
    })
    await waitFor(() => {
      expect(result.current.closeStreamingDestinationModal()).toBe(undefined)
    })
  })
})
