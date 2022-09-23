/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const PAGE_SIZE_DASHBOARD_WIDGETS = 10

// Note will be removed once the BE removes these query params
export const LIST_USER_JOURNEYS_OFFSET = 0
export const LIST_USER_JOURNEYS_PAGESIZE = 100

export enum SLOActionTypes {
  userJourney = 'userJourney',
  monitoredService = 'monitoredService',
  sliTypes = 'sliTypes',
  targetTypes = 'targetTypes',
  sloRiskFilterAction = 'SLORiskFilter',
  reset = 'reset',
  resetFiltersInMonitoredServicePage = 'resetFiltersInMonitoredServicePage'
}
