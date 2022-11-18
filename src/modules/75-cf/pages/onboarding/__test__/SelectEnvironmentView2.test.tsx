/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getAllByText, render, RenderResult, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PlatformEntryType } from '@cf/components/LanguageSelection/LanguageSelection'
import mockImport from 'framework/utils/mockImport'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import { SelectEnvironmentView, SelectEnvironmentViewProps } from '../views/SelectEnvironmentView'

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
        setApiKey={jest.fn()}
        setSelectedEnvironment={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )
}

describe('SelectEnvironmentView', () => {
  beforeEach(() => {
    jest.mock('@common/hooks/useTelemetry', () => ({
      useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: jest.fn() })
    }))
    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })
    jest.mock('@cf/hooks/useEnvironmentSelectV2', () => ({
      useEnvironmentSelectV2: jest.fn().mockReturnValue({
        environments: mockEnvironments,
        loading: false,
        error: undefined,
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
        },
        selectedEnvironmentIdentifier: 'foobar'
      })
    }))
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

  test('It should return an error correctly', async () => {
    const error = { message: 'SOME ERROR OCCURS' }
    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({ loading: false, refetch: jest.fn() })
    })

    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        data: undefined,
        loading: undefined,
        error,
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
        }
      })
    })
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: false,
        error: error,
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
    const { container } = renderComponent()
    expect(getAllByText(container, error.message)).toBeDefined()
    expect(document.querySelector('span[data-icon="spinner"]')).toBeVisible()
  })
})
