/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getByTestId, render, RenderResult, screen } from '@testing-library/react'
import type { StringKeys } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import { TableFilters, TableFiltersProps } from '../TableFilters'

const filters = [
  {
    queryProps: {},
    label: 'cf.pathTo.testFilter1' as StringKeys,
    total: 12
  },
  {
    queryProps: { key: 'enabled', value: 'true' },
    label: 'cf.pathTo.testFilter2' as StringKeys,
    total: 4
  },
  {
    queryProps: { key: 'status', value: 'active' },
    label: 'cf.pathTo.testFilter3' as StringKeys,
    total: 8
  }
]

const renderComponent = (props: Partial<TableFiltersProps>): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <TableFilters filters={filters} currentFilter={{}} updateTableFilter={jest.fn()} {...props} />
    </TestWrapper>
  )

describe('TableFilters', () => {
  beforeAll(() => {
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: undefined, refetch: jest.fn() })
    })

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('TableFilters should render correctly the filters for feature flags', async () => {
    renderComponent({})

    // Three cards should be rendered
    const filterCards = screen.getAllByTestId('filter-card')
    expect(filterCards).toHaveLength(3)

    // Filter One, selected by default
    expect(filterCards[0]).toBeVisible()
    expect(getByTestId(filterCards[0], 'filter-label')).toHaveTextContent(filters[0].label)
    expect(getByTestId(filterCards[0], 'filter-total')).toHaveTextContent(`${filters[0].total}`)
    expect(filterCards[0]).toHaveClass('Card--selected')

    // Filter Two, not selected
    expect(filterCards[1]).toBeVisible()
    expect(getByTestId(filterCards[1], 'filter-label')).toHaveTextContent(filters[1].label)
    expect(getByTestId(filterCards[1], 'filter-total')).toHaveTextContent(`${filters[1].total}`)
    expect(filterCards[1]).not.toHaveClass('Card--selected')

    // Filter Three, not selected
    expect(filterCards[2]).toBeVisible()
    expect(getByTestId(filterCards[2], 'filter-label')).toHaveTextContent(filters[2].label)
    expect(getByTestId(filterCards[2], 'filter-total')).toHaveTextContent(`${filters[2].total}`)
    expect(filterCards[2]).not.toHaveClass('Card--selected')
  })

  test('The selected card should match the current filter', async () => {
    renderComponent({ currentFilter: filters[1] })

    // Three cards should be rendered
    const filterCards = screen.getAllByTestId('filter-card')
    expect(filterCards).toHaveLength(3)

    // default NOT selected
    expect(filterCards[0]).not.toHaveClass('Card--selected')

    // Filter Two selected
    expect(filterCards[1]).toHaveClass('Card--selected')

    // Filter Three not selected
    expect(filterCards[2]).not.toHaveClass('Card--selected')
  })

  test('It renders no cards if filters array empty', async () => {
    renderComponent({ filters: [], currentFilter: {} })

    expect(screen.queryByTestId('filter-card')).not.toBeInTheDocument()
  })
})
