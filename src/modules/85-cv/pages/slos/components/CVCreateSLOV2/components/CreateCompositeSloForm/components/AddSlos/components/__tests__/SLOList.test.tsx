/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type * as cvServices from 'services/cv'
import { mockSLODashboardWidgetsData } from './SLOList.mock'
import { SLOList } from '../SLOList'

const serviceLevelObjectivesDetails = [
  {
    accountId: 'default',
    serviceLevelObjectiveRef: 'SLO3',
    weightagePercentage: 50
  },
  {
    accountId: 'default',
    serviceLevelObjectiveRef: 'SLO4',
    weightagePercentage: 50
  }
]

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: mockSLODashboardWidgetsData, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('SLOList', () => {
  test('should render SLOList with Rolling filter', () => {
    const filterRolling = {
      type: 'Simple',
      sloTargetFilterDTO: { spec: { periodLength: '3d' }, type: 'Rolling' }
    } as cvServices.SLODashboardApiFilter
    const { container, getByText } = render(
      <TestWrapper>
        <SLOList
          filter={filterRolling}
          onAddSLO={jest.fn()}
          hideDrawer={jest.fn()}
          serviceLevelObjectivesDetails={serviceLevelObjectivesDetails}
        />
      </TestWrapper>
    )
    expect(getByText('SLO-3')).toBeInTheDocument()
    expect(getByText('SLO-4')).toBeInTheDocument()
    expect(container.querySelectorAll('[type="checkbox"]')[0]).toBeChecked()
    expect(container.querySelectorAll('[type="checkbox"]')[1]).toBeChecked()
  })

  test('should render SLOList with Calender filter', () => {
    const calenderFilter = {
      type: 'Simple',
      sloTargetFilterDTO: {
        spec: {
          type: 'Weekly',
          spec: {
            dayOfWeek: 'Tue'
          }
        },
        type: 'Calender'
      }
    } as cvServices.SLODashboardApiFilter
    const { container, getByText } = render(
      <TestWrapper>
        <SLOList
          filter={calenderFilter}
          onAddSLO={jest.fn()}
          hideDrawer={jest.fn()}
          serviceLevelObjectivesDetails={serviceLevelObjectivesDetails}
        />
      </TestWrapper>
    )
    expect(getByText('SLO-3')).toBeInTheDocument()
    expect(getByText('SLO-4')).toBeInTheDocument()
    expect(container.querySelectorAll('[type="checkbox"]')[0]).toBeChecked()
    expect(container.querySelectorAll('[type="checkbox"]')[1]).toBeChecked()
  })
})
