/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type {
  UpdatedHealthSource,
  SourceDataInterface
} from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import type { MetricPackDTO } from 'services/cv'

export interface DynatraceHealthSourceContainerProps {
  data: SourceDataInterface
  onSubmit: (formdata: SourceDataInterface, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
  isTemplate?: boolean
  expressions?: string[]
}

export interface DynatraceHealthSourceProps {
  dynatraceFormData: DynatraceFormDataInterface
  onSubmit: (dynatraceMetricData: DynatraceMetricData) => Promise<void>
  onPrevious: () => void
  connectorIdentifier: string
  isTemplate?: boolean
  expressions?: string[]
}

export interface DynatraceMetricInfo {
  metricName?: string
  identifier?: string
  groupName?: SelectOption
  metricSelector?: string
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  riskCategory?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  isNew?: boolean
  isManualQuery?: boolean
}

export interface DynatraceMetricData {
  connectorRef: string
  isEdit?: boolean
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  selectedService: SelectOption | string
  serviceMethods?: string[]
  metricPacks?: MetricPackDTO[]
  metricData: { [key: string]: boolean }
  customMetrics: Map<string, DynatraceMetricInfo>
  showCustomMetric?: boolean
}

export interface DynatraceFormDataInterface extends DynatraceMetricData, DynatraceMetricInfo {}

export interface InitDynatraceCustomMetricInterface {
  metricSelector: string
  sli: boolean
  healthScore: boolean
  continuousVerification: boolean
  identifier: string
  metricName: string
  isNew: boolean
  groupName: {
    label: string
    value: string
  }
}
