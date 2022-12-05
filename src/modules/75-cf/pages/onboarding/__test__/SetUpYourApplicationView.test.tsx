/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent, { TargetElement } from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { SupportPlatforms } from '@cf/components/LanguageSelection/LanguageSelection'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import mockImport from 'framework/utils/mockImport'
import { SetUpYourApplicationView, SetUpYourApplicationViewProps } from '../views/SetUpYourApplicationView'

const setApiKey = jest.fn()
const setLanguage = jest.fn()
const setSelectedEnvironment = jest.fn()

const renderComponent = (props?: Partial<SetUpYourApplicationViewProps>): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SetUpYourApplicationView
        flagInfo={{
          project: 'dummy',
          createdAt: 1662647079713,
          name: 'hello world',
          identifier: 'hello_world',
          kind: 'boolean',
          archived: false,
          variations: [
            { identifier: 'true', name: 'True', value: 'true' },
            { identifier: 'false', name: 'False', value: 'false' }
          ],
          defaultOnVariation: 'true',
          defaultOffVariation: 'false',
          permanent: false
        }}
        language={undefined}
        setLanguage={setLanguage}
        apiKey={{
          name: 'xxx-xxx-xxx',
          apiKey: 'xxx-xxx-xxx',
          identifier: 'xxx-xxx-xxx',
          type: 'server'
        }}
        setApiKey={setApiKey}
        setSelectedEnvironment={setSelectedEnvironment}
        {...props}
      />
    </TestWrapper>
  )
}

describe('SetUpYourApplicationView', () => {
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

  test('It should render correctly when language is undefined', () => {
    renderComponent()

    expect(screen.getByText('cf.onboarding.selectLanguage')).toBeVisible()
    expect(screen.getAllByTestId('selectLanguageBtn')).toHaveLength(14)

    // should not show until environment selected
    expect(screen.queryByText('cf.onboarding.selectOrCreateEnvironment')).not.toBeInTheDocument()
  })

  test('It should set the language when button is clicked', () => {
    renderComponent()

    expect(screen.queryByText('cf.onboarding.selectOrCreateEnvironment')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'JavaScript' })).toBeVisible()

    userEvent.click(screen.getByRole('button', { name: 'JavaScript' }))

    expect(setLanguage).toBeCalled()
  })

  test('It should render correctly when a language has been selected', () => {
    renderComponent({ language: SupportPlatforms[1] })

    expect(screen.getByText('cf.onboarding.selectLanguage')).toBeVisible()
    expect(screen.getAllByTestId('selectLanguageBtn')).toHaveLength(14)

    expect(screen.getByText('cf.onboarding.selectOrCreateEnvironment')).toBeVisible()
    expect(document.querySelector('input[name="environmentSelectEl"]')).toBeVisible()
    expect(document.querySelector('input[name="environmentSelectEl"]')).toHaveValue('')

    // Should not be able to create SDK key until environment selected or created
    expect(screen.queryByRole('button', { name: 'cf.environments.apiKeys.addKeyTitle' })).not.toBeInTheDocument()
  })

  test('It should select an environment', () => {
    renderComponent({ language: SupportPlatforms[1], selectedEnvironment: undefined })

    expect(screen.queryByText('cf.onboarding.selectOrCreateEnvironment')).toBeInTheDocument()

    const envInput = document.querySelector('input[name="environmentSelectEl"]') as TargetElement
    expect(envInput).toBeVisible()
    expect(envInput).toHaveValue('')

    userEvent.click(envInput)

    const dropdownOptions = document.querySelectorAll('li[class*="Select--menuItem"]')
    expect(dropdownOptions).toHaveLength(16)

    userEvent.click(dropdownOptions[1])
    expect(setSelectedEnvironment).toBeCalledWith({
      accountId: 'zEaak-FLS425IEO7OLzMUg',
      color: '#0063F7',
      deleted: false,
      description: 'Harness QB environment',
      identifier: 'QB',
      name: 'QB',
      orgIdentifier: 'Harness',
      projectIdentifier: 'TNHUFF_PROJECT',
      tags: {
        dev: 'dev',
        fun: 'fun',
        'no-restricted': 'no-restricted',
        'not-production': 'not-production',
        qb: 'qb',
        testing: 'testing'
      },
      type: 'PreProduction',
      version: 0
    })
    expect(document.querySelector('input[name="environmentSelectEl"]')).toHaveValue('QB')
  })

  test('It should render the readme when environment, language & api key are set', () => {
    const javaLang = SupportPlatforms.find(lang => lang.name === 'Java') as any
    renderComponent({ language: javaLang, selectedEnvironment: { identifier: 'foobar' } })

    expect(screen.getByText('cf.onboarding.setUpYourCode')).toBeVisible()
  })
})
