/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, findByText, act, getByText, queryByText } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import CreateUpdateSecret from '../CreateUpdateSecret'

import mockData from './listSecretManagersMock.json'
import connectorMockData from './getConnectorMock.json'
import secretDetailsMock from './secretDetailsMock.json'
import secretMockData from './secretMockData.json'

const mockUpdateTextSecret = jest.fn()

jest.mock('services/cd-ng', () => ({
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTextSecret })),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetGcpRegions: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetSecretV2: jest.fn().mockImplementation(() => ({ refetch: jest.fn(), data: secretMockData })),
  useGetConnectorList: () => {
    return {
      data: mockData,
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: connectorMockData,
      refetch: jest.fn()
    }
  }
}))

describe('CreateUpdateSecret', () => {
  test('Create Text Secret', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret type={'SecretText'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Create File Secret', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret type={'SecretFile'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Create Secret with radio button', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret />
      </TestWrapper>
    )
    expect(getByText(container, 'secrets.secret.labelSecretType')).toBeDefined()
    expect(getByText(container, 'secrets.labelValue')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('Create Secret with radio button and switch radio from text to file', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret />
      </TestWrapper>
    )
    expect(getByText(container, 'secrets.labelValue')).toBeDefined()
    fireEvent.click(getByText(container, 'secrets.secret.labelFile'))
    expect(getByText(container, 'secrets.secret.labelSecretFile')).toBeDefined()
    expect(queryByText(container, 'secrets.labelValue')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('Create Secret with radio button and switch radio from text to file and back', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret />
      </TestWrapper>
    )
    expect(getByText(container, 'secrets.labelValue')).toBeDefined()
    fireEvent.click(getByText(container, 'secrets.secret.labelFile'))
    expect(getByText(container, 'secrets.secret.labelSecretFile')).toBeDefined()
    expect(queryByText(container, 'secrets.labelValue')).toBeNull()
    fireEvent.click(getByText(container, 'secrets.secret.labelText'))
    expect(queryByText(container, 'secrets.secret.labelSecretFile')).toBeNull()
    expect(getByText(container, 'secrets.labelValue')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('Update Text Secret', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret secret={secretDetailsMock as any} type={'SecretText'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.change(container.querySelector("textarea[name='description']")!, { target: { value: 'new desc' } })
      const submitBtn = await findByText(container, 'save')
      fireEvent.click(submitBtn)
    })

    expect(mockUpdateTextSecret).toHaveBeenCalledWith({
      secret: {
        type: 'SecretText',
        name: 'text1',
        identifier: 'text1',
        description: 'new desc',
        tags: {},
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        spec: { secretManagerIdentifier: 'vault1', valueType: 'Inline' }
      }
    })
  })
})
