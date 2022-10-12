/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { ELKHealthSourceSpec, HealthSourceSpec } from 'services/cv'
import type { ElkHealthSourceInfo } from '../../ElkHealthSource.types'

export interface ElkQueryBuilderProps {
  onSubmit: (data: ElkHealthSourceInfo) => Promise<void>
  onPrevious: () => void
  data: ElkHealthSourceInfo
  isTemplate?: boolean
  expressions?: string[]
}

export type MapElkQueryToService = {
  metricName: string
  serviceInstance: string
  timeStampFormat: string
  logIndexes: string
  query: string
  identifyTimestamp: string
  messageIdentifier: string
  isStaleRecord?: boolean
}

export interface ElkQueryDefinition {
  name: string
  query: string
  serviceInstanceIdentifier?: string
  identifier?: string
}
export type ElkHealthSourceSpec = HealthSourceSpec & {
  connectorRef: string
  feature: string
  queries: ElkQueryDefinition[]
}
export interface ElkHealthSourcePayload {
  name: string
  type: HealthSourceTypes.Elk
  identifier: string
  spec: ELKHealthSourceSpec
}

export interface GetElkMappedMetricInterface {
  sourceData: ElkHealthSourceInfo
  isConnectorRuntimeOrExpression?: boolean
  //getString: UseStringsReturn['getString']
}
