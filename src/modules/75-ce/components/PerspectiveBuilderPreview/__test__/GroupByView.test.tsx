/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, queryByAttribute, render, act, queryByText } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { DEFAULT_TIME_RANGE } from '@common/utils/momentUtils'
import { TestWrapper } from '@common/utils/testUtils'
import {
  FetchPerspectiveTimeSeriesDocument,
  FetchPerspectiveDetailsSummaryDocument,
  FetchViewFieldsDocument,
  FetchperspectiveGridDocument,
  ViewChartType
} from 'services/ce/services'

import ChartResponseData from '@ce/pages/perspective-details/__test__/ChartDataResponse.json'
import SummaryResponseData from '@ce/pages/perspective-details/__test__/SummaryResponse.json'
import ViewFieldResponseData from '@ce/pages/perspective-details/__test__/ViewFieldResponse.json'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import GroupByView from '../GroupByView/GroupByView'

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test cases for GroupByView component', () => {
  test('should be able to render the component', () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveTimeSeriesDocument) {
          return fromValue(ChartResponseData)
        }
        if (query === FetchperspectiveGridDocument) {
          return fromValue({})
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchViewFieldsDocument) {
          return fromValue(ViewFieldResponseData)
        }
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <GroupByView
            groupBy={DEFAULT_GROUP_BY}
            setGroupBy={jest.fn()}
            chartType={ViewChartType.StackedTimeSeries}
            timeRange={DEFAULT_TIME_RANGE}
            setChartType={jest.fn()}
            showBusinessMappingButton={true}
          />
        </Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should be able to render the component and be able to change chart type', () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveTimeSeriesDocument) {
          return fromValue(ChartResponseData)
        }
        if (query === FetchperspectiveGridDocument) {
          return fromValue({})
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchViewFieldsDocument) {
          return fromValue(ViewFieldResponseData)
        }
        return fromValue({})
      }
    }

    const setChartType = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <GroupByView
            groupBy={DEFAULT_GROUP_BY}
            setGroupBy={jest.fn()}
            chartType={ViewChartType.StackedTimeSeries}
            timeRange={DEFAULT_TIME_RANGE}
            setChartType={setChartType}
            showBusinessMappingButton={true}
          />
        </Provider>
      </TestWrapper>
    )

    const chartIcon = queryByAttribute('class', container, /bp3-icon-timeline-area-chart/)
    act(() => {
      fireEvent.click(chartIcon!)
    })

    expect(setChartType).toBeCalledWith(ViewChartType.StackedLineChart)
  })

  test('should be able to render the component and be able to change chart type from line to area', () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveTimeSeriesDocument) {
          return fromValue(ChartResponseData)
        }
        if (query === FetchperspectiveGridDocument) {
          return fromValue({})
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchViewFieldsDocument) {
          return fromValue(ViewFieldResponseData)
        }
        return fromValue({})
      }
    }

    const setChartType = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <GroupByView
            groupBy={DEFAULT_GROUP_BY}
            setGroupBy={jest.fn()}
            chartType={ViewChartType.StackedLineChart}
            timeRange={DEFAULT_TIME_RANGE}
            setChartType={setChartType}
            showBusinessMappingButton={true}
          />
        </Provider>
      </TestWrapper>
    )

    const chartIcon = queryByAttribute('class', container, /bp3-icon-timeline-bar-chart/)
    act(() => {
      fireEvent.click(chartIcon!)
    })

    expect(setChartType).toBeCalledWith(ViewChartType.StackedTimeSeries)
  })

  test('should be able to render the component and be able to open drop down', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveTimeSeriesDocument) {
          return fromValue(ChartResponseData)
        }
        if (query === FetchperspectiveGridDocument) {
          return fromValue({})
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchViewFieldsDocument) {
          return fromValue(ViewFieldResponseData)
        }
        return fromValue({})
      }
    }

    const setChartType = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <GroupByView
            groupBy={DEFAULT_GROUP_BY}
            setGroupBy={jest.fn()}
            chartType={ViewChartType.StackedLineChart}
            timeRange={DEFAULT_TIME_RANGE}
            setChartType={setChartType}
            showBusinessMappingButton={true}
          />
        </Provider>
      </TestWrapper>
    )

    const productText = queryByText(container, 'Product')
    act(() => {
      fireEvent.click(productText!)
    })

    expect(queryByText(document.body, 'Common')).toBeInTheDocument()
  })

  test('should be able to render the component and be able to open business mapping builder', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveTimeSeriesDocument) {
          return fromValue(ChartResponseData)
        }
        if (query === FetchperspectiveGridDocument) {
          return fromValue({})
        }
        if (query === FetchPerspectiveDetailsSummaryDocument) {
          return fromValue(SummaryResponseData)
        }
        if (query === FetchViewFieldsDocument) {
          return fromValue(ViewFieldResponseData)
        }
        return fromValue({})
      }
    }

    const setChartType = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <GroupByView
            groupBy={DEFAULT_GROUP_BY}
            setGroupBy={jest.fn()}
            chartType={ViewChartType.StackedLineChart}
            timeRange={DEFAULT_TIME_RANGE}
            setChartType={setChartType}
            showBusinessMappingButton={true}
          />
        </Provider>
      </TestWrapper>
    )

    const newBmButton = queryByText(container, 'ce.businessMapping.newButton')
    act(() => {
      fireEvent.click(newBmButton!)
    })

    expect(queryByText(document.body, 'ce.businessMapping.form.saveText')).toBeInTheDocument()
  })
})
