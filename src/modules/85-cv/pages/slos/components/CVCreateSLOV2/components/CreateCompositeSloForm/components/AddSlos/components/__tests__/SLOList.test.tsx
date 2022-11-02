/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { mockSLODashboardWidgetsData } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import { SLOList } from '../SLOList'

const serviceLevelObjectivesDetails = [
  {
    accountId: 'default',
    serviceLevelObjectiveRef: 'hHJYxnUFTCypZdmYr0Q0tQ',
    weightagePercentage: 50
  },
  {
    accountId: 'default',
    serviceLevelObjectiveRef: '7b-_GIZxRu6VjFqAqqdVDQ',
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
    act(() => {
      fireEvent.click(container.querySelector('[type="checkbox"]')!)
    })
    expect(container).toMatchSnapshot()
  })
})
