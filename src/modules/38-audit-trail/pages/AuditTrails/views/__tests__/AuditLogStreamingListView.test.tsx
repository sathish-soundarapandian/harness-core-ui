/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, RenderResult, queryByText, getByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { updateStreamingDestination, deleteDisabledStreamingDestination } from '@harnessio/react-audit-service-client'

import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import AuditLogStreamingCards from '@audit-trail/components/AuditLogStreamingCards/AuditLogStreamingCards'
import AuditLogStreamingError from '@audit-trail/components/AuditLogStreamingError/AuditLogStreamingError'
import { VIEWS } from '../../AuditTrailsPage'
import AuditLogStreamingListView from '../AuditLogStreamingListView'
import { mockAggregateListResponse, mockResponseCreateOrUpdateStreamingDestination } from './mockAuditLogStreaming'

jest.mock('@harnessio/react-audit-service-client')
const updateStreamingDestinationMock = updateStreamingDestination as jest.MockedFunction<any>
updateStreamingDestinationMock.mockImplementation(() => {
  return mockResponseCreateOrUpdateStreamingDestination
})
const deleteDisabledStreamingDestinationMock = deleteDisabledStreamingDestination as jest.MockedFunction<any>
deleteDisabledStreamingDestinationMock.mockImplementation(() => {
  return ''
})

jest.mock('@audit-trail/components/AuditLogStreamingCards/AuditLogStreamingCards')
;(AuditLogStreamingCards as jest.Mock).mockImplementation(() => 'AuditLogStreamingCards')
jest.mock('@audit-trail/components/AuditLogStreamingError/AuditLogStreamingError')
;(AuditLogStreamingError as jest.Mock).mockImplementation(() => 'AuditLogStreamingError')
const openStreamingDestinationModal = jest.fn()

describe('AuditLogStreaming List View', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  let findAllByTestId: RenderResult['findAllByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        queryParams={{ view: VIEWS.AUDIT_LOG_STREAMING }}
        path={routes.toAuditTrail({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <AuditLogStreamingListView
          data={mockAggregateListResponse}
          openStreamingDestinationModal={openStreamingDestinationModal}
        />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    findAllByTestId = renderObj.findAllByTestId
    await waitFor(() => getAllByText('auditTrail.logStreaming.destinationName'))
  })

  test('Renders Columns correctly', () => {
    const firstConnectorName = mockAggregateListResponse[0].connector_info.name
    const firstStreamingDestinationName = mockAggregateListResponse[0].streaming_destination.name
    const connectorName = getByText(document.body, firstConnectorName)
    expect(connectorName).toBeDefined()
    expect(firstStreamingDestinationName).toBeDefined()
  })

  test('Toggle status', async () => {
    const toggleStatus = await findAllByTestId('toggleStatus')
    act(() => {
      fireEvent.click(toggleStatus[0]!) // Inactive status
    })
    expect(updateStreamingDestinationMock).toHaveBeenCalledTimes(1)
    act(() => {
      fireEvent.click(toggleStatus[1]!) // Active status
    })
    expect(updateStreamingDestinationMock).toHaveBeenCalledTimes(2)
  })

  test('Delete Streaming Destinaton', async () => {
    const menu = container.querySelector(
      `[data-testid="menu-${mockAggregateListResponse[0].streaming_destination.identifier}"]`
    )
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const deleteMenu = getByText(popover as HTMLElement, 'delete')
    fireEvent.click(deleteMenu)
    await waitFor(() => getByText(document.body, 'auditTrail.logStreaming.deleteSDDialogTitle'))
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    const deleteBtn = queryByText(form as HTMLElement, 'delete')
    fireEvent.click(deleteBtn!)
    expect(deleteDisabledStreamingDestinationMock).toHaveBeenCalled()
  })

  test('Expand row', async () => {
    const expandRowBtns = await findAllByTestId('row-expand-btn')
    await act(async () => {
      fireEvent.click(expandRowBtns[0]!)
      let error
      await waitFor(() => {
        error = getByText(document.body, 'AuditLogStreamingError')
        return error
      })
      expect(error).toBeInTheDocument()
    })
  })
})
