/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { noop } from 'lodash-es'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import { useGetConnectorList, useUpdateAccountSetting } from 'services/cd-ng'

import ConnectorSettings from '../ConnectorSettings'

jest.mock('services/cd-ng')
const useUpdateAccountSettingMock = useUpdateAccountSetting as jest.MockedFunction<any>
const useGetConnectorListMock = useGetConnectorList as jest.MockedFunction<any>

describe('Test ConnectorSetting', () => {
  beforeEach(() => {
    useUpdateAccountSettingMock.mockImplementation(() => ({ refetch: jest.fn() }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  test('Should render ConnectorSetting initial load - BuiltInSM:enabled(unchecked) and have less than two SM configured.', async () => {
    useGetConnectorListMock.mockImplementation(() => {
      return { data: { data: { content: [{}] } } }
    })
    const { container, getByTestId } = render(
      <TestWrapper>
        <ConnectorSettings disableBuiltInSM={false} onChange={noop} />
      </TestWrapper>
    )
    await waitFor(() => expect('common.accountSetting.connector.disableBISMHeading').toBeDefined())
    expect(getByTestId('checkBox-disable-builtInSM')?.getAttribute('disabled')).not.toBeNull()
    expect(getByTestId('apply-connector-setting')?.getAttribute('disabled')).not.toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('Should render ConnectorSetting initial load - BuiltInSM:disabled(checked) and have less than two SM configured.', async () => {
    useGetConnectorListMock.mockImplementation(() => {
      return { data: {} }
    })

    const { container, getByTestId } = render(
      <TestWrapper>
        <ConnectorSettings disableBuiltInSM={true} onChange={noop} />
      </TestWrapper>
    )
    await waitFor(() => expect('common.accountSetting.connector.disableBISMHeading').toBeDefined())
    expect(getByTestId('checkBox-disable-builtInSM').getAttribute('disabled')).toBeNull()
    expect(getByTestId('checkBox-disable-builtInSM').getAttribute('checked')).not.toBeNull()

    expect(container).toMatchSnapshot()
  })

  test('Should render ConnectorSetting initial load - BuiltInSM:disabled(checked) and have 2 or more SM configured.', async () => {
    useGetConnectorListMock.mockImplementation(() => {
      return { data: { data: { content: [{}, {}] } } }
    })

    const { getByTestId } = render(
      <TestWrapper>
        <ConnectorSettings disableBuiltInSM={true} onChange={noop} />
      </TestWrapper>
    )
    await waitFor(() => expect('common.accountSetting.connector.disableBISMHeading').toBeDefined())
    expect(getByTestId('checkBox-disable-builtInSM')?.getAttribute('disabled')).toBeNull()
  })
  test('Should render ConnectorSetting initial load - BuiltInSM:enabled(unchecked) and have 2 or more SM configured.', async () => {
    useGetConnectorListMock.mockImplementation(() => {
      return { data: { data: { content: [{}, {}] } } }
    })

    const { getByTestId } = render(
      <TestWrapper>
        <ConnectorSettings disableBuiltInSM={false} onChange={noop} />
      </TestWrapper>
    )
    await waitFor(() => expect('common.accountSetting.connector.disableBISMHeading').toBeDefined())
    expect(getByTestId('checkBox-disable-builtInSM')?.getAttribute('disabled')).toBeNull()
  })

  test('Should render ConnectorSetting - disable built in SM and save settings.', async () => {
    useGetConnectorListMock.mockImplementation(() => {
      return { data: { data: { content: [{}, {}] } } }
    })

    const { container, getByTestId } = render(
      <TestWrapper>
        <ConnectorSettings disableBuiltInSM={false} onChange={noop} />
      </TestWrapper>
    )
    await waitFor(() => expect('common.accountSetting.connector.disableBISMHeading').toBeDefined())
    expect(getByTestId('checkBox-disable-builtInSM')?.getAttribute('disabled')).toBeNull()
    expect(getByTestId('apply-connector-setting')?.getAttribute('disabled')).not.toBeNull()
    expect(container).toMatchSnapshot()

    act(() => {
      const checkbox = getByTestId('checkBox-disable-builtInSM')
      if (checkbox) {
        fireEvent.click(checkbox)
      }
    })
    expect(container).toMatchSnapshot()
    // apply enabled
    expect(getByTestId('apply-connector-setting')?.getAttribute('disabled')).toBeNull()
    act(() => {
      const save = getByTestId('apply-connector-setting')
      if (save) {
        fireEvent.click(save)
      }
    })
    await waitFor(() => expect(useUpdateAccountSettingMock).toBeCalled())
  })
})
