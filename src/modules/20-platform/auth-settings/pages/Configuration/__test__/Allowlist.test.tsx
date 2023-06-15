/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  fireEvent,
  waitFor,
  RenderResult,
  queryByText,
  getByText as getByTextFromRTL,
  queryByAttribute
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import {
  useGetIpAllowlistConfigsQuery,
  useUpdateIpAllowlistConfigMutation,
  useDeleteIpAllowlistConfigMutation,
  validateIpAddressAllowlistedOrNot
} from '@harnessio/react-ng-manager-client'
import type {
  IpAllowlistConfigListResponseResponse,
  IpAllowlistConfigResponse
} from '@harnessio/react-ng-manager-client'

import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { VIEWS } from '@auth-settings/pages/Configuration/Configuration'
import { mockResponseValidateIpAddressCustomBlockSuccess } from '@auth-settings/__test__/mock'
import { fetchCurrentIp } from '@auth-settings/services/ipAddressService'
import Allowlist from '../Allowlist'
import { mockIpAllowlistConfigResponse } from './mock'

jest.mock('@harnessio/react-ng-manager-client')
const validateIpAddressAllowlistedOrNotMock = validateIpAddressAllowlistedOrNot as jest.MockedFunction<any>
validateIpAddressAllowlistedOrNotMock.mockImplementation(() => {
  return Promise.resolve({ content: mockResponseValidateIpAddressCustomBlockSuccess })
})
jest.mock('@auth-settings/services/ipAddressService')
const fetchCurrentIpMock = fetchCurrentIp as jest.MockedFunction<any>
fetchCurrentIpMock.mockImplementation(() => {
  return Promise.resolve('192.168.1.1')
})

type MockWithDataReturn = {
  mockGetIpAllowlistPromise: jest.Mock
  mockUpdateIpAllowlistPromise: jest.Mock<
    Promise<{
      content: IpAllowlistConfigResponse
    }>,
    [any, any]
  >
  mockDeleteIpAllowlistPromise: jest.Mock<Promise<undefined>, [any, any]>
}

const mockWithData = (
  ipAllowlistConfigData: IpAllowlistConfigListResponseResponse,
  isFetching = false
): MockWithDataReturn => {
  const mockGetIpAllowlistPromise = jest.fn(() =>
    Promise.resolve({ content: ipAllowlistConfigData, isFetching: false })
  )
  const mockUpdateIpAllowlistPromise = jest.fn((_, { onSuccess, onError }) =>
    Promise.resolve({ content: ipAllowlistConfigData[0], isFetching: false }).then(onSuccess).catch(onError)
  )
  const mockDeleteIpAllowlistPromise = jest.fn((_, { onSuccess, onError }) =>
    // successful delete operation returns with: HTTP 204 (NO CONTENT)
    Promise.resolve(undefined).then(onSuccess).catch(onError)
  )
  const useGetIpAllowlistConfigsQueryMock = useGetIpAllowlistConfigsQuery as jest.MockedFunction<any>
  const useUpdateIpAllowlistConfigMutationMock = useUpdateIpAllowlistConfigMutation as jest.MockedFunction<any>
  const useDeleteIpAllowlistConfigMutationMock = useDeleteIpAllowlistConfigMutation as jest.MockedFunction<any>
  useGetIpAllowlistConfigsQueryMock.mockImplementation(() => {
    return {
      data: isFetching ? undefined : { content: ipAllowlistConfigData },
      error: false,
      isFetching,
      refetch: mockGetIpAllowlistPromise
    }
  })
  useUpdateIpAllowlistConfigMutationMock.mockImplementation(() => {
    return {
      mutate: mockUpdateIpAllowlistPromise
    }
  })
  useDeleteIpAllowlistConfigMutationMock.mockImplementation(() => {
    return {
      isLoading: false,
      mutate: mockDeleteIpAllowlistPromise
    }
  })

  return { mockGetIpAllowlistPromise, mockUpdateIpAllowlistPromise, mockDeleteIpAllowlistPromise }
}

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      queryParams={{ view: VIEWS.ALLOWLIST }}
      path={routes.toAuditTrail({ ...accountPathProps })}
      pathParams={{ accountId: 'testAcc' }}
    >
      <Allowlist />
    </TestWrapper>
  )
}

