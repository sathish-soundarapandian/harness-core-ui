/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { HealthSourceSpec } from 'services/cv'
import type { GCOMonitoringSourceInfo } from '../../GoogleCloudOperationsMonitoringSourceUtils'

export interface MapQueriesToHarnessServiceProps {
  onSubmit: (data: GCOMonitoringSourceInfo) => Promise<void>
  onPrevious: () => void
  data: GCOMonitoringSourceInfo
  isTemplate?: boolean
  expressions?: string[]
}

export type MapGCOLogsQueryToService = {
  metricName: string
  serviceInstance?: string
  messageIdentifier?: string
  query: string
}

export interface GCOLogsQueryDefinition {
  name: string
  query: string
  serviceInstanceIdentifier?: string
  messageIdentifier?: string
}

export type GCOLogsHealthSourceSpec = HealthSourceSpec & {
  connectorRef: string
  feature: string
  queries: GCOLogsQueryDefinition[]
}
export interface GCOLogsHealthSourcePayload {
  name: string
  type: HealthSourceTypes.StackdriverLog
  identifier: string
  spec: GCOLogsHealthSourceSpec
}

export interface InitialFormDataInterface {
  metricName: string
  query: string
  recordCount: number
  serviceInstance: string
  messageIdentifier: string
}
