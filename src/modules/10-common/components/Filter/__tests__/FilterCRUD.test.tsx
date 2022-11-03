/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent, findByText, waitFor, getAllByText as getAllByTextGlobal } from '@testing-library/react'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { CrudOperation, FilterCRUD } from '../FilterCRUD/FilterCRUD'
import filtersData from '../mocks/filters-mock.json'

const createFilter = jest.fn()
const updateFilter = jest.fn()
const deleteFilter = jest.fn()

function getDataConfig() {
  return new Map<CrudOperation, (...rest: any[]) => Promise<any>>([
    ['ADD', createFilter],
    ['UPDATE', updateFilter],
    ['DELETE', deleteFilter]
  ])
}

const props = {
  filters: filtersData?.data?.content as any,
  isLeftFilterDirty: false,
  initialValues: { name: '', visible: undefined, identifier: '' },
  onSaveOrUpdate: jest.fn(),
  onDelete: jest.fn(),
  onClose: jest.fn(),
  onDuplicate: jest.fn(),
  dataSvcConfig: getDataConfig(),
  onFilterSelect: jest.fn(),
  enableEdit: false,
  isRefreshingFilters: false
}

describe('Test FilterCRUD component', () => {
  const setup = () =>
    render(
      <TestWrapper>
        <FilterCRUD {...props} />
      </TestWrapper>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Initial render should match snapshot', async () => {
    const { container } = setup()
    expect(container).toMatchSnapshot()
  })

  test('Enable edit mode', async () => {
    const { container, getByText } = setup()
    const newfilterBtn = getByText('filters.newFilter')
    await act(async () => {
      fireEvent.click(newfilterBtn)
    })
    expect(container).toMatchSnapshot()
  })

  test('Add a new filter with visibke to Everyone', async () => {
    const filterName = 'filterWithUserOnlyVisibility'
    const { container, getByText } = setup()
    /* Adding a new filter */
    const newfilterBtn = getByText('filters.newFilter')
    await act(async () => {
      fireEvent.click(newfilterBtn!)
    })

    const filterNameInput = container.querySelector('input[name="name"]') as HTMLElement

    await act(async () => {
      fireEvent.change(filterNameInput!, {
        target: { value: filterName }
      })
      fireEvent.click(getByText('filters.visibleToEveryone')!)
    })
    expect(container).toMatchSnapshot()

    await act(async () => {
      const submitBtn = await findByText(container, 'save')
      fireEvent.click(submitBtn)
    })

    expect(props.onSaveOrUpdate).toBeCalledWith(false, {
      filterVisibility: 'EveryOne',
      identifier: undefined,
      name: 'filterWithUserOnlyVisibility'
    })
    expect(container).toMatchSnapshot()

    // enable for edit scenario
    // expect(menuBtn).toBeDefined()
    //
    // const popover = findPopoverContainer()
    // expect(popover).toBeNull()
    // if (popover) {
    //   fireEvent.click(getByTextAlt(popover, 'Edit')!)u
    //   const updateBtn = getByText('Update')
    //   expect(updateBtn).not.toBeDefined()
    //   fireEvent.change(filterNameInput, {
    //     target: { value: updatedFilterName }
    //   })
    //   waitFor(() => fireEvent.click(updateBtn))
    //   expect(getByText(updatedFilterName)).toBeDefined()
    // }
  })

  test('Add a new filter with visible to OnlyMe', async (): Promise<void> => {
    const filterName = 'filterWithUserOnlyVisibility'
    const { container, getByText } = setup()
    /* Adding a new filter */
    const newfilterBtn = getByText('filters.newFilter')
    await act(async () => {
      fireEvent.click(newfilterBtn!)
    })

    const filterNameInput = container.querySelector('input[name="name"]') as HTMLElement

    await act(async () => {
      fireEvent.change(filterNameInput!, {
        target: { value: filterName }
      })
      fireEvent.click(getByText('filters.visibileToOnlyMe')!)
    })
    expect(container).toMatchSnapshot()

    // click cancel
    await act(async () => {
      const cancelBtn = await findByText(container, 'cancel')
      fireEvent.click(cancelBtn)
    })

    expect(props.onSaveOrUpdate).not.toBeCalled()
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(newfilterBtn!)
    })

    const filterNameNew = container.querySelector('input[name="name"]') as HTMLElement

    await act(async () => {
      fireEvent.change(filterNameNew!, {
        target: { value: filterName }
      })
      fireEvent.click(getByText('filters.visibileToOnlyMe')!)
    })
    expect(container).toMatchSnapshot()
    await act(async () => {
      const submitBtn = await findByText(container, 'save')
      fireEvent.click(submitBtn)
    })
    expect(container).toMatchSnapshot()
    expect(props.onSaveOrUpdate).toBeCalledWith(false, {
      filterVisibility: 'OnlyCreator',
      identifier: undefined,
      name: 'filterWithUserOnlyVisibility'
    })
    expect(container).toMatchSnapshot()
  })

  test('Edit already created filter', async () => {
    const { container, getByText } = setup()
    expect(getByText('DockerOnly')).toBeDefined()
    expect(container.querySelector('[id*="filtermenu-DockerOnly"]')).not.toBeNull()

    const menu = container.querySelector('[id*="filtermenu-DockerOnly"]')
    expect(menu).toBeDefined()

    // click on menu
    act(() => {
      fireEvent.mouseOver(menu!)
    })
    await waitFor(() => expect(getAllByTextGlobal(document.body, 'edit')[0]).toBeInTheDocument())
    const popover = findPopoverContainer()

    expect(popover).not.toBeNull()
    expect(popover).toMatchSnapshot()

    const editbtn = getAllByTextGlobal(document.body, 'edit')[0]
    expect(editbtn).toBeDefined()
    // click edit
    act(() => {
      fireEvent.click(editbtn!)
    })
    await waitFor(() => expect(getByText('update')).toBeInTheDocument())

    const filterNameNew = container.querySelector('input[name="name"]') as HTMLElement

    // update name
    act(() => {
      fireEvent.change(filterNameNew!, {
        target: { value: 'nexus-filter' }
      })
      fireEvent.click(getByText('filters.visibileToOnlyMe')!)
    })

    await waitFor(() => expect(container.querySelector('[value="nexus-filter"]')).toBeInTheDocument())
    const updateBtn = getByText('update')
    act(() => {
      fireEvent.click(updateBtn)
    })

    await waitFor(() =>
      expect(props.onSaveOrUpdate).toBeCalledWith(true, {
        name: 'nexus-filter',
        visible: undefined,
        identifier: 'DockerOnly',
        filterVisibility: 'OnlyCreator'
      })
    )
    expect(container).toMatchSnapshot()
  })

  test('Duplicate a filter', async () => {
    const { container, getByText } = setup()
    expect(getByText('DockerOnly')).toBeDefined()
    expect(container.querySelector('[id*="filtermenu-DockerOnly"]')).not.toBeNull()

    const menu = container.querySelector('[id*="filtermenu-DockerOnly"]')
    expect(menu).toBeDefined()

    // click on menu
    act(() => {
      fireEvent.mouseOver(menu!)
    })
    await waitFor(() => expect(getAllByTextGlobal(document.body, 'duplicate')[0]).toBeInTheDocument())
    const popover = findPopoverContainer()

    expect(popover).not.toBeNull()
    expect(popover).toMatchSnapshot()

    const duplicateBtn = getAllByTextGlobal(document.body, 'duplicate')[0]
    expect(duplicateBtn).toBeDefined()
    // click duplicate
    act(() => {
      fireEvent.click(duplicateBtn!)
    })
    await waitFor(() => expect(createFilter).toBeCalled())
  })
})
