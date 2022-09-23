/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText, act, fireEvent } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import {
  connectorsData,
  catalogueData,
  statisticsMockData,
  filters
} from '@connectors/pages/connectors/__tests__/mockData'
import { useGetTestConnectionResult } from 'services/cd-ng'
import * as usePermission from '@rbac/hooks/usePermission'
import ConnectorsListView from '../ConnectorsListView'

const fetchConnectors = () => Promise.resolve(connectorsData)

const testConnectorResultError = {
  status: 'SUCCESS',
  data: {
    status: 'FAILURE',
    errors: [
      {
        reason: ' No Eligible Delegate Found',
        message:
          'No eligible delegates could perform the required capabilities for this task: [ dhgjdgk ]\n  -  The capabilities were tested by the following delegates: [ Meenakshi-Raikwar-MBP ]\n  -  Following delegates were validating but never returned: [  ]\n  -  Other delegates (if any) may have been offline or were not eligible due to tag or scope restrictions.',
        code: 460
      }
    ],
    errorSummary:
      ' No Eligible Delegate Found (No eligible delegates could perform the required capabilities for this task: [ dhgjdgk ]\n  -  The capabilities were tested by the following delegates: [ Meenakshi-Raikwar-MBP ]\n  -  Following delegates were validating but never returned: [  ]\n  -  Other delegates (if any) may have been offline or were not eligible due to tag or scope restrictions.)',
    testedAt: 1612265169539,
    delegateId: null
  },
  metaData: null,
  correlationId: 'f2da1511-980f-44e4-bc98-38bb811775a6'
}
const testConnectorResultActive = {
  status: 'SUCCESS',
  data: {
    status: 'SUCCESS',
    errors: null,
    errorSummary: null,
    testedAt: 1612265169539,
    delegateId: null
  },
  metaData: null,
  correlationId: 'f2da1511-980f-44e4-bc98-38bb811775a6'
}

const reloadTestConnection = () => Promise.resolve(testConnectorResultError)
const reloadTestConnectionActive = () => Promise.resolve(testConnectorResultActive)
const reloadTestConnectionFailedAPI = () => {
  return undefined
}

const getEditButton = () => document.body.querySelector('.bp3-menu span[icon="edit"]')
const getDeleteButton = () => document.body.querySelector('.bp3-menu span[icon="trash"]')
const getMenuIcon = (row: Element) => {
  const columns = row.querySelectorAll('[role="cell"]')
  const lastColumn = columns[columns.length - 1]
  return lastColumn.querySelector('[data-icon="Options"]')
}

jest.mock('services/cd-ng', () => ({
  useGetConnectorStatistics: jest.fn().mockImplementation(() => Promise.resolve(statisticsMockData)),
  useGetConnectorCatalogue: jest.fn().mockImplementation(() => Promise.resolve(catalogueData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { data: filters, loading: false }
  }),
  usePostFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useUpdateFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteConnector: jest.fn().mockImplementation(() => Promise.resolve()),
  useGetTestConnectionResult: jest.fn()
}))

