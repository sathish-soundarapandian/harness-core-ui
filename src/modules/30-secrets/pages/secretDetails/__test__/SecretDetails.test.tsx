/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, findByText, act, getByText, waitFor } from '@testing-library/react'

import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import SecretDetails from '../SecretDetails'

import mockData from './secretDetailsMocks.json'
import connectorMockData from './getConnectorMock.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('services/cd-ng', () => ({
  useGetSecretV2: jest.fn().mockImplementation(() => {
    return { ...mockData.text, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetConnectorList: jest.fn().mockImplementation(() => {
    return { ...mockData.secretManagers, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetConnector: () => {
    return {
      data: connectorMockData,
      refetch: jest.fn()
    }
  },
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretTextV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretTextV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretViaYaml: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetYamlSchema: jest.fn().mockImplementation(() => {
    return { ...mockData.yamlSchema, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetYamlSnippetMetadata: jest.fn().mockImplementation(() => {
    return { ...mockData.yamlSnippetMetaData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetYamlSnippet: jest.fn().mockImplementation(() => {
    return { ...mockData.yamlSnippetMetaData, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Secret Details', () => {
  test('Text Secret', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretDetails secretData={mockData.text.data as any} refetch={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      const $editButton = await findByText(container, 'editDetails')
      fireEvent.click($editButton)
      await waitFor(() => getByText(document.body, 'secrets.secret.titleEditText'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    })
  })
  test('File Secret', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretDetails secretData={mockData.file.data as any} refetch={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('SSH Secret with Key', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretDetails secretData={mockData.sshKey.data as any} refetch={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('SSH Secret with Key YAML', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretDetails secretData={mockData.sshKey.data as any} refetch={jest.fn()} />
      </TestWrapper>
    )
    await act(async () => {
      const yamlButton = await findByText(container, 'YAML')
      expect(yamlButton).toBeDefined()
      fireEvent.click(yamlButton)

      const editButton = await findByText(container, 'editDetails')
      expect(yamlButton).toBeDefined()
      fireEvent.click(editButton)

      const saveButton = await findByText(container, 'save')
      expect(saveButton).toBeDefined()
      fireEvent.click(saveButton)

      // const yamlDiv = await findByText(container, 'yamlDiv')
      // expect(yamlDiv).toBeDefined()
      expect(container).toMatchSnapshot()
    })
  })
})
