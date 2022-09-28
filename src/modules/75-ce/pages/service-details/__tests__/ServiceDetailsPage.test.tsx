/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { TestWrapper } from '@common/utils/testUtils'
import {
  FetchServiceGridDocument,
  FetchServiceSummaryDocument,
  FetchServiceTimeSeriesDocument
} from 'services/ce/services'

import ChartResponseData from '../../workload-details/__test__/ChartResponseData.json'
import SummaryResponseData from '../../workload-details/__test__/SummaryDataResponse.json'
import GridResponseData from '../../workload-details/__test__/GridDataResponse.json'
import ServiceDetailsPage from '../ServiceDetailsPage'

jest.mock('@ce/components/CEChart/CEChart', () => 'mock')

const params = {
  accountId: 'TEST_ACC',
  clusterName: 'clusterName',
  namespace: 'namespace',
  workloadName: 'workloadName'
}

describe('Test cases for Service Details page', () => {
  test('Should be able to render the details page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchServiceGridDocument) {
          return fromValue(GridResponseData)
        }
        if (query === FetchServiceSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchServiceTimeSeriesDocument) {
          return fromValue(ChartResponseData)
        }
        return fromValue({})
      }
    }

    const { getByText } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <ServiceDetailsPage />
        </Provider>
      </TestWrapper>
    )

    expect(getByText('ce.serviceDetails.title')).toBeDefined()
  })

  test('Should be able to render the details page / No data', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchServiceGridDocument) {
          return fromValue({ data: { perspectiveGrid: { data: [] } } })
        }
        if (query === FetchServiceTimeSeriesDocument) {
          return fromValue({ data: { perspectiveTimeSeriesStats: { cpuRequest: [] } } })
        }
        return fromValue({})
      }
    }

    const { getByText } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <ServiceDetailsPage />
        </Provider>
      </TestWrapper>
    )

    expect(getByText('ce.pageErrorMsg.perspectiveNoData')).toBeDefined()
  })
})
