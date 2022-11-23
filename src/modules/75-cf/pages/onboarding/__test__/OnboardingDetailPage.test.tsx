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
import { TestWrapper } from '@common/utils/testUtils'
import { PlatformEntryType } from '@cf/components/LanguageSelection/LanguageSelection'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import mockImport from 'framework/utils/mockImport'
import * as ffServices from 'services/cf'
import mockFeatureFlags from '@cf/pages/feature-flags/__tests__/mockFeatureFlags'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import { OnboardingDetailPage } from '../OnboardingDetailPage'
import { SelectEnvironmentView } from '../views/SelectEnvironmentView'

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <OnboardingDetailPage />
    </TestWrapper>
  )
}

describe('OnboardingDetailPage', () => {
  const spyGetAllFeatures = jest.spyOn(ffServices, 'useGetAllFeatures')
  const refetchFlags = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    jest.mock('@common/hooks/useTelemetry', () => ({
      useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: jest.fn() })
    }))
  })

  test('OnboardingDetailPage empty state should be rendered properly', () => {
    renderComponent()

    // Progress Stepper
    expect(screen.getByTestId('getStartedProgressStepper')).toBeVisible()

    // Footer buttons
    expect(screen.getByText('next')).toBeVisible()
    expect(screen.getByText('next').closest('button')).toBeDisabled()
    expect(screen.getByText('back')).toBeVisible()
  })

  test('Should be able to create a flag', async () => {
    const pagedResponse = {
      ...mockFeatureFlags,
      features: mockFeatureFlags.features.slice(0, CF_DEFAULT_PAGE_SIZE)
    }
    spyGetAllFeatures.mockReturnValue({
      data: pagedResponse,
      loading: false,
      error: null,
      refetch: refetchFlags
    } as any)

    const createNewFlag = jest.spyOn(ffServices, 'useCreateFeatureFlag')
    const flagName = 'Onboarding Flag 1'

    renderComponent()

    const selectInput = document.querySelector('input[id="selectOrCreateFlag"]') as TargetElement

    // Should be prevented from next tab until flag selected/created
    expect(screen.getByText('next')).toBeVisible()
    expect(screen.getByText('next').closest('button')).toBeDisabled()

    userEvent.click(selectInput)
    userEvent.type(selectInput, flagName, { allAtOnce: true })

    expect(refetchFlags).toBeCalled()

    await waitFor(() => {
      // no options should match this flag name
      expect(document.getElementsByTagName('li')).toHaveLength(0)
      expect(document.querySelector('button[class*="createNewItemButton"]')).toBeVisible()
      expect(document.querySelector('button[class*="createNewItemButton"]')).toHaveTextContent(flagName)
    })

    // Click to create new flag
    userEvent.click(document.querySelector('button[class*="createNewItemButton"]') as TargetElement)

    await waitFor(() => {
      expect(createNewFlag).toBeCalled()
    }).then(() => {
      expect(refetchFlags).toBeCalled()
    })
  })

  test('it should render each step as user progress through Onboarding', async () => {
    const mutateMock = jest.fn().mockResolvedValue({})

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    jest.spyOn(ffServices, 'useAddAPIKey').mockReturnValue({
      cancel: jest.fn(),
      error: null,
      loading: false,
      mutate: mutateMock
    })

    renderComponent()

    const stepCompleted =
      '[class="MultiStepProgressIndicator--dot MultiStepProgressIndicator--dotSuccess MultiStepProgressIndicator--spacing"]'

    const barInProgress =
      '[class="MultiStepProgressIndicator--bar MultiStepProgressIndicator--barSuccess MultiStepProgressIndicator--halfBar"]'

    const barCompleted =
      '[class="MultiStepProgressIndicator--bar MultiStepProgressIndicator--barSuccess MultiStepProgressIndicator--fullBar"]'

    expect(screen.getByRole('heading', { name: 'cf.onboarding.letsGetStarted' })).toBeInTheDocument()

    // first step should be In Progress
    expect(document.querySelector(stepCompleted)).toBeInTheDocument()

    expect(document.querySelector(barInProgress)).toBeInTheDocument()

    userEvent.click(screen.getByRole('textbox'))

    // select a flag
    await waitFor(() => expect(screen.getByText('ABC Flag')).toBeInTheDocument())
    userEvent.click(screen.getByText('ABC Flag'))

    // proceed to next step
    userEvent.click(screen.getByRole('button', { name: 'next' }))

    await waitFor(() => {
      // first step Complete
      expect(document.querySelector(stepCompleted)).toBeInTheDocument()
      expect(document.querySelector(barCompleted)).toBeInTheDocument()

      // second step In Progress
      expect(document.querySelector(barInProgress)).toBeInTheDocument()
    })

    // testing Previous button
    userEvent.click(screen.getByRole('button', { name: 'back' }))

    await waitFor(() => {
      // first step still Complete
      expect(document.querySelector(stepCompleted)).toBeInTheDocument()

      // second step back In Progress, no longer completed
      expect(document.querySelector(barInProgress)).toBeInTheDocument()
      expect(document.querySelector(barCompleted)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'next' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'next' })).not.toBeDisabled()
    })

    userEvent.click(screen.getByRole('button', { name: 'next' }))

    // Second component replaces First component
    await waitFor(() => {
      expect(screen.getByTestId('ffOnboardingSelectedFlag')).toBeVisible()
      expect(screen.getByText('cf.onboarding.selectEnvAndSdk')).toBeVisible()
    })

    // select language and create sdk key
    userEvent.click(screen.getByRole('button', { name: 'JavaScript' }))

    await waitFor(() => {
      expect(screen.getByText('cf.onboarding.selectOrCreateEnvironment')).toBeVisible()
      expect(document.getElementById('selectOrCreateEnvironmentInput')).toBeVisible()
    })
  })

  test('SelectEnvironmentView should render loading correctly', () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({ loading: true, refetch: jest.fn() })
    })

    const { container } = render(
      <TestWrapper>
        <SelectEnvironmentView
          language={{
            name: 'foo',
            icon: 'bar',
            type: PlatformEntryType.CLIENT,
            readmeStringId: 'cf.onboarding.readme.java'
          }}
          apiKey={undefined}
          setApiKey={jest.fn()}
          setSelectedEnvironment={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('SelectEnvironmentView should render data correctly', async () => {
    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        loading: true,
        refetch: jest.fn(),
        EnvironmentSelect: <div />,
        environments: [
          {
            accountId: 'harness',
            identifier: 'foo',
            name: 'bar',
            type: 'Production'
          }
        ]
      })
    })

    const { container } = render(
      <TestWrapper>
        <SelectEnvironmentView
          language={{
            name: 'foo',
            icon: 'bar',
            type: PlatformEntryType.CLIENT,
            readmeStringId: 'cf.onboarding.readme.java'
          }}
          apiKey={undefined}
          setApiKey={jest.fn()}
          setSelectedEnvironment={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
