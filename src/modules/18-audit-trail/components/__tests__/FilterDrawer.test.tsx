/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, getByText, fireEvent } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import type { FilterDTO } from 'services/audit'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { StringUtils } from '@common/exports'
import FilterDrawer from '../FilterDrawer/FilterDrawer'
import { filters as filterResponse } from './mockData'

jest.mock('services/audit', () => ({
  usePostAuditFilter: () => {
    return { data: filterResponse }
  },
  useUpdateAuditFilter: () => {
    return { data: filterResponse }
  },
  useDeleteAuditFilter: () => {
    return { data: filterResponse }
  }
}))

describe('<FilterDrawer />', () => {
  test('render filter drawer', () => {
    render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <FilterDrawer
          // eslint-disable-next-line
          //@ts-ignore
          filters={filterResponse?.data?.content || []}
          closeDrawer={() => {
            //no implementation
          }}
          selectFilter={() => {
            // no impl
          }}
          applyFilter={(_filter: FilterDTO) => {
            // no implementation
          }}
        />
      </TestWrapper>
    )
    const drawerArr = document.getElementsByClassName('bp3-drawer')
    expect(drawerArr).toHaveLength(1)
    const filterDrawer = drawerArr[0] as HTMLElement
    expect(getByText(filterDrawer, 'Filter')).toBeDefined()
    expect(filterDrawer).toMatchSnapshot()
  })

  test('apply filter', async done => {
    const applyFilter = jest.fn()
    render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <FilterDrawer
          // eslint-disable-next-line
          //@ts-ignore
          filters={filterResponse?.data?.content || []}
          closeDrawer={() => {
            //no implementation
          }}
          selectFilter={() => {
            // no impl
          }}
          applyFilter={applyFilter}
        />
      </TestWrapper>
    )
    const applyBtn = getByText(document.body, 'filters.apply')
    fireEvent.click(applyBtn)
    setTimeout(() => {
      expect(applyFilter).toBeCalled()
      done()
    })
  })
  test('apply filter', async done => {
    const selectFilter = jest.fn()
    render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <FilterDrawer
          // eslint-disable-next-line
          //@ts-ignore
          filters={filterResponse?.data?.content || []}
          closeDrawer={() => {
            //no implementation
          }}
          selectFilter={selectFilter}
        />
      </TestWrapper>
    )
    const clearAllBtn = getByText(document.body, 'filters.clearAll')
    fireEvent.click(clearAllBtn)
    setTimeout(() => {
      expect(selectFilter).toBeCalledWith({
        name: UNSAVED_FILTER,
        identifier: StringUtils.getIdentifierFromName(UNSAVED_FILTER),
        filterProperties: {}
      })
      done()
    })
  })

  test('select filter', async done => {
    const selectFilter = jest.fn()
    render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <FilterDrawer
          // eslint-disable-next-line
          //@ts-ignore
          filters={filterResponse?.data?.content || []}
          closeDrawer={() => {
            //no implementation
          }}
          selectFilter={selectFilter}
        />
      </TestWrapper>
    )
    const filters = document.getElementsByClassName('filters')
    const firstItem = filters[0].firstChild
    firstItem && fireEvent.click(firstItem)
    setTimeout(() => {
      expect(selectFilter).toBeCalledWith({
        filterProperties: {
          actions: ['CREATE'],
          endTime: null,
          environments: null,
          filterType: 'Audit',
          modules: null,
          principals: null,
          resources: null,
          scopes: null,
          startTime: null,
          tags: {}
        },
        filterVisibility: 'EveryOne',
        identifier: 'create_action',
        name: 'create_action',
        orgIdentifier: null,
        projectIdentifier: null
      })
      done()
    })
  })
})
