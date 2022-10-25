/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor, queryByText, fireEvent, queryByAttribute } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import routes from '@common/RouteDefinitions'
import * as cdngServices from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import * as usePermission from '@rbac/hooks/usePermission'
import type { ResponseListString } from 'services/cd-ng'
import ConnectorsPage from '../ConnectorsPage'

import { connectorsData, catalogueData, statisticsMockData, filters } from './mockData'

const fetchConnectors = () => Promise.resolve(connectorsData)
const fetchBranches = jest.fn(() => Promise.resolve([] as ResponseListString))
const fetchConnectorStats = jest.fn()
jest
  .spyOn(cdngServices, 'useGetConnectorStatistics')
  .mockImplementation(() => ({ refetch: fetchConnectorStats } as any))
jest.spyOn(cdngServices, 'useGetConnectorCatalogue').mockImplementation(() => ({ mutate: () => catalogueData } as any))
jest.spyOn(cdngServices, 'useGetConnectorListV2').mockImplementation(() => ({ mutate: fetchConnectors } as any))
jest.spyOn(cdngServices, 'useGetFilterList').mockImplementation(() => ({ data: filters, loading: false } as any))
jest.spyOn(cdngServices, 'usePostFilter').mockImplementation(() => ({ mutate: jest.fn() } as any))
jest.spyOn(cdngServices, 'useUpdateFilter').mockImplementation(() => ({ mutate: jest.fn() } as any))
jest.spyOn(cdngServices, 'useDeleteFilter').mockImplementation(() => ({ mutate: jest.fn() } as any))
jest.spyOn(cdngServices, 'useGetTestConnectionResult').mockImplementation(() => Promise.resolve() as any)
jest.spyOn(cdngServices, 'useDeleteConnector').mockImplementation(() => Promise.resolve() as any)
jest.spyOn(cdngServices, 'getListOfBranchesByGitConfigPromise').mockImplementation(() => fetchBranches())
jest.useFakeTimers()

