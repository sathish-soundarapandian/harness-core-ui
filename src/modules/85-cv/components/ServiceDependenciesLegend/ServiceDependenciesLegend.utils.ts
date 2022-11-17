/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import type { StringsMap } from 'stringTypes'
import { RiskValues, getRiskColorValue, getRiskLabelStringId } from '@cv/utils/CommonUtils'

export const getServicesStates = (): { labelId: keyof StringsMap; color: string }[] => {
  return [
    {
      labelId: getRiskLabelStringId(RiskValues.UNHEALTHY),
      color: getRiskColorValue(RiskValues.UNHEALTHY)
    },
    {
      labelId: getRiskLabelStringId(RiskValues.NEED_ATTENTION),
      color: getRiskColorValue(RiskValues.NEED_ATTENTION)
    },
    {
      labelId: getRiskLabelStringId(RiskValues.OBSERVE),
      color: getRiskColorValue(RiskValues.OBSERVE)
    },
    {
      labelId: getRiskLabelStringId(RiskValues.HEALTHY),
      color: getRiskColorValue(RiskValues.HEALTHY)
    },
    {
      labelId: 'na',
      color: getRiskColorValue(RiskValues.NO_DATA)
    }
  ]
}

export const getServicesTypes = (): { labelId: keyof StringsMap; icon: IconName; size: number }[] => {
  return [
    {
      labelId: 'cv.changeSource.HarnessCDCurrentGen.applicationId',
      icon: 'dependency-default-icon',
      size: 10
    },
    {
      labelId: 'infrastructureText',
      icon: 'infrastructure',
      size: 14
    }
  ]
}
