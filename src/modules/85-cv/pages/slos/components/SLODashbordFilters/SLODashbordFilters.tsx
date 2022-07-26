/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { Button, ButtonVariation, Layout, Select } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { SLODashbordFiltersProps } from './SLODashboardFilters.types'
import {
  getIsClearFilterDisabled,
  getIsMonitoresServicePageClearFilterDisabled,
  getMonitoredServicesOptionsForFilter,
  getPeriodTypeOptionsForFilter,
  getSliTypeOptionsForFilter,
  getUserJourneyOptionsForFilter,
  SLODashboardFilterActions
} from '../../CVSLOListingPage.utils'
import css from '../../CVSLOsListingPage.module.scss'

const SLODashbordFilters: React.FC<SLODashbordFiltersProps> = ({
  filterState,
  dispatch,
  filterItemsData,
  hideMonitoresServicesFilter
}) => {
  const { getString } = useStrings()

  const resetFilters = useCallback(() => {
    dispatch(SLODashboardFilterActions.resetFilters())
  }, [])

  const resetFiltersInMonitoredServicePage = useCallback(() => {
    dispatch(SLODashboardFilterActions.resetFiltersInMonitoredServicePageAction())
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hideResetFilterButton = useMemo(() => getIsClearFilterDisabled(filterState, getString), [filterState])

  const hideMonitoredServiceResetButton = useMemo(
    () => getIsMonitoresServicePageClearFilterDisabled(filterState, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterState]
  )

  const { updateUserJourney, updateMonitoredServices, updateTargetType, updateSliType } = SLODashboardFilterActions

  return (
    <Layout.Horizontal className={css.sloFilters}>
      <Layout.Vertical width="240px" margin={{ right: 'small' }} data-testid="userJourney-filter">
        <Select
          value={{
            label: `${getString('cv.slos.userJourney')}: ${defaultTo(
              filterState?.userJourney?.label,
              getString('all')
            )}`,
            value: defaultTo(filterState?.userJourney?.value, getString('all'))
          }}
          items={getUserJourneyOptionsForFilter(filterItemsData?.userJourney?.data?.content, getString)}
          onChange={item => {
            dispatch(updateUserJourney({ userJourney: item }))
          }}
        />
      </Layout.Vertical>
      {!hideMonitoresServicesFilter && (
        <Layout.Vertical width="240px" margin={{ right: 'small' }} data-testid="monitoredServices-filter">
          <Select
            value={{
              label: `${getString('cv.monitoredServices.title')}: ${defaultTo(
                filterState?.monitoredService?.label,
                getString('all')
              )}`,
              value: defaultTo(filterState?.monitoredService?.value, getString('all'))
            }}
            items={getMonitoredServicesOptionsForFilter(filterItemsData?.monitoredServices, getString)}
            onChange={item => {
              dispatch(updateMonitoredServices({ monitoredService: item }))
            }}
          />
        </Layout.Vertical>
      )}
      <Layout.Vertical width="240px" margin={{ right: 'small' }} data-testid="sloTargetAndBudget-filter">
        <Select
          value={{
            label: `${getString('cv.slos.sloTargetAndBudget.periodType')}: ${defaultTo(
              filterState?.targetTypes?.label,
              getString('all')
            )}`,
            value: defaultTo(filterState?.targetTypes?.value, getString('all'))
          }}
          items={getPeriodTypeOptionsForFilter(getString)}
          onChange={item => {
            dispatch(updateTargetType({ targetTypes: item }))
          }}
        />
      </Layout.Vertical>
      <Layout.Vertical width="240px" margin={{ right: 'small' }} data-testid="sliType-filter">
        <Select
          value={{
            label: `${getString('cv.slos.sliType')}: ${defaultTo(filterState?.sliTypes?.label, getString('all'))}`,
            value: defaultTo(filterState?.sliTypes?.value, getString('all'))
          }}
          items={getSliTypeOptionsForFilter(getString)}
          onChange={item => {
            dispatch(updateSliType({ sliTypes: item }))
          }}
        />
      </Layout.Vertical>
      {!hideMonitoresServicesFilter && !hideResetFilterButton && (
        <Button
          className={css.clearButton}
          variation={ButtonVariation.LINK}
          onClick={resetFilters}
          data-testid="filter-reset"
        >
          {getString('common.filters.clearFilters')}
        </Button>
      )}
      {hideMonitoresServicesFilter && !hideMonitoredServiceResetButton && (
        <Button
          className={css.clearButton}
          variation={ButtonVariation.LINK}
          onClick={resetFiltersInMonitoredServicePage}
          data-testid="filter-reset-monitored-services"
        >
          {getString('common.filters.clearFilters')}
        </Button>
      )}
    </Layout.Horizontal>
  )
}

export default SLODashbordFilters
