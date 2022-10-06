/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'
import { clickSubmit } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import CreateUpdateSecret from '../CreateUpdateSecret'

import { secretManagerList, secretManagerResponse, secretResponse } from './customSMSecretMocks'

const mockUpdateTextSecret = jest.fn()

jest.mock('services/cd-ng', () => ({
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTextSecret })),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetSecretV2: jest.fn().mockImplementation(() => ({ refetch: jest.fn(), data: secretResponse })),
  useGetConnectorList: () => {
    return {
      data: secretManagerList,
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: secretManagerResponse,
      refetch: jest.fn()
    }
  }
}))

describe('CreateUpdateSecret', () => {
  test('Update Text Secret with valueType - CustomSecretManagerInputs - edit', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret type={'SecretText'} secret={secretResponse as any} />
      </TestWrapper>
    )
    await waitFor(() => getByText('secrets.labelSecretsManager'))
    expect(container.querySelector("input[value='customSM']")).toBeDefined()
    expect(container.querySelector("input[value='vaulttoken']")).toBeDefined()

    act(() => {
      fireEvent.change(container.querySelector("input[name='templateInputs.environmentVariables[0].value']")!, {
        target: { value: 'vaulttoken-changed' }
      })
    })
    await waitFor(() => expect(container.querySelector("input[value='vaulttoken-changed']")).toBeDefined())

    act(() => {
      clickSubmit(container)
    })

    await waitFor(() =>
      expect(mockUpdateTextSecret).toHaveBeenCalledWith({
        secret: {
          type: 'SecretText',
          name: 'csmsecret',
          identifier: 'csmsecret',
          description: '',
          tags: {},
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          spec: {
            secretManagerIdentifier: 'customSM',
            value: '{"environmentVariables":[{"name":"var1","type":"String","value":"vaulttoken-changed"}]}',
            valueType: 'CustomSecretManagerValues'
          }
        }
      })
    )
  })
})