describe('Allowlist List View', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  let getByText: RenderResult['getByText']
  let findAllByTestId: RenderResult['findAllByTestId']
  let mockGetIpAllowlistPromise: any
  let mockUpdateIpAllowlistPromise: any
  let mockDeleteIpAllowlistPromise: any

  beforeEach(async () => {
    const {
      mockGetIpAllowlistPromise: mockGet,
      mockUpdateIpAllowlistPromise: mockUpdate,
      mockDeleteIpAllowlistPromise: mockDelete
    } = mockWithData(mockIpAllowlistConfigResponse)
    const renderObj = renderComponent()
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    getByText = renderObj.getByText
    findAllByTestId = renderObj.findAllByTestId

    mockGetIpAllowlistPromise = mockGet
    mockUpdateIpAllowlistPromise = mockUpdate
    mockDeleteIpAllowlistPromise = mockDelete

    await waitFor(() => getAllByText('authSettings.ipAddress.addIpAddresses'))
  })

  test('render, click on addIPAllowlistBtn and closeButton', async () => {
    const newIpAddressButton = getByText('authSettings.ipAddress.addIpAddresses')
    await act(async () => {
      fireEvent.click(newIpAddressButton!)
    })
    const confirmDialog = document.querySelectorAll('.bp3-dialog')[0] as HTMLElement
    const closeIcon = queryByAttribute('icon', confirmDialog, 'cross')
    await act(async () => {
      fireEvent.click(closeIcon!)
    })
    await waitFor(() => expect(mockGetIpAllowlistPromise).toHaveBeenCalled())
  })

  test('Renders Columns correctly', () => {
    const firstIpConfigName = mockIpAllowlistConfigResponse[0].ip_allowlist_config.name as string
    const firstIpConfigIpAddress = mockIpAllowlistConfigResponse[0].ip_allowlist_config.ip_address as string
    const ipConfigName = getByTextFromRTL(document.body, firstIpConfigName)
    const ipConfigIpAddress = getByTextFromRTL(document.body, firstIpConfigIpAddress)
    expect(ipConfigName).toBeDefined()
    expect(ipConfigIpAddress).toBeDefined()
  })

  test('Toggle enabled/disabled', async () => {
    const toggleEnabledOrDisabled = await findAllByTestId('toggleEnabled')
    await userEvent.click(toggleEnabledOrDisabled[0]!) // Clicking on disabled
    await waitFor(() => getByTextFromRTL(document.body, 'authSettings.yesIamSure'))
    const dialogContainer = findDialogContainer()
    expect(dialogContainer).toBeTruthy()
    const iAmSureCheckbox = queryByText(dialogContainer as HTMLElement, 'authSettings.yesIamSure')
    await userEvent.click(iAmSureCheckbox!)
    const enableButton = queryByText(dialogContainer as HTMLElement, 'enable')
    await userEvent.click(enableButton!)
    expect(mockUpdateIpAllowlistPromise).toHaveBeenCalledTimes(1)

    await userEvent.click(toggleEnabledOrDisabled[1]!) // Clicking on enabled
    expect(mockUpdateIpAllowlistPromise).toHaveBeenCalledTimes(2)
  })

  test('Delete IP Config', async () => {
    const menu = container.querySelector(
      `[data-testid="menu-${mockIpAllowlistConfigResponse[0].ip_allowlist_config.identifier}"]`
    )
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const deleteMenu = getByTextFromRTL(popover as HTMLElement, 'delete')
    fireEvent.click(deleteMenu)
    await waitFor(() => getByTextFromRTL(document.body, 'authSettings.ipAddress.deleteIpAddressDialogTitle'))
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    const deleteBtn = queryByText(form as HTMLElement, 'delete')
    fireEvent.click(deleteBtn!)
    expect(mockDeleteIpAllowlistPromise).toHaveBeenCalled()
  })

  test('Clicks on Edit IP Allowlist Config and modal opens', async () => {
    const menu = container.querySelector(
      `[data-testid="menu-${mockIpAllowlistConfigResponse[0].ip_allowlist_config.identifier}"]`
    )
    fireEvent.click(menu!)
    const editMenu = getAllByText?.('edit')[0]
    await userEvent.click(editMenu!)
    await waitFor(() => getByTextFromRTL(document.body, 'authSettings.ipAddress.defineRange'))
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    const closeIcon = queryByAttribute('icon', form as HTMLElement, 'cross')
    await userEvent.click(closeIcon!)
    expect(mockGetIpAllowlistPromise).toHaveBeenCalled()
  })

  test('Should render allowlist with no data', async () => {
    mockWithData([])
    const { getByText: _getByText, getByTestId } = renderComponent()
    await waitFor(() => getAllByText('authSettings.ipAddress.noIPsAllowlisted'))
    expect(_getByText('authSettings.ipAddress.noIPsAllowlisted')).toBeInTheDocument()
    const newIpAddressButton = getByTestId('addIpAddresses')
    await userEvent.click(newIpAddressButton!)
  })

  test('Should render allowlist while fetching data', async () => {
    mockWithData([], true)
    const { getByText: _getByText } = renderComponent()
    await waitFor(() => getAllByText('authSettings.ipAddress.addIpAddresses'))
    expect(_getByText('authSettings.ipAddress.noIPsAllowlisted')).toBeInTheDocument()
  })
})