describe('Connectors List Test', () => {
  const props = {
    data: connectorsData.data as any,
    reload: jest.fn(),
    openConnectorModal: jest.fn(),
    gotoPage: jest.fn()
  }

  const setup = (customProps = {}) =>
    render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectorsListView {...{ ...props, ...customProps }} />
      </TestWrapper>
    )

  const setupWithGit = (customProps = {}) =>
    render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/resources/connectors"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <ConnectorsListView {...{ ...props, ...customProps }} />
      </TestWrapper>
    )

  test('Initial render should match snapshot', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnection }
    })
    const { container } = setup()

    await waitFor(() => queryByText(container, 'Connectors'))
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Click on Test button with result error', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnection }
    })
    const { container, getAllByText, getByText } = setup()

    await waitFor(() => queryByText(container, 'Connectors'))
    const testBtn = getAllByText('TEST')[0]

    act(() => {
      fireEvent.click(testBtn)
    })
    expect(container).toMatchSnapshot()
    expect(getByText('connectors.testInProgress')).toBeDefined()

    await waitFor(() => expect(getAllByText('TEST')[0]).not.toBeNull())
    await waitFor(() => expect(getAllByText('failed')[0]).not.toBeNull())

    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Click on Test button with result active', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnectionActive }
    })
    const { container, getAllByText, getByText } = setup()

    await waitFor(() => queryByText(container, 'Connectors'))
    const testBtn = getAllByText('TEST')[0]

    act(() => {
      fireEvent.click(testBtn)
    })
    expect(container).toMatchSnapshot()
    expect(getByText('connectors.testInProgress')).toBeDefined()
    await waitFor(() => expect(getAllByText('TEST')[0]).not.toBeNull())

    await waitFor(() => expect(getAllByText('success')[0]).not.toBeNull())

    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Click on Test button with result Failed api', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnectionFailedAPI }
    })
    const { container, getAllByText, getByText } = setup()

    await waitFor(() => queryByText(container, 'Connectors'))
    const testBtn = getAllByText('TEST')[0]

    act(() => {
      fireEvent.click(testBtn)
    })
    expect(container).toMatchSnapshot()
    expect(getByText('connectors.testInProgress')).toBeDefined()
    await waitFor(() => expect(getAllByText('TEST')[0]).not.toBeNull())

    expect(container).toMatchSnapshot()
  })

  test('Context menu should be present on each connector row', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnection }
    })
    const { container } = setupWithGit()
    const tableRows = Array.from(container.querySelectorAll('div[role="row"]'))
    tableRows.shift() // remove header row

    const testRow = async (row: Element) => {
      const menuIcon = getMenuIcon(row)
      // assert that menu icon exists in the last column
      expect(menuIcon).toBeTruthy()
      const checkForMenuState = async (shouldExist = false) => {
        if (shouldExist) {
          await waitFor(() => expect(getEditButton()).toBeTruthy())
          await waitFor(() => expect(getDeleteButton()).toBeTruthy())
        } else {
          await waitFor(() => expect(getEditButton()).not.toBeTruthy())
          await waitFor(() => expect(getDeleteButton()).not.toBeTruthy())
        }
      }
      // menu should not be open by default
      await checkForMenuState()
      act(() => {
        fireEvent.click(menuIcon!)
      })
      // menu should open on clicking the options icon
      await checkForMenuState(true)

      act(() => {
        fireEvent.mouseDown(document)
      })
    }
    // Checking context menu only for 1st in list, as it will be hidden for unsynced connectors and Harness SM
    await testRow(tableRows[0])
  })

  test('Edit and delete methods should be called with correct data', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnection }
    })
    const openConnectorModal = jest.fn()
    const { container } = setupWithGit({ openConnectorModal })
    const currentConnector = connectorsData.data.content[0].connector
    const gitDetails = connectorsData.data.content[0]?.gitDetails
    const deleteText = `connectors.confirmDelete `
    const menuIcon = getMenuIcon(container.querySelectorAll('div[role="row"]')[1])
    act(() => {
      fireEvent.click(menuIcon!)
    })
    act(() => {
      fireEvent.click(getDeleteButton()!)
    })
    await waitFor(() => expect(queryByText(document.body, `${deleteText}${currentConnector.name}?`)).toBeTruthy())
    act(() => {
      fireEvent.click(queryByText(document.body.querySelector('.bp3-dialog')! as HTMLElement, 'cancel')!)
    })
    act(() => {
      fireEvent.click(getEditButton()!)
    })
    expect(openConnectorModal).toBeCalledWith(true, currentConnector.type, {
      connectorInfo: currentConnector,
      gitDetails: gitDetails,
      status: null
    })
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Edit and delete methods should be called with correct data', async () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [false])
    const { container } = setup()
    const menuIcon = getMenuIcon(container.querySelectorAll('div[role="row"]')[1])
    act(() => {
      fireEvent.click(menuIcon!)
    })
    const [editButton, deleteButton] = [getEditButton(), getDeleteButton()]
    expect(editButton!.parentElement?.getAttribute('class')).toContain('disabled')
    expect(deleteButton!.parentElement?.getAttribute('class')).toContain('disabled')
  })

  test('Test of listing connectors with git enabled', async () => {
    ;(useGetTestConnectionResult as any).mockImplementation(() => {
      return { mutate: reloadTestConnection }
    })
    const { container } = setupWithGit()

    await waitFor(() => queryByText(container, 'Connectors'))
    expect(container).toMatchSnapshot()
  })
})
