/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  TimeSeriesSampleDTO,
  CustomHealthRequestDefinition,
  CustomHealthMetricDefinition,
  TimestampInfo
} from 'services/cv'
import type { MapCustomHealthToService } from '../../CustomHealthSource.types'

export interface QueryMappingInterface {
  formValue: MapCustomHealthToService
  onFieldChange: (field: string, value: any) => void
  onValueChange?: (value: any) => void
  connectorIdentifier: string | { value: string }
  onFetchRecordsSuccess: (data: { [key: string]: { [key: string]: any } }) => void
  isQueryExecuted: boolean
  recordsData: TimeSeriesSampleDTO | undefined
  setLoading: (value: boolean) => void
}

export type SampleDataInfo = {
  startTime: TimestampInfo
  requestMethod: CustomHealthRequestDefinition['method']
  queryType: CustomHealthMetricDefinition['queryType']
  query?: string
  endTime: TimestampInfo
  pathURL: string
}
