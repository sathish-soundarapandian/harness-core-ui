/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { FetchOverviewTimeSeriesDocument } from 'services/ce/services'
import OverviewCostByProviders from '../OverviewCostByProviders'
import ResponseData from './OverviewTimeSeriesData.json'

describe('Test cases for Overview cost By provider', () => {
  test('Should render the overview cost by providers', () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchOverviewTimeSeriesDocument) {
          return fromValue(ResponseData)
        }
      }
    }
    const { getByText } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <OverviewCostByProviders timeRange={{ to: '2022-03-09', from: '2022-03-03' }} clusterDataPresent={false} />
        </Provider>
      </TestWrapper>
    )

    expect(getByText('ce.overview.cardtitles.costByProviders')).toBeDefined()
  })
})
