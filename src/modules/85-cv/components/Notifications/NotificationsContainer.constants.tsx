/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  eventStatusOptions,
  eventTypeOptions
} from './components/ConfigureMonitoredServiceAlertConditions/ConfigureMonitoredServiceAlertConditions.constants'

export const defaultOption = { label: '', value: '' }
export const eventStatusDefaultOptions = [eventStatusOptions[0]]
export const eventTypeDefaultOptions = eventTypeOptions
export const GET_NOTIFICATIONS_PAGE_SIZE = 10
