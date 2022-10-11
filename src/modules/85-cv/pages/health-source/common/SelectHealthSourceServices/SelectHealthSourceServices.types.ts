/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { useGetMetricPacks, useGetLabelNames } from 'services/cv'

interface HealthSourceServicesFieldNames {
  sli?: string
  serviceHealth?: string
  deploymentVerification?: string
  riskProfileCategory?: string
  higherBaselineDeviation?: string
  lowerBaselineDeviation?: string
}

export type SelectHealthSourceServicesProps = {
  values: {
    sli: boolean
    healthScore?: boolean
    continuousVerification?: boolean
    serviceInstance?: string | SelectOption
    riskCategory?: string
    serviceInstanceMetricPath?: string
  }
  metricPackResponse: ReturnType<typeof useGetMetricPacks>
  labelNamesResponse?: ReturnType<typeof useGetLabelNames>
  hideServiceIdentifier?: boolean
  hideCV?: boolean
  hideSLIAndHealthScore?: boolean
  isTemplate?: boolean
  showOnlySLI?: boolean
  expressions?: string[]
  isConnectorRuntimeOrExpression?: boolean
  key?: string
  customServiceInstanceName?: string
  fieldNames?: Partial<HealthSourceServicesFieldNames>
  riskProfileCategoryName?: string
}
