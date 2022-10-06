/* eslint-disable jest/no-commented-out-tests */
/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent, { TargetElement } from '@testing-library/user-event'
import * as cdngServices from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { PlatformEntryType } from '@cf/components/LanguageSelection/LanguageSelection'
import mockImport from 'framework/utils/mockImport'
import { SelectEnvironmentView } from '../views/SelectEnvironmentView'

const setApiKey = jest.fn()
const setEnvironmentIdentifier = jest.fn()

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SelectEnvironmentView
        language={{
          name: 'foo',
          icon: 'bar',
          type: PlatformEntryType.CLIENT,
          readmeStringId: 'cf.onboarding.readme.java'
        }}
        apiKey={{
          name: 'xxx-xxx-xxx',
          apiKey: 'xxx-xxx-xxx',
          identifier: 'xxx-xxx-xxx',
          type: 'server'
        }}
        setApiKey={setApiKey}
        setEnvironmentIdentifier={setEnvironmentIdentifier}
      />
    </TestWrapper>
  )
}

describe('SelectEnvironmentView', () => {
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

  test('It should render elements and data correctly', async () => {
    const createEnv = jest.spyOn(cdngServices, 'useCreateEnvironment')
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
      expect(screen.getByText('cf.onboarding.createEnv')).toBeVisible()
    })

    userEvent.click(screen.getByText('cf.onboarding.createEnv'))

    await waitFor(() => {
      expect(screen.getByText('cf.environments.create.description')).toBeVisible()
      expect(document.getElementsByName('name')[0]).toBeVisible()
    })
    userEvent.click(document.getElementsByName('name')[0])
    userEvent.type(document.getElementsByName('name')[0], 'OnboardingEnv', { allAtOnce: true })
    userEvent.click(document.querySelector('button[type="submit"]') as TargetElement)

    await waitFor(() => {
      expect(createEnv).toBeCalled()
    })
  })
})
