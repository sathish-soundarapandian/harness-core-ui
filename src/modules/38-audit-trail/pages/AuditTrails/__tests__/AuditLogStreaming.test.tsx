/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, act, queryByAttribute } from '@testing-library/react'
import {
  useGetStreamingDestinationsAggregateQuery,
  useGetStreamingDestinationsCardsQuery,
  StreamingDestinationAggregateListResponseResponse,
  StreamingDestinationCards
} from '@harnessio/react-audit-service-client'
import AuditLogStreamingListView from '@audit-trail/pages/AuditTrails/views/AuditLogStreamingListView'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import AuditLogStreaming from '../AuditLogStreaming'
import { mockAggregateListResponse, mockStreamingDestinationCards } from '../views/__tests__/mockAuditLogStreaming'

jest.mock('@harnessio/react-audit-service-client')

jest.mock('@audit-trail/pages/AuditTrails/views/AuditLogStreamingListView')
;(AuditLogStreamingListView as jest.Mock).mockImplementation(() => 'AuditLogStreamingListView')

const mockWithData = (
  aggregateData: StreamingDestinationAggregateListResponseResponse | undefined,
  cardsData: StreamingDestinationCards | undefined
): { mockAggregatePromise: () => Promise<StreamingDestinationAggregateListResponseResponse | undefined> } => {
  const mockAggregatePromise = jest.fn(() => Promise.resolve(aggregateData))
  const mockCardsPromise = jest.fn(() => Promise.resolve(cardsData))
  const useGetStreamingDestinationsAggregateQueryMock =
    useGetStreamingDestinationsAggregateQuery as jest.MockedFunction<any>
  useGetStreamingDestinationsAggregateQueryMock.mockImplementation(() => {
    return { data: aggregateData, error: false, isFetching: false, refetch: mockAggregatePromise }
  })
  const useGetStreamingDestinationsCardsQueryMock = useGetStreamingDestinationsCardsQuery as jest.MockedFunction<any>
  useGetStreamingDestinationsCardsQueryMock.mockImplementation(() => {
    return { data: cardsData, error: false, isFetching: false, refetch: mockCardsPromise }
  })
  return { mockAggregatePromise }
}

describe('Audit Log Streaming', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })
  test('render, click on newStreamingDestinationBtn and closeButton', async () => {
    const { mockAggregatePromise } = mockWithData(mockAggregateListResponse, mockStreamingDestinationCards)

    const { container, getByText } = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditLogStreaming />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const newStreamingDestinationBtn = getByText('auditTrail.logStreaming.newStreamingDestination')
    await act(async () => {
      fireEvent.click(newStreamingDestinationBtn!)
    })
    const confirmDialog = document.querySelectorAll('.bp3-dialog')[0] as HTMLElement
    const closeIcon = queryByAttribute('icon', confirmDialog, 'cross')
    await act(async () => {
      fireEvent.click(closeIcon!)
    })
    await waitFor(() => expect(mockAggregatePromise).toHaveBeenCalled())
  })
  test('render with undefined data', () => {
    mockWithData(undefined, undefined)

    const { container } = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditLogStreaming />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
