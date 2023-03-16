/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const enum SLODowntimeTabs {
  DOWNTIME = 'Downtime',
  HISTORY = 'History'
}

export enum DowntimeStatus {
  SCHEDULED = 'Scheduled',
  ACTIVE = 'Active'
}

export interface QueryParamsProps {
  pageNumber?: number
  filter?: string
  monitoredServiceIdentifier?: string
}

export interface PathParamsProps {
  accountIdentifier: string
  orgIdentifier: string
  projectIdentifier: string
}
