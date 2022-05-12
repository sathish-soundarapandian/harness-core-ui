/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cv from 'services/cv'
import { mockRiskValue } from '@cv/pages/monitored-service/components/ServiceHealth/__tests__/ServiceHealth.mock'
import ChangeEventServiceHealth from '../ChangeEventServiceHealth'

describe('Unit tests for ChangeEventServiceHealth', () => {
  beforeAll(() => {
    jest.spyOn(cv, 'useGetMonitoredServiceOverAllHealthScore').mockReturnValue({
      data: { data: { healthScores: mockRiskValue } },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)
  })
  test('Ensure that component renders correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <ChangeEventServiceHealth
          eventType="K8sCluster"
          monitoredServiceIdentifier="monitored_service_identifier"
          startTime={123123}
          timeStamps={[1632958200, 1633042800]}
          setTimestamps={jest.fn()}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="column"]')).not.toBeNull())
  })
})
