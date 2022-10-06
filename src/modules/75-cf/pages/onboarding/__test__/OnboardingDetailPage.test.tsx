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
import { PlatformEntryType, SupportPlatforms } from '@cf/components/LanguageSelection/LanguageSelection'
import mockImport from 'framework/utils/mockImport'
import * as ffServices from 'services/cf'
import mockFeatureFlags from '@cf/pages/feature-flags/__tests__/mockFeatureFlags'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import { OnboardingDetailPage } from '../OnboardingDetailPage'
import { SetUpYourApplicationView } from '../views/SetUpYourApplicationView'
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
    jest.mock('@common/hooks/useTelemetry', () => ({
      useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: jest.fn() })
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('OnboardingDetailPage empty state should be rendered properly', () => {
    renderComponent()

    // Breadcrumbs
    expect(screen.getByTestId('getStartedBreadcrumb')).toHaveTextContent('cf.shared.getStarted/cf.shared.quickGuide/')
    // First tab should be selected
    expect(screen.getByText('cf.onboarding.oneCreateAFlag')).toBeVisible()
    expect(screen.getByText('cf.onboarding.oneCreateAFlag').parentElement).toHaveAttribute('aria-selected', 'true')

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

  test('SetUpYourApplicationView', () => {
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
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SetUpYourApplicationView
          flagInfo={{
            project: 'dummy',
            createdAt: 1662647079713,
            name: 'test-flag',
            identifier: 'test_flag',
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
          language={SupportPlatforms[1]}
          setLanguage={jest.fn()}
          apiKey={{
            name: 'xxx-xxx-xxx',
            apiKey: 'xxx-xxx-xxx',
            identifier: 'xxx-xxx-xxx',
            type: 'server'
          }}
          setApiKey={jest.fn()}
          setEnvironmentIdentifier={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
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
          setEnvironmentIdentifier={jest.fn()}
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
          setEnvironmentIdentifier={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
