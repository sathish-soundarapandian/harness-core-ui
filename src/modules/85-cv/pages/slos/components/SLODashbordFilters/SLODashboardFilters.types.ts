/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponsePageMSDropdownResponse, ResponsePageUserJourneyResponse } from 'services/cv'
import type { SLOFilterAction, SLOFilterState } from '../../CVSLOsListingPage.types'

export interface SLOFilterItemsData {
  userJourney: ResponsePageUserJourneyResponse | null
  monitoredServices: ResponsePageMSDropdownResponse | null
}

export interface SLODashbordFiltersProps {
  filterState: SLOFilterState
  dispatch: React.Dispatch<SLOFilterAction>
  filterItemsData: SLOFilterItemsData
  hideMonitoresServicesFilter: boolean
}
