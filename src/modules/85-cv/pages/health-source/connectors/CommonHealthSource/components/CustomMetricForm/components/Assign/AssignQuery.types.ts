/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { useGetRiskCategoryForCustomHealthMetric } from 'services/cv'

export type AssignQueryProps = {
  values: {
    sli: boolean
    healthScore?: boolean
    continuousVerification?: boolean
    serviceInstance?: string | SelectOption
    riskCategory?: string
  }
  hideServiceIdentifier?: boolean
  hideCV?: boolean
  hideSLIAndHealthScore?: boolean
  showOnlySLI?: boolean
  key?: string
  riskProfileResponse?: ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>
  defaultServiceInstance?: string
}
