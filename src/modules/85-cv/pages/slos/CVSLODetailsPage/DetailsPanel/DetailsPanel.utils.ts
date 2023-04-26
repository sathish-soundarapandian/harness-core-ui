/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import type { SLODashboardWidget } from 'services/cv'
import { SLITypeEnum } from '../../common/SLI/SLI.constants'
import { EvaluationType } from '../../components/CVCreateSLOV2/CVCreateSLOV2.types'

export const getEvaluationTitleAndValue = (
  getString: UseStringsReturn['getString'],
  sloDashboardWidget?: SLODashboardWidget,
  enableRequestSLO?: boolean
): { title: string; value: string } => {
  return {
    title: enableRequestSLO ? getString('cv.slos.evaluationType') : getString('cv.slos.sliType'),
    value: enableRequestSLO
      ? getString(
          sloDashboardWidget?.evaluationType === EvaluationType.WINDOW
            ? 'cv.slos.slis.evaluationType.window'
            : 'common.request'
        )
      : getString(
          sloDashboardWidget?.type === SLITypeEnum.AVAILABILITY
            ? 'cv.slos.slis.type.availability'
            : 'cv.slos.slis.type.latency'
        )
  }
}

export const getDownTimeStartTimeAndEndTime = (
  chartTimeRange?: { startTime: number; endTime: number },
  sloDashboardWidget?: SLODashboardWidget
): { downtimeStartTime: number; downtimeEndTime: number } => {
  const { currentPeriodStartTime = 0, currentPeriodEndTime = 0, sloPerformanceTrend } = sloDashboardWidget ?? {}
  const downtimeStartTime = chartTimeRange?.startTime || sloPerformanceTrend?.at(0)?.timestamp || currentPeriodStartTime
  const downtimeEndTime =
    chartTimeRange?.endTime || sloPerformanceTrend?.[sloPerformanceTrend?.length - 1]?.timestamp || currentPeriodEndTime
  return { downtimeStartTime, downtimeEndTime }
}
