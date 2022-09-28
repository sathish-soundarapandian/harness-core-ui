/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RenderResult, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfService from 'services/cf'
import ConfigurePath from '../ConfigurePath'

const mockFeature = {
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

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <ConfigurePath />
    </TestWrapper>
  )

describe('ConfigurePath', () => {
  test('it should display the page spinner when loading', () => {
    jest.spyOn(cfService, 'useGetAllFeatures').mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: jest.fn()
    } as any)

    renderComponent()

    expect(screen.getByText('Loading, please wait...')).toBeVisible()
  })

  test('it should render Onboarding page when the Project has no Flags', async () => {
    jest.spyOn(cfService, 'useGetAllFeatures').mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    renderComponent()

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/account/dummy/cf/orgs/dummy/projects/dummy/onboarding')
    )
  })

  test('it should render the Feature Flags page when the Project has existing flags', async () => {
    jest.spyOn(cfService, 'useGetAllFeatures').mockReturnValue({
      data: mockFeature,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    renderComponent()

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags'
      )
    )
  })

  test('it should display the error message and try to refetch if an error occurs', async () => {
    const message = 'Error Message'
    const refetchMock = jest.fn()

    jest.spyOn(cfService, 'useGetAllFeatures').mockReturnValue({
      data: null,
      loading: false,
      error: { message },
      refetch: refetchMock
    } as any)

    renderComponent()

    expect(screen.getByText(message)).toBeVisible()
    expect(refetchMock).not.toHaveBeenCalled()

    userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => expect(refetchMock).toHaveBeenCalled())
  })
})
