/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { PageErrorProps } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as useUsage from '@common/hooks/useGetUsageAndLimit'
import type { UsageAndLimitReturn } from '@common/hooks/useGetUsageAndLimit'
import ChaosUsageInfo from '../overview/ChaosUsageInfo'

// eslint-disable-next-line react/display-name
jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  PageError: (props: PageErrorProps) => {
    props.onClick?.({} as any)
    return <div data-testid="pageError" />
  }
}))

describe('CHAOSUsageInfo', () => {
  test('ChaosUsageInfo', () => {
    const data: UsageAndLimitReturn = {
      limitData: {
        limit: {
          chaos: {
            totalChaosExperimentRuns: 100
          }
        }
      },
      usageData: {
        usage: {
          chaos: {
            experimentRunsPerMonth: {
              count: 31,
              displayName: 'Last 30 Days'
            }
          }
        }
      }
    }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <ChaosUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('ChaosUsageInfo Empty Data', () => {
    const data: UsageAndLimitReturn = {
      limitData: {
        limit: {}
      },
      usageData: {
        usage: {}
      }
    }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <ChaosUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('ChaosUsageInfo Empty Data 2', () => {
    const data: UsageAndLimitReturn = {
      limitData: {
        limit: {}
      },
      usageData: {
        usage: {
          chaos: {}
        }
      }
    }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <ChaosUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('ChaosUsageInfo Empty Data3', () => {
    const data: UsageAndLimitReturn = {
      limitData: {
        limit: {}
      },
      usageData: {
        usage: {
          chaos: {
            experimentRunsPerMonth: {}
          }
        }
      }
    }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <ChaosUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('ChaosUsageInfo UsageError', () => {
    const data: UsageAndLimitReturn = { limitData: {}, usageData: { usageErrorMsg: 'usage error' } }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <ChaosUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('ChaosUsageInfo LimitError', () => {
    const data: UsageAndLimitReturn = { limitData: { limitErrorMsg: 'limit error' }, usageData: {} }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <ChaosUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('ChaosUsageInfo loading', () => {
    const data: UsageAndLimitReturn = { limitData: { loadingLimit: true }, usageData: { loadingUsage: true } }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <ChaosUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
