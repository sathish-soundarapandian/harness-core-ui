/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { HealthSourceConfig } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'

export interface CommonCustomMetricFormContainerProps {
  connectorIdentifier: any
  isTemplate?: boolean
  expressions?: string[]
  isConnectorRuntimeOrExpression?: boolean
  healthSourceConfig: HealthSourceConfig
}

export interface RecordProps {
  isRecordsLoading?: boolean
  isQueryRecordsAvailable?: boolean
  sampleRecords: Record<string, any>[]
}
