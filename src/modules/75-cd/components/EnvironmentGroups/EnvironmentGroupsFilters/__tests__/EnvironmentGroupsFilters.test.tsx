/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as cdNgServices from 'services/cd-ng'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'

import { FilterContextProvider } from '@cd/context/FiltersContext'

import { EnvironmentGroupsFilters } from '../EnvironmentGroupsFilters'

import environmentGroupsData from '../../__tests__/__mocks__/environmentGroups.json'
import filtersData from '../../__tests__/__mocks__/filtersMockData.json'
import environmentsListData from '../../__tests__/__mocks__/environmentsListForProject.json'

function getResolutionHelper(data: any, loading: boolean) {
  return { data, loading } as any
}

function postResolutionHelper(data: any, loading: boolean) {
  let mutateFn = jest.fn()
  if (data) {
    mutateFn = jest.fn().mockResolvedValue(data)
  }
  return {
    loading,
    mutate: mutateFn,
    cancel: jest.fn(),
    error: null
  } as any
}

describe('Environment Groups Filters', () => {
  beforeEach(() => {
    jest
      .spyOn(cdNgServices, 'useGetEnvironmentGroupList')
      .mockImplementation(() => postResolutionHelper(environmentGroupsData, false))
    jest.spyOn(cdNgServices, 'useGetFilterList').mockImplementation(() => postResolutionHelper(filtersData, false))
    jest
      .spyOn(cdNgServices, 'useGetEnvironmentListForProject')
      .mockImplementation(() => getResolutionHelper(environmentsListData, false))
    jest.spyOn(cdNgServices, 'useUpdateFilter').mockImplementation(() => postResolutionHelper(null, false))
    jest.spyOn(cdNgServices, 'useDeleteFilter').mockImplementation(() => postResolutionHelper(null, false))
    jest.spyOn(cdNgServices, 'useGetYamlSchema').mockImplementation(() => getResolutionHelper(null, false))

    jest.mock('@common/exports', () => ({
      useToaster: () => ({
        showSuccess: jest.fn(),
        showError: jest.fn(),
        clear: jest.fn()
      })
    }))
  })

  test('no saved filters and create first filter', async () => {
    const mutateFn = jest.fn().mockResolvedValue({
      status: 'SUCCESS'
    })
    jest.spyOn(cdNgServices, 'usePostFilter').mockImplementation(() => ({
      loading: false,
      mutate: mutateFn,
      cancel: jest.fn(),
      error: null
    }))
    const refetchFilters = jest.fn()
    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentGroups({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <FilterContextProvider
          savedFilters={[]}
          isFetchingFilters={false}
          refetchFilters={refetchFilters}
          queryParams={{ filters: undefined, page: 1, searchTerm: undefined, size: 10 }}
        >
          <EnvironmentGroupsFilters />
        </FilterContextProvider>
      </TestWrapper>
    )

    expect(screen.queryByText('common.filters.noFilterSaved')).toBeInTheDocument()
    expect(container.querySelector('.bp3-popover-wrapper')).toHaveClass(
      'bp3-popover-wrapper DropDown--main DropDown--disabled'
    )

    const filterButton = screen.getByRole('button')
    userEvent.click(filterButton)

    const drawer = document.querySelector('.bp3-drawer')
    await waitFor(() => expect(drawer).toBeInTheDocument())

    const envGroupNameField = drawer?.querySelector('[name="envGroupName"]')
    if (!envGroupNameField) {
      throw Error('cannot find env group name field')
    }
    fireEvent.change(envGroupNameField, { target: { value: 'Env Group 1' } })

    const clearAllButton = drawer?.querySelector('button*[type="reset"]')
    expect(clearAllButton).toBeInTheDocument()

    fireEvent.click(clearAllButton!)

    userEvent.type(envGroupNameField, 'Env Group 1')
    const descriptionField = drawer?.querySelector('[name="description"]')
    userEvent.type(descriptionField!, 'Sample description')

    const envGroupTagField = drawer?.querySelector('[placeholder="Type and press enter to create a tag"]')
    userEvent.type(envGroupTagField!, 'Tag 1\nTag 2\n')

    const radioButtons = drawer?.querySelectorAll('.RadioButton--input')
    userEvent.click(radioButtons![0])

    const filterNameField = drawer?.querySelector('[name="name"]')
    if (!filterNameField) {
      throw Error('cannot find filter name field')
    }
    userEvent.type(filterNameField, 'Test')

    const buttons = drawer?.querySelectorAll('button')
    if (!buttons) {
      throw Error('cannot find buttons')
    }

    await waitFor(() =>
      expect(buttons[4]).toMatchInlineSnapshot(`
      <button
        class="bp3-button Button--button StyledProps--font StyledProps--main saveFilterBtn Button--with-current-color Button--without-shadow Button--variation Button--variation-secondary"
        type="submit"
      >
        <span
          class="bp3-button-text"
        >
          save
        </span>
      </button>
    `)
    )

    userEvent.click(buttons[4])
    await waitFor(() => expect(refetchFilters).toHaveBeenCalled())
  })

  test('saved filters present and filter selected', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentGroups({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <FilterContextProvider
          savedFilters={filtersData.data.content as cdNgServices.FilterDTO[]}
          isFetchingFilters={false}
          refetchFilters={jest.fn()}
          queryParams={{ filterIdentifier: 'F1', filters: undefined, page: 1, searchTerm: undefined, size: 10 }}
        >
          <EnvironmentGroupsFilters />
        </FilterContextProvider>
      </TestWrapper>
    )

    expect(screen.queryByText('F1')).toBeInTheDocument()
    expect(container.querySelector('.fieldCount')).toHaveTextContent('1')

    const filterDropdown = container.querySelector('[data-testid="filter-select"]')
    fireEvent.click(filterDropdown!)

    expect(screen.queryByText('FTag')!).toBeInTheDocument()
    const filter1 = document.body.getElementsByClassName('DropDown--menuItem')[0]
    fireEvent.click(filter1)
    expect(filter1).toHaveTextContent('F1')

    await waitFor(() => expect(screen.queryByText('FTag')!).not.toBeInTheDocument())

    fireEvent.click(filterDropdown!)
    expect(screen.queryByText('F2')!).toBeInTheDocument()
    const filterTag = document.body.getElementsByClassName('DropDown--menuItem')[3]

    fireEvent.click(filterTag)
    expect(filterTag).toHaveTextContent('FTag')

    await waitFor(() => expect(screen.queryByText('F2')!).not.toBeInTheDocument())
  })
})
