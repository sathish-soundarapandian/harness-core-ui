/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export interface CreateDowntimeFormInterface {
  loading: boolean
  error: any
  retryOnError: () => void
  runValidationOnMount?: boolean
  loadingSaveButton: boolean
}

export enum CreateDowntimeSteps {
  DEFINE_DOWNTIME = 'DEFINE_DOWNTIME',
  SELECT_DOWNTIME_WINDOW = 'SELECT_DOWNTIME_WINDOW',
  SELECT_MONITORED_SERVICES = 'SELECT_MONITORED_SERVICES'
}

export enum DowntimeWindowToggleViews {
  ONE_TIME = 'Onetime',
  RECURRING = 'Recurring'
}
