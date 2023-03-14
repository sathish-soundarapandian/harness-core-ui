/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import {
  useGetStreamingDestinationsAggregateQuery,
  useGetStreamingDestinationsCardsQuery
} from '@harnessio/react-audit-service-client'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import * as auditServices from 'services/audit'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import AuditTrailsPage, { VIEWS } from '../AuditTrailsPage'
import { filters } from '../../../components/__tests__/mockData'
import { mockAggregateListResponse, mockStreamingDestinationCards } from '../views/__tests__/mockAuditLogStreaming'

jest.spyOn(auditServices, 'useGetAuditFilterList').mockImplementation(() => ({ data: filters, loading: false } as any))

jest.mock('@harnessio/react-audit-service-client')
const mockAggregatePromise = jest.fn(() => Promise.resolve(mockAggregateListResponse))
const mockCardsPromise = jest.fn(() => Promise.resolve(mockStreamingDestinationCards))
const useGetStreamingDestinationsAggregateQueryMock =
  useGetStreamingDestinationsAggregateQuery as jest.MockedFunction<any>
useGetStreamingDestinationsAggregateQueryMock.mockImplementation(() => {
  return { data: mockAggregateListResponse, error: false, isFetching: false, refetch: mockAggregatePromise }
})
const useGetStreamingDestinationsCardsQueryMock = useGetStreamingDestinationsCardsQuery as jest.MockedFunction<any>
useGetStreamingDestinationsCardsQueryMock.mockImplementation(() => {
  return { data: mockStreamingDestinationCards, error: false, isFetching: false, refetch: mockCardsPromise }
})

jest.mock('@harness/uicore', () => {
  return {
    ...jest.requireActual('@harness/uicore'),
    DateRangePickerButton: (props: any) => {
      return (
        <div data-testid="datefilter">
          {props.renderButtonText([{ toLocaleDateString: () => 'startDate' }, { toLocaleDateString: () => 'endDate' }])}
        </div>
      )
    }
  }
})

describe('Audit trail Page', () => {
  test('render', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      PL_AUDIT_LOG_STREAMING_ENABLED: true
    })
    const renderObj = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditTrailsPage />
      </TestWrapper>
    )
    expect(renderObj.container).toMatchSnapshot()
  })

  test('render AuditLogStreaming Page', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      PL_AUDIT_LOG_STREAMING_ENABLED: true
    })
    const renderObj = render(
      <TestWrapper
        queryParams={{ view: VIEWS.AUDIT_LOG_STREAMING }}
        path={routes.toAuditTrail({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <AuditTrailsPage />
      </TestWrapper>
    )
    expect(renderObj.container).toMatchSnapshot()
  })
})
