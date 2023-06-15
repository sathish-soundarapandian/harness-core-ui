/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { render, fireEvent, act, getByText as getByTextBody, waitFor } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import type { YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import routes from '@common/RouteDefinitions'
import * as mockSchemaData from './schema.json'
import CreateSecretFromYamlPage from '../CreateSecretFromYamlPage'
import mockData from '../../secretDetails/__test__/secretDetailsMocks.json'

const yamlStringFn = jest.fn()
yamlStringFn.mockImplementation(() => 'name: test')
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ bind }: YamlBuilderProps) => {
  useEffect(() => {
    bind?.({
      getLatestYaml: () => yamlStringFn(),
      getYAMLValidationErrorMap: () => new Map()
    })
  }, [])

  return 'dummy'
})
jest.mock('services/cd-ng', () => ({
  usePostSecretViaYaml: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
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

describe('CreateSecretFromYamlPage', () => {
  test('render', () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/create-secret-from-yaml" pathParams={{ accountId: 'dummy' }}>
        <CreateSecretFromYamlPage mockSchemaData={mockSchemaData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('createSecretYAML.create'))
    })
  })
  test('cancel with content', async () => {
    const { getByText } = render(
      <TestWrapper path="/account/:accountId/resources/create-secret-from-yaml" pathParams={{ accountId: 'dummy' }}>
        <CreateSecretFromYamlPage mockSchemaData={mockSchemaData as any} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('cancel'))
    })

    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'continueWithoutSavingText'))
    expect(dialog).toMatchSnapshot()
  })
  const routesToSecretsSpy = jest.spyOn(routes, 'toSecrets')
  test('cancel without content', async () => {
    yamlStringFn.mockImplementation(() => '')
    const { getByText } = render(
      <TestWrapper path="/account/:accountId/resources/create-secret-from-yaml" pathParams={{ accountId: 'dummy' }}>
        <CreateSecretFromYamlPage mockSchemaData={'' as any} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('cancel'))
    })

    expect(routesToSecretsSpy).toHaveBeenCalled()
  })
})
