/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetConnectorList, useListAccountSetting, useUpdateAccountSetting } from 'services/cd-ng'
import AccountSetting from '../views/Settings/AccountSettings'

jest.mock('services/cd-ng')
const useUpdateAccountSettingMock = useUpdateAccountSetting as jest.MockedFunction<any>
const useGetConnectorListMock = useGetConnectorList as jest.MockedFunction<any>
const useListAccountSettingMock = useListAccountSetting as jest.MockedFunction<any>

describe('Test AccountSetting', () => {
  beforeEach(() => {
    useListAccountSettingMock.mockImplementation(() => {
      return {
        status: 'SUCCESS',
        data: [
          {
            id: 'mockedId',
            accountIdentifier: 'accountId',
            orgIdentifier: null,
            projectIdentifier: null,
            createdAt: null,
            lastModifiedAt: null,
            type: 'Connector',
            config: { builtInSMDisabled: true }
          }
        ],
        metaData: null,
        correlationId: 'correlation'
      }
    })
    useUpdateAccountSettingMock.mockImplementation(() => ({ refetch: jest.fn() }))
    useGetConnectorListMock.mockImplementation(() => {
      return { data: {} }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should render AccountSetting - initialload-collapsed', async () => {
    render(
      <TestWrapper>
        <AccountSetting />
      </TestWrapper>
    )
    await waitFor(() => expect(useListAccountSetting).toBeCalledTimes(1))
    await waitFor(() => expect('settingsLabel').toBeDefined())

    expect('connectorLable').toBeDefined()
  })

  test('Should render AccountSetting - expand connector collapse', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AccountSetting />
      </TestWrapper>
    )
    await waitFor(() => expect(useListAccountSetting).toBeCalledTimes(1))
    await waitFor(() => expect('connectorLable').toBeDefined())

    act(() => {
      const connectorCollapse = getByText('connectorsLabel')
      if (connectorCollapse) {
        fireEvent.click(connectorCollapse)
      }
    })

    await waitFor(() => expect(useGetConnectorListMock).toBeCalledTimes(1))
  })
})
