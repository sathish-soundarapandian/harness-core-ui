/* eslint-disable jest/no-commented-out-tests */
/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cfServices from 'services/cf'
import * as cdngServices from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { PlatformEntryType } from '@cf/components/LanguageSelection/LanguageSelection'
import mockImport from 'framework/utils/mockImport'
import { SelectEnvironmentView, SelectEnvironmentViewProps } from '../views/SelectEnvironmentView'

const setApiKey = jest.fn()
const setSelectedEnvironment = jest.fn()

const renderComponent = (props?: Partial<SelectEnvironmentViewProps>): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SelectEnvironmentView
        language={{
          name: 'java',
          icon: 'javaicon',
          type: PlatformEntryType.SERVER,
          readmeStringId: 'cf.onboarding.readme.java'
        }}
        setApiKey={setApiKey}
        setSelectedEnvironment={setSelectedEnvironment}
        {...props}
      />
    </TestWrapper>
  )
}

describe('SelectEnvironmentView', () => {
  beforeEach(() => {
    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: {
          status: 'SUCCESS',
          data: {
            totalPages: 1,
            totalItems: 1,
            pageItemCount: 15,
            pageSize: 15,
            content: [
              {
                accountId: 'dummy',
                identifier: 'foo',
                name: 'bar',
                type: 'Production'
              }
            ],
            pageIndex: 0,
            empty: false
          }
        },
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('It should render elements and data correctly when no environment selected', async () => {
    renderComponent()

    await waitFor(() => {
      expect(document.querySelector('span[data-icon="spinner"]')).not.toBeInTheDocument()
      expect(screen.getByText('cf.onboarding.selectOrCreateEnvironment')).toBeVisible()
      expect(screen.getByText('cf.onboarding.environmentDescription')).toBeVisible()
      expect(screen.queryByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).not.toBeInTheDocument()
    })
  })

  test('It should open and close the Create Environment modal', async () => {
    renderComponent({
      language: {
        name: 'javascript',
        icon: 'javascripticon',
        type: PlatformEntryType.CLIENT,
        readmeStringId: 'cf.onboarding.readme.javascript'
      }
    })

    await waitFor(() => {
      expect(screen.getByText('cf.onboarding.selectOrCreateEnvironment')).toBeVisible()
      expect(screen.getByText('cf.onboarding.environmentDescription')).toBeVisible()
      expect(screen.queryByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).not.toBeInTheDocument()
      expect(screen.queryByText('cf.onboarding.keyDescriptionClient')).not.toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'cf.onboarding.selectOrCreateEnvironment' })).toBeInTheDocument()
    })

    const envInput = screen.getByRole('textbox', { name: 'cf.onboarding.selectOrCreateEnvironment' })

    await userEvent.click(envInput)

    await waitFor(() => {
      // one existing environment in dropdown
      expect(document.getElementsByTagName('li')).toHaveLength(1)
      expect(document.getElementsByTagName('li')[0]).toHaveTextContent('bar')
    })

    await userEvent.type(envInput, 'new env name')

    // click to open Create Environment modal
    await userEvent.click(screen.getByText('plus'))

    await waitFor(() => {
      expect(screen.getByText('cf.environments.create.title')).toBeVisible()
    })

    await userEvent.click(screen.getByText('cancel'))

    await waitFor(() => {
      expect(screen.queryByText('cf.environments.create.title')).not.toBeInTheDocument()
    })
  })

  test('It should show a text input if there are no existing environments and allow the user to create a new environment', async () => {
    const noEnvironmentData = {
      status: 'SUCCESS',
      data: {
        totalPages: 1,
        totalItems: 0,
        pageItemCount: 15,
        pageSize: 15,
        content: [],
        pageIndex: 0,
        empty: false
      }
    }

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        error: null,
        loading: false,
        refetch: jest.fn(),
        data: noEnvironmentData
      })
    })

    const createEnvironment = jest.fn().mockResolvedValue({
      status: 'SUCCESS',
      data: {
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        identifier: 'new_env_name',
        name: 'new env name',
        description: '',
        color: '#0063F7',
        type: 'PreProduction',
        deleted: false,
        tags: {},
        yaml: 'environment:\n  orgIdentifier: "dummy"\n  projectIdentifier: "dummy"\n  identifier: "new_env_name"\n  tags: {}\n  name: "new env name"\n  description: ""\n  type: "PreProduction"\n'
      },
      metaData: null,
      correlationId: '224f1243-c1d1-4544-8505-877e4bcaa982'
    })

    jest.spyOn(cdngServices, 'useCreateEnvironment').mockReturnValue({
      mutate: createEnvironment,
      loading: false,
      cancel: jest.fn(),
      error: null
    })

    renderComponent({
      language: {
        name: 'javascript',
        icon: 'javascripticon',
        type: PlatformEntryType.CLIENT,
        readmeStringId: 'cf.onboarding.readme.javascript'
      }
    })

    const createNewEnvTextbox = screen.getByRole('textbox', { name: 'cf.onboarding.typeNewEnvName' })

    expect(createNewEnvTextbox).toBeInTheDocument()

    await userEvent.type(createNewEnvTextbox, 'new env name')
    userEvent.click(screen.getByRole('button', { name: 'cf.onboarding.createEnv' }))

    // modal should be open
    expect(await screen.findByText('cf.environments.create.title')).toBeVisible()

    userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

    await waitFor(() => {
      expect(createEnvironment).toHaveBeenCalled()
      expect(setApiKey).toHaveBeenCalled()
      expect(setSelectedEnvironment).toHaveBeenCalled()
      // modal should be closed & confirmation msg visible
      expect(screen.queryByText('cf.environments.create.title')).not.toBeInTheDocument()
      expect(createNewEnvTextbox).toHaveValue('new env name')
      expect(screen.getByText('cf.onboarding.envCreated')).toBeVisible()
    })
  })

  test('It should create an environment', async () => {
    const createEnvironment = jest.fn().mockResolvedValue({
      status: 'SUCCESS',
      data: {
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        identifier: 'new_env_name',
        name: 'new env name',
        description: '',
        color: '#0063F7',
        type: 'PreProduction',
        deleted: false,
        tags: {},
        yaml: 'environment:\n  orgIdentifier: "dummy"\n  projectIdentifier: "dummy"\n  identifier: "new_env_name"\n  tags: {}\n  name: "new env name"\n  description: ""\n  type: "PreProduction"\n'
      },
      metaData: null,
      correlationId: '224f1243-c1d1-4544-8505-877e4bcaa982'
    })
    jest.spyOn(cdngServices, 'useCreateEnvironment').mockReturnValue({
      mutate: createEnvironment,
      loading: false,
      cancel: jest.fn(),
      error: null
    })

    renderComponent({
      language: {
        name: 'javascript',
        icon: 'javascripticon',
        type: PlatformEntryType.CLIENT,
        readmeStringId: 'cf.onboarding.readme.javascript'
      }
    })

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'cf.onboarding.selectOrCreateEnvironment' })).toBeInTheDocument()
      // modal should not be open
      expect(screen.queryByText('cf.environments.create.title')).not.toBeInTheDocument()
      expect(createEnvironment).not.toHaveBeenCalled()
      expect(setApiKey).not.toHaveBeenCalled()
      expect(setSelectedEnvironment).not.toHaveBeenCalled()
    })

    const envInput = screen.getByRole('textbox', { name: 'cf.onboarding.selectOrCreateEnvironment' })

    await userEvent.click(envInput)

    await waitFor(() => {
      // one existing environment in dropdown
      expect(document.getElementsByTagName('li')).toHaveLength(1)
      expect(document.getElementsByTagName('li')[0]).toHaveTextContent('bar')
    })

    // type env name
    await userEvent.type(envInput, 'new env name')

    // click to open Create Environment modal
    await userEvent.click(screen.getByText('plus'))

    await waitFor(() => {
      // modal should be open
      expect(screen.getByText('cf.environments.create.title')).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

    await waitFor(() => {
      expect(createEnvironment).toHaveBeenCalled()
      expect(setApiKey).toHaveBeenCalled()
      expect(setSelectedEnvironment).toHaveBeenCalled()
      // modal should be closed & confirmation msg visible
      expect(screen.queryByText('cf.environments.create.title')).not.toBeInTheDocument()
      expect(envInput).toHaveValue('new env name')
      expect(screen.getByText('cf.onboarding.envCreated')).toBeVisible()
    })
  })

  test('It should render button to create SDK key when environment selected', async () => {
    renderComponent({ selectedEnvironment: { identifier: 'foo', name: 'foo' } })

    await waitFor(() => {
      expect(screen.getByText('cf.onboarding.selectOrCreateEnvironment')).toBeVisible()
      expect(screen.getByText('cf.onboarding.environmentDescription')).toBeVisible()
      expect(screen.getByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).toBeVisible()
    })
  })

  test('It should create a SERVER SDK Key', async () => {
    const createKey = jest.fn().mockResolvedValue({
      name: 'xxx-xxx-xxx',
      apiKey: 'xxx-test-sdk-key',
      identifier: 'xxx-xxx-xxx',
      type: 'server'
    })
    jest.spyOn(cfServices, 'useAddAPIKey').mockReturnValue({
      mutate: createKey,
      loading: false,
      cancel: jest.fn(),
      error: null
    })

    renderComponent({ selectedEnvironment: { identifier: 'foo', name: 'bar' } })

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'cf.onboarding.selectOrCreateEnvironment' })).toHaveValue('bar')
      expect(screen.getByText('cf.onboarding.environmentDescription')).toBeVisible()
      expect(screen.getByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).toBeVisible()
      expect(createKey).not.toHaveBeenCalled()
      expect(setApiKey).not.toHaveBeenCalled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'cf.environments.apiKeys.addKeyTitle' })).toBeVisible()
      expect(screen.getByText('cf.environments.apiKeys.serverDescription')).toBeVisible()
      expect(screen.getByRole('textbox', { name: 'cf.onboarding.enterKeyName' })).toBeVisible()
    })

    await userEvent.type(screen.getByRole('textbox', { name: 'cf.onboarding.enterKeyName' }), 'foo bar server sdk key')

    await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

    await waitFor(() => {
      expect(createKey).toHaveBeenCalled()
      expect(setApiKey).toHaveBeenCalled()
      // modal should have closed
      expect(screen.queryByRole('heading', { name: 'cf.environments.apiKeys.addKeyTitle' })).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox', { name: 'cf.onboarding.enterKeyName' })).not.toBeInTheDocument()
    })
  })

  test('It should create a CLIENT SDK Key', async () => {
    const createKey = jest.fn().mockResolvedValue({
      name: 'xxx-xxx-xxx',
      apiKey: 'xxx-test-sdk-key',
      identifier: 'xxx-xxx-xxx',
      type: 'client'
    })
    jest.spyOn(cfServices, 'useAddAPIKey').mockReturnValue({
      mutate: createKey,
      loading: false,
      cancel: jest.fn(),
      error: null
    })

    renderComponent({
      selectedEnvironment: { identifier: 'foo', name: 'bar' },
      language: {
        name: 'javascript',
        icon: 'javascripticon',
        type: PlatformEntryType.CLIENT,
        readmeStringId: 'cf.onboarding.readme.javascript'
      }
    })

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'cf.onboarding.selectOrCreateEnvironment' })).toHaveValue('bar')
      expect(screen.getByText('cf.onboarding.environmentDescription')).toBeVisible()
      expect(screen.getByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).toBeVisible()
      expect(createKey).not.toHaveBeenCalled()
      expect(setApiKey).not.toHaveBeenCalled()
    })

    await userEvent.click(screen.getByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'cf.environments.apiKeys.addKeyTitle' })).toBeVisible()
      expect(screen.getByText('cf.environments.apiKeys.clientDescription')).toBeVisible()
      expect(screen.getByRole('textbox', { name: 'cf.onboarding.enterKeyName' })).toBeVisible()
    })

    await userEvent.type(screen.getByRole('textbox', { name: 'cf.onboarding.enterKeyName' }), 'foo bar client sdk key')

    await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

    await waitFor(() => {
      expect(createKey).toHaveBeenCalled()
      expect(setApiKey).toHaveBeenCalled()
      // modal should have closed
      expect(screen.queryByRole('heading', { name: 'cf.environments.apiKeys.addKeyTitle' })).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox', { name: 'cf.onboarding.enterKeyName' })).not.toBeInTheDocument()
    })
  })

  test('It should render correctly when environment selected and SERVER SDK Key created', async () => {
    renderComponent({
      selectedEnvironment: { identifier: 'foo', name: 'foo' },
      apiKey: {
        name: 'xxx-xxx-xxx',
        apiKey: 'xxx-test-sdk-key',
        identifier: 'xxx-xxx-xxx',
        type: 'server'
      }
    })

    await waitFor(() => {
      expect(screen.getByText('cf.onboarding.selectOrCreateEnvironment')).toBeVisible()
      expect(screen.getByText('cf.onboarding.environmentDescription')).toBeVisible()
      expect(screen.queryByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).not.toBeInTheDocument()
      expect(screen.getByText('cf.onboarding.keyDescriptionServer')).toBeVisible()
      expect(screen.getByText('xxx-test-sdk-key')).toBeVisible()
    })
  })

  test('It should render correctly when environment selected and CLIENT SDK Key created', async () => {
    renderComponent({
      language: {
        name: 'javascript',
        icon: 'javascripticon',
        type: PlatformEntryType.CLIENT,
        readmeStringId: 'cf.onboarding.readme.javascript'
      },
      selectedEnvironment: { identifier: 'foo', name: 'foo' },
      apiKey: {
        name: 'xxx-xxx-xxx',
        apiKey: 'xxx-xxx-xxx',
        identifier: 'xxx-xxx-xxx',
        type: 'client'
      }
    })

    await waitFor(() => {
      expect(screen.getByText('cf.onboarding.selectOrCreateEnvironment')).toBeVisible()
      expect(screen.getByText('cf.onboarding.environmentDescription')).toBeVisible()
      expect(screen.queryByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).not.toBeInTheDocument()
      expect(screen.getByText('cf.onboarding.keyDescriptionClient')).toBeVisible()
    })
  })

  test('It should display an error', async () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: false,
        error: {
          status: 'ERROR',
          code: 'INVALID_REQUEST',
          message: 'cf.get.env.list.error',
          correlationId: 'a4145c4a-c498-4e9f-b430-9e924c6b7515',
          detailedMessage: null,
          responseMessages: [
            {
              code: 'INVALID_REQUEST',
              level: 'ERROR',
              message: 'cf.get.env.list.error',
              exception: null,
              failureTypes: []
            }
          ],
          metadata: null
        },
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <input type="text" data-testid="kjTest" />
        },
        environments: [
          {
            accountId: 'dummy',
            identifier: 'foo',
            name: 'bar',
            type: 'Production'
          }
        ]
      })
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('cf.get.env.list.error')).toBeVisible()
    })
  })
})
