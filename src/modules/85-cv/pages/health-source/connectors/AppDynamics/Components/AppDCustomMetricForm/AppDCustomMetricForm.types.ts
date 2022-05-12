/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseString } from 'services/cv'
import type { CustomMappedMetric } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { AppDynamicsFomikFormInterface } from '../../AppDHealthSource.types'

export interface AppDCustomMetricFormInterface {
  mappedMetrics: Map<string, CustomMappedMetric>
  selectedMetric: string
  formikValues: AppDynamicsFomikFormInterface
  formikSetField: (key: string, value: any) => void
  connectorIdentifier: string
  isTemplate?: boolean
}

export interface SetServiceInstanceInterface {
  serviceInsanceData: ResponseString | null
  formikValues: AppDynamicsFomikFormInterface
  formikSetField: (key: string, value: any) => void
}
