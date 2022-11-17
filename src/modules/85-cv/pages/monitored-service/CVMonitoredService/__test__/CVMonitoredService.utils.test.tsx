/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TableV2 } from '@harness/uicore'

import type { RiskData } from 'services/cv'
import { RiskValues, getRiskColorValue, getRiskLabelStringId } from '@cv/utils/CommonUtils'
import {
  rowData,
  changeSummary,
  changeSummaryWithNegativeChange,
  changeSummaryWithPositiveChange
} from './CVMonitoredService.mock'
import { HistoricalTrendChartOption, DefaultChangePercentage } from '../CVMonitoredService.constants'
import {
  RenderHealthScore,
  RenderHealthTrend,
  createTrendDataWithZone,
  getHistoricalTrendChartOption,
  calculateChangePercentage
} from '../CVMonitoredService.utils'

const trendChartMockData: RiskData[] = [
  { healthScore: 2, riskStatus: RiskValues.HEALTHY },
  { healthScore: 4, riskStatus: RiskValues.HEALTHY },
  { healthScore: 8, riskStatus: RiskValues.NEED_ATTENTION },
  { healthScore: 16, riskStatus: RiskValues.UNHEALTHY }
]

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (val: string) => val
  })
}))
describe('Test util functions', () => {
  test('validare createTrendDataWithZone', () => {
    const trendSeries = createTrendDataWithZone(trendChartMockData)
    const { data, zones } = trendSeries
    expect(data).toEqual([
      { x: 0, y: 2 },
      { x: 1, y: 4 },
      { x: 2, y: 8 },
      { x: 3, y: 16 }
    ])
    expect(zones).toEqual([
      {
        color: getRiskColorValue(RiskValues.HEALTHY),
        value: 2
      },
      {
        color: getRiskColorValue(RiskValues.NEED_ATTENTION),
        value: 3
      },
      {
        color: getRiskColorValue(RiskValues.UNHEALTHY),
        value: undefined
      }
    ])

    const trendChartOption = getHistoricalTrendChartOption(trendChartMockData)
    expect(trendChartOption).toEqual({
      ...HistoricalTrendChartOption,
      series: [{ ...trendSeries }]
    })
  })

  test('calculateChangePercentage should return correct output', () => {
    // Change summary is empty
    const outputWithEmptyObject = calculateChangePercentage({})
    expect(outputWithEmptyObject).toEqual(DefaultChangePercentage)
    // With zero values for all changes
    const outputWithDefaultObject = calculateChangePercentage(changeSummary)
    expect(outputWithDefaultObject).toEqual(DefaultChangePercentage)

    const outputWithPositiveValue = calculateChangePercentage(changeSummaryWithPositiveChange)
    expect(outputWithPositiveValue).toEqual({
      color: 'success',
      percentage: 20
    })

    const outputWithNegativeObject = calculateChangePercentage(changeSummaryWithNegativeChange)
    expect(outputWithNegativeObject).toEqual({
      color: 'error',
      percentage: 20
    })
  })

  test('should render tags', async () => {
    const { container, getByText } = render(
      <TableV2
        sortable={true}
        columns={[
          {
            Header: 'RenderHealthTrend',
            width: '20%',
            Cell: RenderHealthTrend
          },
          {
            Header: 'RenderHealthScore',
            width: '20%',
            Cell: RenderHealthScore
          }
        ]}
        data={[rowData.original]}
      />
    )

    await waitFor(() => expect(container.querySelector('.highcharts-container')).toBeTruthy())
    await waitFor(() => expect(getByText(getRiskLabelStringId(RiskValues.NEED_ATTENTION))).toBeTruthy())
  })
})
