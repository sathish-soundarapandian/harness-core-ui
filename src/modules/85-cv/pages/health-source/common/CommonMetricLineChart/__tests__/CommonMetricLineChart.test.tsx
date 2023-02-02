/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import CommonMetricLineChart from '../CommonMetricLineChart'

const timeLineData = [
  [1638843480000000, 144],
  [1638843540000000, 144],
  [1638843600000000, 144],
  [1638843660000000, 144],
  [1638843720000000, 144],
  [1638843780000000, 144],
  [1638843840000000, 144],
  [1638843900000000, 144],
  [1638843960000000, 144],
  [1638844020000000, 144]
]

jest.mock('highcharts-react-official', () => () => <></>)
describe('Validate CommonCommonMetricLineChart', () => {
  test('should render with Data', () => {
    const { container } = render(
      <TestWrapper>
        <CommonMetricLineChart options={timeLineData} loading={false} error={null} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render with loading state', () => {
    const { container } = render(
      <TestWrapper>
        <CommonMetricLineChart options={[]} loading={true} error={null} />
      </TestWrapper>
    )
    expect(container.querySelector('span[data-icon="spinner"]')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('should render with error state', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CommonMetricLineChart options={[]} loading={false} error={{ data: { message: 'mockError' } } as any} />
      </TestWrapper>
    )
    expect(getByText('mockError')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
