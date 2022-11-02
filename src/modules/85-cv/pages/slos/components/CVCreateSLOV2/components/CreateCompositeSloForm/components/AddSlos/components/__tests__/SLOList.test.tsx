/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, queryByAttribute, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
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

describe('SLOList', () => {
  beforeEach(() => {
    jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
      data: mockSLODashboardWidgetsData,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)
  })

  test('should render SLOList with Rolling filter', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <SLOList
          filter="Rolling"
          onAddSLO={jest.fn()}
          hideDrawer={jest.fn()}
          serviceLevelObjectivesDetails={serviceLevelObjectivesDetails}
        />
      </TestWrapper>
    )
    expect(getByText('SLO-4')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render SLOList with Calender filter', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <SLOList
          filter="Calender"
          onAddSLO={jest.fn()}
          hideDrawer={jest.fn()}
          serviceLevelObjectivesDetails={serviceLevelObjectivesDetails}
        />
      </TestWrapper>
    )
    expect(getByText('SLO-4')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render SLOList with No filter', () => {
    const { container } = render(
      <TestWrapper>
        <SLOList
          filter={undefined}
          onAddSLO={jest.fn()}
          hideDrawer={jest.fn()}
          serviceLevelObjectivesDetails={serviceLevelObjectivesDetails}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render SLOList empty serviceLevelObjectivesDetails', () => {
    const { container } = render(
      <TestWrapper>
        <SLOList filter={undefined} onAddSLO={jest.fn()} hideDrawer={jest.fn()} serviceLevelObjectivesDetails={[]} />
      </TestWrapper>
    )
    const addSloButton = queryByAttribute('data-testid', container, 'addSloButton')
    expect(addSloButton).toBeDisabled()
    act(() => {
      fireEvent.click(container.querySelectorAll('[type="checkbox"]')[0]!)
    })
    act(() => {
      fireEvent.click(container.querySelectorAll('[type="checkbox"]')[1]!)
    })
    expect(queryByAttribute('data-testid', container, 'addSloButton')).not.toBeDisabled()
    act(() => {
      fireEvent.click(addSloButton!)
    })
    expect(container).toMatchSnapshot()
  })
})