describe('Connectors Page Test', () => {
  const props = {
    mockData: {
      data: connectorsData as any,
      loading: false
    },
    catalogueMockData: {
      data: catalogueData as any,
      loading: false
    },
    statisticsMockData: {
      data: statisticsMockData as any,
      loading: false
    }
  }
  const renderProps = {
    ...Object.assign(props, {
      filtersMockData: {
        data: filters as any,
        loading: false
      }
    })
  }
  const setup = () =>
    render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectorsPage {...props} />
      </TestWrapper>
    )

  test('In CV module on clicking createViaYamlButton url should remain in cv', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toConnectors({
          accountId: ':accountId',
          orgIdentifier: ':orgIdentifier',
          projectIdentifier: ':projectIdentifier',
          module: 'cv'
        })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <ConnectorsPage {...props} />
      </TestWrapper>
    )

    await waitFor(() => screen.getByText('createViaYaml'))
    const createViaYamlButton = screen.getByText('createViaYaml')
    fireEvent.click(createViaYamlButton)
    expect(container.querySelector('[data-testid="location"]')?.textContent).toMatch(
      routes.toCreateConnectorFromYaml({
        accountId: 'dummy',
        orgIdentifier: 'default',
        projectIdentifier: 'dummyProject'
      })
    )

    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Initial render should match snapshot', async () => {
    const { container, getByText } = setup()
    const newConnectorBtn = getByText('newConnector')
    fireEvent.click(newConnectorBtn)
    await waitFor(() => queryByText(container, 'connectorsLabel'))
    expect(container).toMatchSnapshot()
  })

  test('Render and check connector rows', async () => {
    const { findByText: findByConnectorText } = setup()
    connectorsData?.data?.content?.forEach(connector => {
      expect(findByConnectorText(connector?.connector?.name)).toBeTruthy()
    })
  })

  /* Connector filters test */
  test('Select and apply a filter', async () => {
    const { container, getByTestId } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectorsPage {...renderProps} />
      </TestWrapper>
    )

    await waitFor(() => getByTestId('filter-select'))
    const filterSelector = getByTestId('filter-select')
    expect(filterSelector).toBeTruthy()
    fireEvent.click(filterSelector)
    await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))
    const menuItems = document.querySelectorAll('[class*="menuItem"]')
    expect(menuItems?.length).toBe(filters.data.content.length)
    fireEvent.click(menuItems[0])
    expect(getByTestId('dropdown-value')).toHaveTextContent(filters.data.content[0].name)
    expect(parseInt((container.querySelector('[class*="fieldCount"]') as HTMLElement).innerHTML)).toBe(1)

    // expect(container).toMatchSnapshot()
  })

  test('Render and check filter panel', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectorsPage {...renderProps} />
      </TestWrapper>
    )
    await waitFor(() => container.querySelector('#ngfilterbtn')!)
    const filterBtn = container.querySelector('#ngfilterbtn')!
    fireEvent.click(filterBtn)
    const portal = document.getElementsByClassName('bp3-portal')[0]
    expect(portal).toBeTruthy()
    expect(portal).toMatchSnapshot('New Filter')
  })

  test('Render and check create connector panel', async () => {
    const { container } = setup()

    await waitFor(() => container?.querySelector('#newConnectorBtn'))
    const newConnectorBtn = container?.querySelector('#newConnectorBtn')
    fireEvent.click(newConnectorBtn!)
    const portal = document.getElementsByClassName('bp3-portal')[0]
    expect(portal).toBeTruthy()
    expect(portal).toMatchSnapshot('Connectors')
  })

  //Disabling as this has been reported as flaky multiple times
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should verify that new connector button and create via yaml button are not disabled if connector edit permission is provided', async () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [true])
    const { container } = setup()
    await waitFor(() => container.querySelector('[data-test="newConnectorButton"]'))
    const newConnectorButton = container.querySelector('[data-test="newConnectorButton"]')
    const createViaYamlButton = container.querySelector('[data-test="createViaYamlButton"]')
    expect(newConnectorButton?.getAttribute('disabled')).toBe(null)
    expect(createViaYamlButton?.getAttribute('disabled')).toBe(null)
  })

  test('should verify that new connector button and create via yaml button are disabled if connector edit permission is not provided', async () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [false])
    const { container } = setup()

    await waitFor(() => container.querySelector('[data-test="createViaYamlButton"]'))
    const createViaYamlButton = container.querySelector('[data-test="createViaYamlButton"]')
    const newConnectorButton = container.querySelector('[data-test="newConnectorButton"]')
    expect(newConnectorButton?.getAttribute('disabled')).toBe('')
    expect(createViaYamlButton?.getAttribute('disabled')).toBe('')
  })

  test('should confirm that searching the expandable search input calls the api', async () => {
    const getConnectorsListV2 = jest.fn().mockResolvedValue(props.mockData.data)

    jest.spyOn(cdngServices, 'useGetConnectorListV2').mockImplementation(() => ({ mutate: getConnectorsListV2 } as any))
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/home/orgs/:orgIdentifier/projects/:projectIdentifier/setup/connectors"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'orgId', projectIdentifier: 'projectId' }}
      >
        <ConnectorsPage {...renderProps} />
      </TestWrapper>
    )

    await waitFor(() => container.querySelector('[data-name="connectorSeachContainer"]'))
    const query = 'abcd'
    const searchContainer = container.querySelector('[data-name="connectorSeachContainer"]')
    const searchIcon = searchContainer?.querySelector('span[data-icon="thinner-search"]')
    const searchInput = searchContainer?.querySelector('input[placeholder="search"]') as HTMLInputElement

    expect(searchIcon).toBeTruthy()
    expect(searchInput).toBeTruthy()
    expect(searchInput?.value).toBe('')
    const expectedResponse = {
      filterType: 'Connector',
      queryParams: {
        accountIdentifier: 'dummy',
        orgIdentifier: 'orgId',
        pageIndex: 0,
        pageSize: 10,
        projectIdentifier: 'projectId',
        searchTerm: ''
      }
    }
    expect(getConnectorsListV2).toBeCalledWith(
      { filterType: expectedResponse.filterType },
      { queryParams: expectedResponse.queryParams }
    )
    await act(async () => {
      fireEvent.click(searchIcon!)
    })
    await act(async () => {
      fireEvent.change(searchInput!, { target: { value: query } })
    })
    await waitFor(() => expect(searchInput?.value).toBe(query))
    await waitFor(() => expect(getConnectorsListV2).toBeCalledTimes(1))
  })
})
