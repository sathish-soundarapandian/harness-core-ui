/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Step3 from '../Step3'

const mockedSummaryResponse = {
  response: {
    compute_spend: 62.0327013728,
    ondemand_spend: 12,
    savings_plans_spend: 41.0903013728,
    reservations_spend: 8.9424,
    coverage_percentage: {
      savings_plan: 14.046901601963949,
      reserved_instances: 16.814363398229816,
      ondemand: 69.13873499980623
    },
    utilization_percentage: {
      savings_plan: 100,
      reserved_instances: 83.33333333333333
    },
    savings: {
      total: 5.273210527199999,
      percentage: 0.08500694650567302
    }
  }
}

jest.mock('services/lw-co', () => ({
  useFetchCOSummary: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedSummaryResponse))
  }))
}))

describe('Setup step 3', () => {
  test('should render with data', () => {
    const { container } = render(
      <TestWrapper>
        <Step3 />
      </TestWrapper>
    )

    expect(container.querySelector('input[type="range"]')).toBeInTheDocument()
  })
})
