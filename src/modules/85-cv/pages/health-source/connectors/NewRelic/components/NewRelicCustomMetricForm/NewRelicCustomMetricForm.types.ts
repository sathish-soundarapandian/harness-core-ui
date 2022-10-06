/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CustomMappedMetric } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { InitNewRelicCustomFormInterface } from '../../NewRelicHealthSource.types'

export interface NewRelicCustomFormInterface {
  mappedMetrics: Map<string, CustomMappedMetric>
  selectedMetric: string
  formikValues: InitNewRelicCustomFormInterface
  formikSetField: (key: string, value: any) => void
  connectorIdentifier: string
  isTemplate?: boolean
  expressions?: string[]
}
