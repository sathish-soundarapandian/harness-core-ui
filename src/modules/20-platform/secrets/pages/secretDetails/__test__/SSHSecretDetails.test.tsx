/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText, waitFor, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import type { ResponseSecretValidationResultDTO } from 'services/cd-ng'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import SecretDetails from '../SecretDetails'

import mockData from './secretDetailsMocks.json'

const delegateResponse = {
  metaData: {},
  resource: true,
  responseMessages: 'true'
}

const responseSecretValidation: ResponseSecretValidationResultDTO = {
  status: 'SUCCESS',
  data: { success: true },
  metaData: {}
}
jest.useFakeTimers()
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('services/portal', () => ({
  useGetDelegatesStatus: jest.fn().mockImplementation(() => {
    return { data: delegateResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))
jest.mock('services/cd-ng', () => ({
  useGetSecretV2: jest.fn().mockImplementation(() => {
    return { ...mockData.sshKey, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetConnectorList: jest.fn().mockImplementation(() => {
    return { ...mockData.secretManagers, refetch: jest.fn(), error: null, loading: false }
  }),
  useValidateSecret: jest
    .fn()
    .mockImplementation(() => ({ mutate: () => Promise.resolve({ responseSecretValidation }) })),
  getSecretV2Promise: jest.fn().mockImplementation(() => mockData.sshKey.data),
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
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretDetails secretData={mockData.sshKey.data as any} />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
  })
  test('SSH Secret with Key Render', () => {
    expect(container).toMatchSnapshot()
  })
  test('Test Connection', async () => {
    const testConnection = getAllByText('common.smtp.testConnection')[0]
    await act(async () => {
      fireEvent.click(testConnection)
    })
    expect(container).toMatchSnapshot()
    setFieldValue({
      container: container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'host',
      value: 'http://localhost:8080'
    })
    await act(async () => {
      fireEvent.click(testConnection)
    })
    expect(container).toMatchSnapshot()
    const retestConnection = getAllByText('retry')[0]

    await act(async () => {
      fireEvent.click(retestConnection)
    })
    expect(container).toMatchSnapshot()
  }),
    test('Edit SSH', async () => {
      const edit = getAllByText('editDetails')[0]
      expect(container).toMatchSnapshot()
      await act(async () => {
        fireEvent.click(edit)
      })
      await act(async () => {
        await waitFor(() => getByText(document.body, 'SSH'))
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      fireEvent.click(form?.querySelector('[icon="cross"]')!)
      form = findDialogContainer()
      expect(form).not.toBeTruthy()
    })
})
