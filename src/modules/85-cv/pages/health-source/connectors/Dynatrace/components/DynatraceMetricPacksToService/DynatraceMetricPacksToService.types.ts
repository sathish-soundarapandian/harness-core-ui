/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikErrors } from 'formik'
import type {
  DynatraceFormDataInterface,
  DynatraceMetricData
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'

export interface DynatraceMetricPacksToServiceProps {
  connectorIdentifier: string
  dynatraceMetricData: DynatraceMetricData
  setDynatraceMetricData: React.Dispatch<React.SetStateAction<DynatraceMetricData>>
  metricValues: DynatraceMetricData
  isTemplate?: boolean
  expressions?: string[]
  metricErrors?: FormikErrors<DynatraceFormDataInterface & { dynatraceService?: string }>
}
