/* eslint-disable jest/no-commented-out-tests */
/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
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
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: false,
        error: undefined,
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
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
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('It should render loading correctly', () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({ loading: true, refetch: jest.fn() })
    })
    renderComponent()

    expect(document.querySelector('span[data-icon="spinner"]')).toBeVisible()
  })

  test('It should render elements and data correctly when no environment selected', async () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: false,
        error: undefined,
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
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
      expect(document.querySelector('span[data-icon="spinner"]')).not.toBeInTheDocument()
      expect(screen.getByText('cf.onboarding.selectOrCreateEnvironment')).toBeVisible()
      expect(screen.getByText('cf.onboarding.environmentDescription')).toBeVisible()
      expect(screen.queryByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).not.toBeInTheDocument()
    })
  })

  test('It should open the Create Environment modal', async () => {
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

  test('It should render button to create SDK key when environment selected', async () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: false,
        error: undefined,
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
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

    renderComponent({ selectedEnvironment: { identifier: 'foo', name: 'foo' } })

    await waitFor(() => {
      expect(screen.getByText('cf.onboarding.selectOrCreateEnvironment')).toBeVisible()
      expect(screen.getByText('cf.onboarding.environmentDescription')).toBeVisible()
      expect(screen.getByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).toBeVisible()
    })
  })

  test('It should render correctly when environment selected and SERVER SDK Key created', async () => {
    renderComponent({
      selectedEnvironment: { identifier: 'foo', name: 'foo' },
      apiKey: {
        name: 'xxx-xxx-xxx',
        apiKey: 'xxx-xxx-xxx',
        identifier: 'xxx-xxx-xxx',
        type: 'server'
      }
    })

    await waitFor(() => {
      expect(screen.getByText('cf.onboarding.selectOrCreateEnvironment')).toBeVisible()
      expect(screen.getByText('cf.onboarding.environmentDescription')).toBeVisible()
      expect(screen.queryByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).not.toBeInTheDocument()
      expect(screen.getByText('cf.onboarding.keyDescriptionServer')).toBeVisible()
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
})
