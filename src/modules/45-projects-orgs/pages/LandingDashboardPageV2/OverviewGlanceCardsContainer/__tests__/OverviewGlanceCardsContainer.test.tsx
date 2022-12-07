/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetCounts } from 'services/dashboard-service'
import { DEFAULT_TIME_RANGE } from '@common/utils/momentUtils'
import OverviewGlanceCardsContainer from '../OverviewGlanceCardsContainer'

jest.mock('services/dashboard-service')
;(useGetCounts as jest.Mock).mockImplementation(() => {
  return {
    data: {}
  }
})

jest.mock('../OverviewGlanceCardV2/OverviewGlanceCardV2.tsx', () => {
  return () => 'Overview glance v2'
})

describe('landing dashboard page tests', () => {
  test('render', () => {
    const { queryByText } = render(
      <TestWrapper>
        <OverviewGlanceCardsContainer timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )

    expect(queryByText('projectsText')).toBeDefined()
    expect(queryByText('services')).toBeDefined()
    expect(queryByText('environments')).toBeDefined()
    expect(queryByText('pipelines')).toBeDefined()
  })

  test('test loading state', () => {
    ;(useGetCounts as jest.Mock).mockImplementation(() => {
      return {
        data: {},
        loading: true
      }
    })
    const { container } = render(
      <TestWrapper>
        <OverviewGlanceCardsContainer timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )

    expect(container.querySelector('span[data-icon="spinner"]')).toBeDefined()
  })

  test('test with data', () => {
    ;(useGetCounts as jest.Mock).mockImplementation(() => {
      return {
        data: {
          data: {
            response: {
              projectsCountDetail: {
                count: 10,
                countChangeAndCountChangeRateInfo: {
                  countChange: 10,
                  countChangeRate: 50
                }
              }
            }
          }
        },
        loading: false
      }
    })
    const { container } = render(
      <TestWrapper>
        <OverviewGlanceCardsContainer timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
