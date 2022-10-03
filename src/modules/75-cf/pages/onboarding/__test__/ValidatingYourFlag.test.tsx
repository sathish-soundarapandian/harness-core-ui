/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { SupportPlatforms } from '@cf/components/LanguageSelection/LanguageSelection'
import mockImport from 'framework/utils/mockImport'
import * as cfService from 'services/cf'
import { ValidateYourFlagView } from '../views/ValidatingYourFlagView'

jest.mock('services/cf', () => ({
  useGetAllFeatures: jest.fn().mockReturnValue({ data: [], loading: false, refetch: jest.fn() }),
  usePatchFeature: jest.fn().mockReturnValue({ mutate: jest.fn(), loading: false })
}))

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

const mockActiveFeature = {
  itemCount: 13,
  pageCount: 1,
  pageIndex: 0,
  pageSize: 15,
  featureCounts: {
    totalActive: 0,
    totalEnabled: 3,
    totalFeatures: 17,
    totalPermanent: 2,
    totalPotentiallyStale: 0,
    totalRecentlyAccessed: 0
  },
  features: [
    {
      archived: false,
      createdAt: 1619219113160,
      defaultOffVariation: 'false',
      defaultOnVariation: 'true',
      envProperties: {
        defaultServe: { variation: 'true' },
        environment: 'Mock_Environment',
        modifiedAt: 1619219291549,
        offVariation: 'false',
        rules: [],
        state: 'off',
        variationMap: null,
        version: 1
      },
      evaluation: '',
      identifier: 'activeFlag',
      kind: 'boolean',
      modifiedAt: 1619219113160,
      name: 'activeFlag',
      owner: ['current auth user?'],
      permanent: false,
      prerequisites: [],
      project: 'tnhucf1',
      results: [],
      status: { lastAccess: Date.now() + 100000, status: 'active' },
      tags: [],
      variations: [
        { identifier: 'true', name: 'True', value: 'true' },
        { identifier: 'false', name: 'False', value: 'false' }
      ]
    }
  ]
}

const mockPastActiveFeature = {
  itemCount: 13,
  pageCount: 1,
  pageIndex: 0,
  pageSize: 15,
  featureCounts: {
    totalActive: 0,
    totalEnabled: 3,
    totalFeatures: 17,
    totalPermanent: 2,
    totalPotentiallyStale: 0,
    totalRecentlyAccessed: 0
  },
  features: [
    {
      archived: false,
      createdAt: 1619219113160,
      defaultOffVariation: 'false',
      defaultOnVariation: 'true',
      envProperties: {
        defaultServe: { variation: 'true' },
        environment: 'Mock_Environment',
        modifiedAt: 1619219291549,
        offVariation: 'false',
        rules: [],
        state: 'off',
        variationMap: null,
        version: 1
      },
      evaluation: '',
      identifier: 'pastActiveFlag',
      kind: 'boolean',
      modifiedAt: 1619219113160,
      name: 'pastActiveFlag',
      owner: ['current auth user?'],
      permanent: false,
      prerequisites: [],
      project: 'tnhucf1',
      results: [],
      status: { lastAccess: 1619219291549, status: 'active' },
      tags: [],
      variations: [
        { identifier: 'true', name: 'True', value: 'true' },
        { identifier: 'false', name: 'False', value: 'false' }
      ]
    }
  ]
}

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <ValidateYourFlagView
        flagInfo={
          {
            project: 'dummy',
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
          } as any
        }
        language={SupportPlatforms[1]}
        apiKey={{
          name: 'xxx-xxx-xxx',
          apiKey: 'xxx-xxx-xxx',
          identifier: 'xxx-xxx-xxx',
          type: 'server'
        }}
        environmentIdentifier="foo-123-bar"
        testDone={false}
        setTestDone={jest.fn()}
      />
    </TestWrapper>
  )

