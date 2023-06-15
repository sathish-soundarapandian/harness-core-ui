/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as useUsage from '@common/hooks/useGetUsageAndLimit'
import type { UsageAndLimitReturn } from '@common/hooks/useGetUsageAndLimit'
import STOUsageInfo from '../overview/STOUsageInfo'

describe('STOUsageInfo', () => {
  test('STOUsageInfo', () => {
    const data: UsageAndLimitReturn = {
      limitData: {
        limit: {
          sto: {
            totalDevelopers: 100,
            totalScans: 1000
          }
        }
      },
      usageData: {
        usage: {
          sto: {
            activeDevelopers: {
              count: 20,
              displayName: 'Last 30 Days'
            },
            activeScans: {
              count: 100,
              displayName: 'Last 30 Days'
            }
          }
        }
      }
    }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <STOUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('STOUsageInfo UsageError', () => {
    const data: UsageAndLimitReturn = { limitData: {}, usageData: { usageErrorMsg: 'usage error' } }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <STOUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('STOUsageInfo LimitError', () => {
    const data: UsageAndLimitReturn = { limitData: { limitErrorMsg: 'limit error' }, usageData: {} }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <STOUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('STOUsageInfo loading', () => {
    const data: UsageAndLimitReturn = { limitData: { loadingLimit: true }, usageData: { loadingUsage: true } }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <STOUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
