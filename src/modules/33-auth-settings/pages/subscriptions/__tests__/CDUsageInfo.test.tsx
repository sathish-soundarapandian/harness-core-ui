/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import CDUsageInfo from '../overview/CDUsageInfo'

const mockDetailResponse = {}

jest.mock('services/cd-ng', () => ({
  useGetLicensesAndSummary: jest.fn(() => mockDetailResponse)
}))

jest.mock('@common/hooks/useGetUsageAndLimit', () => {
  return {
    useGetUsageAndLimit: () => {
      return useGetUsageAndLimitReturnMock
    }
  }
})
const useGetUsageAndLimitReturnMock = {
  limitData: {
    limit: {
      cd: {
        totalServiceInstances: 100,
        totalWorkload: 200
      }
    }
  },
  usageData: {
    usage: {
      cd: {
        activeServiceInstances: {
          count: 20,
          displayName: 'Last 30 Days'
        },
        activeServices: {
          count: 45,
          displayName: 'Last 30 Days'
        }
      }
    }
  }
}

describe('CDUsageInfo', () => {
  test('CDUsageInfo', () => {
    const { container } = render(
      <TestWrapper>
        <CDUsageInfo />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
