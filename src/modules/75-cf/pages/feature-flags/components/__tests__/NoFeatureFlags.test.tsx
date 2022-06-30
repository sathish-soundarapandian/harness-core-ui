/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import mockFeatureFlags from '../../__tests__/mockFeatureFlags'
import { NoFeatureFlags, NoFeatureFlagsProps } from '../NoFeatureFlags'

const onClearFilter = jest.fn()
const onClearSearch = jest.fn()

const renderComponent = (props: Partial<NoFeatureFlagsProps>): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <NoFeatureFlags
        hasFeatureFlags={false}
        hasSearchTerm={false}
        hasFlagFilter={false}
        environmentIdentifier="dummy"
        clearFilter={onClearFilter}
        clearSearch={onClearSearch}
        {...props}
      />
    </TestWrapper>
  )

describe('NoFeatureFlags', () => {
  beforeAll(() => {
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, loading: false, refetch: jest.fn() })
    })

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('It should render "No Flags" image, message & New Flag button when the project has no feature flags', async () => {
    renderComponent({ hasFeatureFlags: false, hasFlagFilter: false, hasSearchTerm: false })

    await waitFor(() => {
      expect(screen.getByTestId('nodata-image')).toBeVisible()
      expect(screen.getByText('cf.noFlag')).toBeVisible()
      expect(screen.getByText('cf.featureFlags.newFlag')).toBeVisible()
    })

    userEvent.click(screen.getByText('cf.featureFlags.newFlag'))

    // Check New Flag modal is open
    await waitFor(() => {
      expect(screen.getByText('cf.featureFlags.typeOfFlag')).toBeVisible()
    })
  })

  test('It should render "No Results" image, filter criteria message & Clear Filters button when no existing feature flags match the filter criteria', async () => {
    renderComponent({ hasFeatureFlags: true, hasFlagFilter: true, hasSearchTerm: false })

    await waitFor(() => {
      expect(screen.getByTestId('nodata-image')).toBeVisible()
      expect(screen.getByText('common.filters.noMatchingFilterData')).toBeVisible()
      expect(screen.getByText('cf.featureFlags.changeOrReset')).toBeVisible()
      expect(screen.getByText('cf.featureFlags.resetFilters')).toBeVisible()
    })

    userEvent.click(screen.getByText('cf.featureFlags.resetFilters'))

    await waitFor(() => {
      expect(onClearFilter).toHaveBeenCalled()
    })
  })

  test('It should render "No Results" image, search criteria message & Clear Search button when no existing feature flags match the search criteria', async () => {
    renderComponent({ hasFeatureFlags: true, hasFlagFilter: false, hasSearchTerm: true })

    await waitFor(() => {
      expect(screen.getByTestId('nodata-image')).toBeVisible()
      expect(screen.getByText('cf.noResultMatch')).toBeVisible()
      expect(screen.getByText('cf.featureFlags.clearSearch')).toBeVisible()
    })

    await act(async () => {
      userEvent.click(screen.getByText('cf.featureFlags.clearSearch'))
    })
    expect(onClearSearch).toHaveBeenCalled()
  })

  test('It should render the filter message when both flagFilter and searchTerm are present', async () => {
    renderComponent({ hasFeatureFlags: true, hasFlagFilter: true, hasSearchTerm: true })

    await waitFor(() => {
      expect(screen.getByTestId('nodata-image')).toBeVisible()
      expect(screen.getByText('common.filters.noMatchingFilterData')).toBeVisible()
      expect(screen.getByText('cf.featureFlags.changeOrReset')).toBeVisible()
      expect(screen.getByText('cf.featureFlags.resetFilters')).toBeVisible()
    })

    await act(async () => {
      userEvent.click(screen.getByText('cf.featureFlags.resetFilters'))
    })
    expect(onClearFilter).toHaveBeenCalled()
  })
})
