/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Utils, SelectOption } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { UseStringsReturn } from 'framework/strings'
import {
  Days,
  ErrorBudgetInterface,
  PeriodLengthTypes,
  PeriodTypes,
  SLOV2Form
} from '../../components/CVCreateSLOV2/CVCreateSLOV2.types'

export const getPeriodTypeOptions = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { label: getString('cv.slos.sloTargetAndBudget.periodTypeOptions.rolling'), value: PeriodTypes.ROLLING },
    { label: getString('cv.slos.sloTargetAndBudget.periodTypeOptions.calendar'), value: PeriodTypes.CALENDAR }
  ]
}

export const getPeriodLengthOptions = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    {
      label: getString('triggers.schedulePanel.weeklyTabTitle'),
      value: PeriodLengthTypes.WEEKLY
    },
    {
      label: getString('common.monthly'),
      value: PeriodLengthTypes.MONTHLY
    },
    {
      label: getString('cv.quarterly'),
      value: PeriodLengthTypes.QUARTERLY
    }
  ]
}

export const getWindowEndOptionsForWeek = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { label: getString('cv.monday'), value: Days.MONDAY },
    { label: getString('cv.tuesday'), value: Days.TUESDAY },
    { label: getString('cv.wednesday'), value: Days.WEDNESDAY },
    { label: getString('cv.thursday'), value: Days.THURSDAY },
    { label: getString('cv.friday'), value: Days.FRIDAY },
    { label: getString('cv.saturday'), value: Days.SATURDAY },
    { label: getString('cv.sunday'), value: Days.SUNDAY }
  ]
}

export const getPeriodLengthOptionsForRolling = (): SelectOption[] => {
  return Array(31)
    .fill(0)
    .map((_, i) => ({ label: `${i + 1}`, value: `${i + 1}d` }))
}

export const getWindowEndOptionsForMonth = (): SelectOption[] => {
  return Array(31)
    .fill(0)
    .map((_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }))
}

export const getErrorBudget = (values: ErrorBudgetInterface): number => {
  const { periodType, periodLength = '', periodLengthType, SLOTargetPercentage } = values

  if (Number.isNaN(SLOTargetPercentage) || SLOTargetPercentage < 0 || SLOTargetPercentage > 100) {
    return 0
  }

  const minutesPerDay = 60 * 24
  let totalMinutes = 0

  if (periodType === PeriodTypes.ROLLING && Number.parseInt(periodLength)) {
    totalMinutes = Number.parseInt(periodLength) * minutesPerDay
  } else if (periodLengthType === PeriodLengthTypes.WEEKLY) {
    totalMinutes = 7 * minutesPerDay
  } else if (periodLengthType === PeriodLengthTypes.MONTHLY) {
    totalMinutes = 30 * minutesPerDay
  } else if (periodLengthType === PeriodLengthTypes.QUARTERLY) {
    totalMinutes = 90 * minutesPerDay
  }

  return Math.round(((100 - SLOTargetPercentage) / 100) * totalMinutes)
}

export const getCustomOptionsForSLOTargetChart = (
  SLOTargetPercentage: SLOV2Form['SLOTargetPercentage']
): Highcharts.Options => {
  const labelColor = Utils.getRealCSSColor(Color.PRIMARY_7)

  return {
    chart: { height: 200 },
    yAxis: {
      min: 0,
      max: 100,
      tickInterval: 25,
      plotLines: [
        {
          value: Number((Number(SLOTargetPercentage) || 0).toFixed(2)),
          color: Utils.getRealCSSColor(Color.PRIMARY_7),
          width: 2,
          zIndex: 4,
          label: {
            useHTML: true,
            formatter: function () {
              return `
                <div style="background-color:${labelColor};padding:4px 6px;border-radius:4px" >
                  <span style="color:white" >${Number((Number(SLOTargetPercentage) || 0).toFixed(2))}%</span>
                </div>
              `
            }
          }
        }
      ]
    }
  }
}
