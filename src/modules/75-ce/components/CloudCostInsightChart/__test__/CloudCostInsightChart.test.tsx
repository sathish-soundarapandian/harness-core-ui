/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CCM_CHART_TYPES } from '@ce/constants'
import { QlceViewTimeGroupType } from 'services/ce/services'
import { CCM_PAGE_TYPE } from '@ce/types'
import CloudCostInsightChart from '../CloudCostInsightChart'

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('Test cases for cloud cost insight charts', () => {
  test('Should be able to render the chart component', async () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudCostInsightChart
            fetching={false}
            data={null}
            columnSequence={[]}
            chartType={CCM_CHART_TYPES.LINE}
            aggregation={QlceViewTimeGroupType.Day}
            xAxisPointCount={0}
          />
        </Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should show loading in case data is not present', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudCostInsightChart
            fetching={true}
            data={null}
            columnSequence={[]}
            chartType={CCM_CHART_TYPES.LINE}
            aggregation={QlceViewTimeGroupType.Day}
            xAxisPointCount={0}
            pageType={CCM_PAGE_TYPE.Node}
          />
        </Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const spinner = container.querySelector('[data-testid="loader"]')
    expect(spinner).toBeTruthy()
  })
})
