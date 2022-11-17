/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiSelectOption } from '@harness/uicore'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

export type MapQueryToService = {
  metricName: string
  prometheusMetric?: string
  query: string
  isManualQuery?: boolean
  serviceFilter?: MultiSelectOption[]
  envFilter?: MultiSelectOption[]
  additionalFilter?: MultiSelectOption[]
  aggregator?: string
  riskCategory?: string
  serviceInstance?: string
  recordCount?: number
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  groupName?: SelectOption
}
