/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, findByText, act, queryByText, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import * as serviceCDNG from 'services/cd-ng'
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

  getConnectorListV2Promise: jest.fn().mockImplementation(() => {
    return Promise.resolve(mockData)
  }),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetGcpRegions: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetSecretV2: jest.fn().mockImplementation(() => {
    return {
      refetch: jest.fn().mockImplementation(() => {
        return secretMockData
      }),
      loading: false,
      data: null
    }
  }),

  useGetConnectorList: () => {
    return {
      data: mockData,
      loading: false,
      refetch: jest.fn().mockImplementation(() => {
        return mockData
      })
    }
  },
  useGetConnector: jest.fn().mockImplementation(() => {
    return {
      data: connectorMockData,
      loading: false,
      refetch: jest.fn().mockImplementation(() => {
        return null
      })
    }
  })
}))

describe('CreateUpdateSecret', () => {
  test('Create Text Secret', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret type={'SecretText'} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('secrets.labelSecretName')).toBeTruthy())

    await waitFor(() => expect(getByText('secrets.labelValue')).toBeTruthy())

    expect(container).toMatchSnapshot()
  })

  test('Create File Secret', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret type={'SecretFile'} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('secrets.labelSecretName')).toBeTruthy())
    await waitFor(() => expect(getByText('secrets.secret.labelSecretFile')).toBeTruthy())

    expect(container).toMatchSnapshot()
  })

  test('Create Secret with radio button', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('secrets.secret.labelSecretType')).toBeTruthy())
    expect(getByText('secrets.secret.labelSecretType')).toBeDefined()
    expect(getByText('secrets.labelValue')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('Create Secret with radio button and switch radio from text to file', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('secrets.secret.labelFile')).toBeTruthy())
    expect(getByText('secrets.labelValue')).toBeDefined()
    fireEvent.click(getByText('secrets.secret.labelFile'))
    expect(getByText('secrets.secret.labelSecretFile')).toBeDefined()
    expect(queryByText(container, 'secrets.labelValue')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('Create Secret with radio button and switch radio from text to file and back', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('secrets.secret.labelFile')).toBeTruthy())

    expect(getByText('secrets.labelValue')).toBeDefined()
    fireEvent.click(getByText('secrets.secret.labelFile'))
    expect(getByText('secrets.secret.labelSecretFile')).toBeDefined()
    expect(queryByText(container, 'secrets.labelValue')).toBeNull()
    fireEvent.click(getByText('secrets.secret.labelText'))
    expect(queryByText(container, 'secrets.secret.labelSecretFile')).toBeNull()
    expect(getByText('secrets.labelValue')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('Update Text Secret', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(serviceCDNG, 'useGetSecretV2').mockImplementation(() => {
      return {
        refetch: jest.fn().mockImplementation(() => {
          return secretMockData
        }),
        loading: false,
        data: secretMockData
      }
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(serviceCDNG, 'useGetConnector').mockImplementation(() => {
      return {
        data: connectorMockData,
        loading: false,
        refetch: jest.fn().mockImplementation(() => {
          return connectorMockData
        })
      }
    })
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret secret={secretDetailsMock as any} type={'SecretText'} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('secrets.secret.inlineSecret')).toBeTruthy())
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
