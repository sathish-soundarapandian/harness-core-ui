/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes } from '@blueprintjs/core'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceMappingList } from '../SetupSourceMappingList'

jest.mock('@cv/components/TableFilter/TableFilter', () => ({
  ...(jest.requireActual('@cv/components/TableFilter/TableFilter') as any),
  TableFilter: function Mock(props: any) {
    return <Container className="filter" onClick={() => props.onFilter('4')} />
  }
}))

describe('Unit tests for SetupSourceMappingList', () => {
  test('Ensure that when error is passed, the error is displayed', async () => {
    const onClickFn = jest.fn()
    const { container, getByText } = render(
      <SetupSourceMappingList
        tableProps={{ data: [], columns: [] }}
        mappingListHeaderProps={{
          mainHeading: 'main',
          subHeading: 'sub'
        }}
        error={{
          message: 'mockError',
          onClick: onClickFn
        }}
        tableFilterProps={{ isItemInFilter: jest.fn(), totalItemsToRender: 30 }}
      />
    )

    await waitFor(() => expect(getByText('mockError')))
    const retryButton = container.querySelector('button')
    if (!retryButton) {
      throw Error('Button was not rendered.')
    }

    fireEvent.click(retryButton)
    await waitFor(() => expect(onClickFn).toHaveBeenCalled())
  })

  test('Ensure that when loading is passed the loading state is rendered', async () => {
    const { container } = render(
      <SetupSourceMappingList<{ c: string; s: string; t: string; y: string }>
        tableProps={{
          data: [],
          columns: [
            { Header: 'asdad', accessor: 'c' },
            { accessor: 's', Header: 'asdsdfad' },
            { accessor: 't', Header: 'sdklfjksl' },
            { accessor: 'y', Header: 'sdlkfjsdlfj' }
          ]
        }}
        tableFilterProps={{ isItemInFilter: jest.fn(), totalItemsToRender: 30 }}
        mappingListHeaderProps={{
          mainHeading: 'main',
          subHeading: 'sub'
        }}
        loading={true}
      />
    )

    await waitFor(() => expect(container.querySelectorAll(`[class*="${Classes.SKELETON}"]`).length).toBe(24))
  })

  test('Ensure that when filter is applied the corresponding entries are displayed', async () => {
    const { container, getByText } = render(
      <SetupSourceMappingList<{ c: string; s: string; t: string; y: string }>
        tableProps={{
          data: [
            { c: 'sd', s: 'dsfs', t: 'sdfsdf', y: 'sdfsdfsdf' },
            { c: 's432d', s: 'ds234fs', t: 'sd23fsdf', y: 'sdf243sdfsdf' }
          ],
          columns: [
            { Header: 'asdad', accessor: 'c' },
            { accessor: 's', Header: 'asdsdfad' },
            { accessor: 't', Header: 'sdklfjksl' },
            { accessor: 'y', Header: 'sdlkfjsdlfj' }
          ]
        }}
        mappingListHeaderProps={{
          mainHeading: 'main',
          subHeading: 'sub'
        }}
        tableFilterProps={{
          isItemInFilter: (_, item) => {
            return item.c === 's432d'
          },
          totalItemsToRender: 30
        }}
        loading={false}
      />
    )

    await waitFor(() => expect(container.querySelectorAll(`[role="row"]`).length).toBe(3))
    const filter = container.querySelector('.filter')
    if (!filter) {
      throw Error('filter did not render.')
    }

    fireEvent.click(filter)
    await waitFor(() => expect(container.querySelectorAll(`[role="row"]`).length).toBe(2))
    expect(getByText('s432d')).not.toBeNull()
  })

  test('Ensure that when there are more than total number of items to render, the limit count is honored', async () => {
    const { container, getByText } = render(
      <SetupSourceMappingList<{ c: string; s: string; t: string; y: string }>
        tableProps={{
          data: [
            { c: '_app1', s: 'dsfs', t: 'sdfsdf', y: 'sdfsdfsdf' },
            { c: '_app2', s: 'ds234fs', t: 'sd23fsdf', y: 'sdf243sdfsdf' },
            { c: '_app3', s: 'dsfs', t: 'sdfsdf', y: 'sdfsdfsdf' },
            { c: '_app4', s: 'ds234fs', t: 'sd23fsdf', y: 'sdf243sdfsdf' },
            { c: '_app5', s: 'dsfs', t: 'sdfsdf', y: 'sdfsdfsdf' },
            { c: '_app6', s: 'ds234fs', t: 'sd23fsdf', y: 'sdf243sdfsdf' },
            { c: '_app7', s: 'dsfs', t: 'sdfsdf', y: 'sdfsdfsdf' },
            { c: '_app8', s: 'ds234fs', t: 'sd23fsdf', y: 'sdf243sdfsdf' },
            { c: '_app9', s: 'dsfs', t: 'sdfsdf', y: 'sdfsdfsdf' },
            { c: '_app10', s: 'ds234fs', t: 'sd23fsdf', y: 'sdf243sdfsdf' },
            { c: '_app11', s: 'dsfs', t: 'sdfsdf', y: 'sdfsdfsdf' },
            { c: 'app12', s: 'ds234fs', t: 'sd23fsdf', y: 'sdf243sdfsdf' },
            { c: 'app13', s: 'dsfs', t: 'sdfsdf', y: 'sdfsdfsdf' },
            { c: 'app14', s: 'ds234fs', t: 'sd23fsdf', y: 'sdf243sdfsdf' },
            { c: 'app15', s: 'dsfs', t: 'sdfsdf', y: 'sdfsdfsdf' },
            { c: 'app16', s: 'ds234fs', t: 'sd23fsdf', y: 'sdf243sdfsdf' }
          ],
          columns: [
            { Header: 'asdad', accessor: 'c' },
            { accessor: 's', Header: 'asdsdfad' },
            { accessor: 't', Header: 'sdklfjksl' },
            { accessor: 'y', Header: 'sdlkfjsdlfj' }
          ]
        }}
        mappingListHeaderProps={{
          mainHeading: 'main',
          subHeading: 'sub'
        }}
        tableFilterProps={{
          isItemInFilter: (_, item) => {
            return item.c.startsWith('_')
          },
          totalItemsToRender: 10
        }}
        loading={false}
      />
    )

    await waitFor(() => expect(container.querySelectorAll(`[role="row"]`).length).toBe(11))
    const filter = container.querySelector('.filter')
    if (!filter) {
      throw Error('filter did not render.')
    }

    fireEvent.click(filter)
    await waitFor(() => expect(container.querySelectorAll(`[role="row"]`).length).toBe(11))
    expect(getByText('_app1')).not.toBeNull()
    expect(getByText('_app10')).not.toBeNull()
  })

  test('Ensure that api is called for filtering when there is no data', async () => {
    const mockFn = jest.fn()
    const { container } = render(
      <TestWrapper>
        <SetupSourceMappingList<{ c: string; s: string; t: string; y: string }>
          tableProps={{
            data: [],
            columns: [
              { Header: 'asdad', accessor: 'c' },
              { accessor: 's', Header: 'asdsdfad' },
              { accessor: 't', Header: 'sdklfjksl' },
              { accessor: 'y', Header: 'sdlkfjsdlfj' }
            ]
          }}
          mappingListHeaderProps={{
            mainHeading: 'main',
            subHeading: 'sub'
          }}
          tableFilterProps={{
            isItemInFilter: (_, item) => {
              return item.c.startsWith('_')
            },
            totalItemsToRender: 10,
            onFilterForMoreThan100Items: mockFn
          }}
          loading={false}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll(`.filter`)).not.toBeNull())
    const searchField = container.querySelector('.filter')
    if (!searchField) {
      throw Error('Search field was not rendered.')
    }

    fireEvent.click(searchField)
    await waitFor(() => expect(mockFn).toHaveBeenCalled())
  })

  test('Ensure that when there are a 100 or more items api filter is called', async () => {
    const mockFn = jest.fn()
    const { container } = render(
      <SetupSourceMappingList<{ c: string; s: string; t: string; y: string }>
        tableProps={{
          data: Array(100)
            .fill({})
            .map((_, index) => ({
              c: index.toString(),
              s: index.toString(),
              t: index.toString(),
              y: index.toString()
            })),
          columns: [
            { Header: 'asdad', accessor: 'c' },
            { accessor: 's', Header: 'asdsdfad' },
            { accessor: 't', Header: 'sdklfjksl' },
            { accessor: 'y', Header: 'sdlkfjsdlfj' }
          ]
        }}
        mappingListHeaderProps={{
          mainHeading: 'main',
          subHeading: 'sub'
        }}
        tableFilterProps={{
          isItemInFilter: (_, item) => {
            return item.c.startsWith('_')
          },
          totalItemsToRender: 10,
          onFilterForMoreThan100Items: mockFn
        }}
        loading={false}
      />
    )

    await waitFor(() => expect(container.querySelectorAll(`[role="row"]`).length).toBe(11))
    const searchField = container.querySelector('.filter')
    if (!searchField) {
      throw Error('Search field was not rendered.')
    }

    fireEvent.click(searchField)
    await waitFor(() => expect(mockFn).toHaveBeenCalled())
  })
})
