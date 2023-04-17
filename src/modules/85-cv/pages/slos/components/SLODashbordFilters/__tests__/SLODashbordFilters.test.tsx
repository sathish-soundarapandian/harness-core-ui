/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { initialState } from '@cv/pages/slos/CVSLOListingPage.utils'
import type { SLOFilterState } from '@cv/pages/slos/CVSLOsListingPage.types'
import SLODashbordFilters from '../SLODashbordFilters'
import { filterItemData } from './SLODashbordFilters.mock'

const WrapperComponent = ({
  initData,
  featureFlagValues,
  hideMonitoresServicesFilter
}: {
  initData: SLOFilterState
  hideMonitoresServicesFilter: boolean
  featureFlagValues?: TestWrapperProps['defaultFeatureFlagValues']
}): JSX.Element => {
  return (
    <TestWrapper defaultFeatureFlagValues={featureFlagValues}>
      <SLODashbordFilters
        filterState={initData}
        dispatch={jest.fn()}
        hideMonitoresServicesFilter={hideMonitoresServicesFilter}
        filterItemsData={filterItemData}
      />
    </TestWrapper>
  )
}
describe('SLODashbordFilters', () => {
  test('should have all the filters', () => {
    render(
      <WrapperComponent
        initData={initialState}
        hideMonitoresServicesFilter={false}
        featureFlagValues={{ SRM_ENABLE_REQUEST_SLO: true }}
      />
    )
    expect(screen.getByTestId(/userJourney-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/monitoredServices-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/sloTargetAndBudget-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/sliType-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/evaluationType-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/filter-reset/)).toBeInTheDocument()
    expect(screen.queryByTestId(/filter-reset-monitored-services/)).not.toBeInTheDocument()
  })
  test('should not have monitored services filter in monitores services page', () => {
    render(<WrapperComponent initData={initialState} hideMonitoresServicesFilter={true} />)
    expect(screen.getByTestId(/userJourney-filter/)).toBeInTheDocument()
    expect(screen.queryByTestId(/monitoredServices-filter/)).not.toBeInTheDocument()
    expect(screen.getByTestId(/sloTargetAndBudget-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/sliType-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/filter-reset-monitored-services/)).toBeInTheDocument()
    expect(screen.queryByTestId(/filter-reset$/)).not.toBeInTheDocument()
  })
})
