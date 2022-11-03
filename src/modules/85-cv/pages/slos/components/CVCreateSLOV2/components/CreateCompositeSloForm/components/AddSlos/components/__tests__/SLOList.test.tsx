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
    expect(getByText('SLO-3')).toBeInTheDocument()
    expect(getByText('SLO-4')).toBeInTheDocument()
    expect(container.querySelectorAll('[type="checkbox"]')[0]).toBeChecked()
    expect(container.querySelectorAll('[type="checkbox"]')[1]).toBeChecked()
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
    expect(getByText('SLO-3')).toBeInTheDocument()
    expect(getByText('SLO-4')).toBeInTheDocument()
    expect(container.querySelectorAll('[type="checkbox"]')[0]).toBeChecked()
    expect(container.querySelectorAll('[type="checkbox"]')[1]).toBeChecked()
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
      fireEvent.click(container.querySelectorAll('[type="checkbox"]')[1]!)
    })
    expect(queryByAttribute('data-testid', container, 'addSloButton')).toBeDisabled()
    act(() => {
      fireEvent.click(container.querySelectorAll('[type="checkbox"]')[1]!)
    })
    act(() => {
      fireEvent.click(addSloButton!)
    })
    expect(container).toMatchSnapshot()
  })
})

describe('SLOList error and loading', () => {
  test('should render loading state', () => {
    jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
      data: {},
      loading: true,
      error: null,
      refetch: jest.fn()
    } as any)
    const { container } = render(
      <TestWrapper>
        <SLOList filter="Rolling" onAddSLO={jest.fn()} hideDrawer={jest.fn()} serviceLevelObjectivesDetails={[]} />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })
  test('should render error state', () => {
    jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
      data: null,
      loading: false,
      error: true,
      refetch: jest.fn()
    } as any)
    const { getByText } = render(
      <TestWrapper>
        <SLOList filter="Rolling" onAddSLO={jest.fn()} hideDrawer={jest.fn()} serviceLevelObjectivesDetails={[]} />
      </TestWrapper>
    )
    expect(getByText('Retry')).toBeInTheDocument()
    act(() => {
      fireEvent.click(getByText('Retry'))
    })
  })

  test('should render with multiple pages', () => {
    const multiPageData = { ...mockSLODashboardWidgetsData }
    const content = []
    for (let index = 0; index < 20; index++) {
      const slodta = {
        sloIdentifier: `SLO${index}`,
        name: `SLO${index}`
      }
      content.push(slodta)
    }
    multiPageData.data.totalPages = 2
    multiPageData.data.totalItems = 20
    multiPageData.data.content = content as any

    jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
      data: multiPageData,
      loading: false,
      error: false,
      refetch: jest.fn()
    } as any)

    const { container } = render(
      <TestWrapper>
        <SLOList filter="Rolling" onAddSLO={jest.fn()} hideDrawer={jest.fn()} serviceLevelObjectivesDetails={[]} />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.Pagination--roundedButton')[1]).toBeInTheDocument()
    act(() => {
      fireEvent.click(container.querySelectorAll('.Pagination--roundedButton')[1]!)
    })
    act(() => {
      fireEvent.click(container.querySelectorAll('.Pagination--roundedButton')[0]!)
    })
  })
})