describe('ValidatingYourFlag', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })
  test('Should be able to toggle Flag ON and it loads', async () => {
    renderComponent()

    const flagToggle = screen.getByTestId('flagToggle')

    expect(flagToggle).toBeInTheDocument()
    expect(flagToggle).not.toBeChecked()

    userEvent.click(flagToggle)

    await waitFor(() => {
      expect(screen.getByTestId('fetchingContainer')).toBeVisible()
      expect(flagToggle).toBeChecked()
    })
  })

  test('Should return error state if flag is not active', async () => {
    renderComponent()

    const flagToggle = screen.getByTestId('flagToggle')

    expect(flagToggle).toBeInTheDocument()
    expect(flagToggle).not.toBeChecked()

    userEvent.click(flagToggle)
    jest.runAllTimers()

    await waitFor(() => {
      expect(flagToggle).toBeChecked()
      expect(screen.getByText('cf.onboarding.toggleError')).toBeVisible()
      expect(screen.getByTestId('status-error')).toBeVisible()
      expect(screen.getByTestId('error-info')).toBeVisible()
    })
  })

  test('Should return success state if flag is active within timeframe', async () => {
    jest.spyOn(cfService, 'useGetAllFeatures').mockReturnValue({
      data: mockActiveFeature,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    renderComponent()
    const flagToggle = screen.getByTestId('flagToggle')

    expect(flagToggle).toBeInTheDocument()
    expect(flagToggle).not.toBeChecked()

    userEvent.click(flagToggle)
    jest.runAllTimers()

    await waitFor(() => {
      expect(flagToggle).toBeChecked()
      expect(screen.getByText('cf.onboarding.eventWeReceived' + ':')).toBeVisible()
      expect(screen.getByTestId('status-success')).toBeVisible()
      expect(screen.getByTestId('success-info')).toBeVisible()
    })
  })

  test('Should return error state if flag is not active within timeframe', async () => {
    jest.spyOn(cfService, 'useGetAllFeatures').mockReturnValue({
      data: mockPastActiveFeature,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)
    renderComponent()

    const flagToggle = screen.getByTestId('flagToggle')

    expect(flagToggle).toBeInTheDocument()
    expect(flagToggle).not.toBeChecked()

    userEvent.click(flagToggle)
    jest.runAllTimers()

    await waitFor(() => {
      expect(flagToggle).toBeChecked()
      expect(screen.getByText('cf.onboarding.toggleError')).toBeVisible()
      expect(screen.getByTestId('status-error')).toBeVisible()
      expect(screen.getByTestId('error-info')).toBeVisible()
    })
  })

  test('Should be able to toggle the flag to try again after an error state', async () => {
    renderComponent()

    const flagToggle = screen.getByTestId('flagToggle')

    expect(flagToggle).toBeInTheDocument()
    expect(flagToggle).not.toBeChecked()

    userEvent.click(flagToggle)
    jest.runAllTimers()

    await waitFor(() => {
      expect(flagToggle).toBeChecked()
      expect(screen.getByText('cf.onboarding.toggleError')).toBeVisible()
      expect(screen.getByTestId('status-error')).toBeVisible()
      expect(screen.getByTestId('error-info')).toBeVisible()
    })

    //Toggle OFF
    userEvent.click(flagToggle)
    //TOGGLE ON again
    userEvent.click(flagToggle)

    await waitFor(() => {
      expect(screen.getByTestId('fetchingContainer')).toBeVisible()
      expect(flagToggle).toBeChecked()
    })
  })

  test('Should be able to toggle the flag to try again after success state', async () => {
    jest.spyOn(cfService, 'useGetAllFeatures').mockReturnValue({
      data: mockActiveFeature,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    renderComponent()

    const flagToggle = screen.getByTestId('flagToggle')

    expect(flagToggle).toBeInTheDocument()
    expect(flagToggle).not.toBeChecked()

    userEvent.click(flagToggle)
    jest.runAllTimers()

    await waitFor(() => {
      expect(flagToggle).toBeChecked()
      expect(screen.getByText('cf.onboarding.eventWeReceived' + ':')).toBeVisible()
      expect(screen.getByTestId('status-success')).toBeVisible()
      expect(screen.getByTestId('success-info')).toBeVisible()
    })

    //Toggle OFF
    userEvent.click(flagToggle)
    //TOGGLE ON again
    userEvent.click(flagToggle)

    await waitFor(() => {
      expect(screen.getByTestId('fetchingContainer')).toBeInTheDocument()
      expect(flagToggle).toBeChecked()
    })
  })
})
