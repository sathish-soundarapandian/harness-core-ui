/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import * as auditServices from 'services/audit'
import AuditTrailsFilters from '../AuditTrailsFilters'
import { filters } from './mockData'

jest.spyOn(auditServices, 'useGetAuditFilterList').mockImplementation(() => ({ data: filters, loading: false } as any))

describe('Audit trail filters', () => {
  test('render', () => {
    const renderObj = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditTrailsFilters />
      </TestWrapper>
    )
    expect(renderObj.container).toMatchSnapshot()
  })

  test('filter button click', async () => {
    const { container } = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditTrailsFilters />
      </TestWrapper>
    )

    const filterButton = container.getElementsByClassName('ngFilter')[0]
    fireEvent.click(filterButton)
    await waitFor(() => expect(document.body.querySelector(`.bp3-drawer`)).not.toBeNull())
  })

  test('test filter select', () => {
    const applyFilter = jest.fn()
    const { container } = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditTrailsFilters applyFilters={applyFilter} />
      </TestWrapper>
    )

    const filterDropdown = container.querySelector('[data-testid="filter-select"]')
    if (filterDropdown) {
      fireEvent.click(filterDropdown)
    }

    const listItem = document.body.getElementsByClassName('DropDown--menuItem')[0]
    fireEvent.click(listItem)
    expect(listItem).toHaveTextContent('create_action')
    expect(applyFilter).toBeCalledWith({
      scopes: null,
      resources: null,
      modules: null,
      actions: ['CREATE'],
      environments: null,
      principals: null,
      startTime: null,
      endTime: null,
      tags: {},
      filterType: 'Audit'
    })
  })

  test('test filter select with empty identifier', () => {
    const applyFilter = jest.fn()
    const { container } = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditTrailsFilters applyFilters={applyFilter} />
      </TestWrapper>
    )

    const filterDropdown = container.querySelector('[data-testid="filter-select"]')
    if (filterDropdown) {
      fireEvent.click(filterDropdown)
    }

    const listItem = document.body.getElementsByClassName('DropDown--menuItem')[1]
    fireEvent.click(listItem)
    expect(listItem).toHaveTextContent('org_filter')
    expect(applyFilter).toBeCalledWith({})
  })

  test('apply filters', async done => {
    const applyFilter = jest.fn()

    const { container, getByText } = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditTrailsFilters applyFilters={applyFilter} />
      </TestWrapper>
    )

    const filterButton = container.getElementsByClassName('ngFilter')[0]
    fireEvent.click(filterButton)
    const applyBtn = getByText('filters.apply')
    fireEvent.click(applyBtn)
    setTimeout(() => {
      expect(applyFilter).toBeCalled()
      done()
    })
  })
})
