/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SecondaryEventsResponse } from 'services/cv'
import downTimeIcon from '@cv/assets/downTime.svg'
import annotationsIcon from '@cv/assets/annotations.svg'
import type { UseStringsReturn } from 'framework/strings'
import errorBudgetResetIcon from '@cv/assets/errorBudgetReset.svg'
import dataCollectionFailureIcon from '@cv/assets//dataCollectionFailure.svg'
import { SLO_WIDGETS } from '../TimelineRow/TimelineRow.constants'
import type { TimelineData } from '../TimelineRow/TimelineRow.types'

export function calculateStartAndEndTimes(
  startXPercentage: number,
  endXPercentage: number,
  timestamps?: number[]
): [number, number] | undefined {
  if (!timestamps?.length) return
  const startTime = Math.floor(startXPercentage * (timestamps[timestamps.length - 1] - timestamps[0]) + timestamps[0])
  const endTime = Math.floor(endXPercentage * (timestamps[timestamps.length - 1] - timestamps[0]) + timestamps[0])
  return [startTime, endTime]
}

export function generateSLOWidgetsInfo(
  getString: UseStringsReturn['getString'],
  sloWidgetsData?: SecondaryEventsResponse[]
): TimelineData[] {
  let sloWidgetsInfo: TimelineData[] = []
  if (Array.isArray(sloWidgetsData) && sloWidgetsData.length) {
    sloWidgetsInfo = sloWidgetsData.map(sloWidgetData => {
      const { startTime, endTime, type } = sloWidgetData
      let updatedSLOWidgetsInfo: TimelineData = {
        ...sloWidgetData,
        startTime: Number(startTime) * 1000,
        endTime: Number(endTime) * 1000,
        icon: {
          height: 16,
          width: 16,
          url: ''
        }
      }

      switch (type) {
        case SLO_WIDGETS.DOWNTIME:
          updatedSLOWidgetsInfo = {
            ...updatedSLOWidgetsInfo,
            icon: {
              ...updatedSLOWidgetsInfo?.icon,
              url: downTimeIcon
            }
          }
          break
        case SLO_WIDGETS.ANNOTATION:
          updatedSLOWidgetsInfo = {
            ...updatedSLOWidgetsInfo,
            icon: {
              ...updatedSLOWidgetsInfo?.icon,
              url: annotationsIcon
            }
          }
          break
        case SLO_WIDGETS.ERROR_BUDGET_RESET:
          updatedSLOWidgetsInfo = {
            ...updatedSLOWidgetsInfo,
            icon: {
              ...updatedSLOWidgetsInfo?.icon,
              url: errorBudgetResetIcon
            }
          }
          break
        case SLO_WIDGETS.DATA_COLLECTION_FAILURE:
          updatedSLOWidgetsInfo = {
            ...updatedSLOWidgetsInfo,
            icon: {
              ...updatedSLOWidgetsInfo?.icon,
              url: dataCollectionFailureIcon
            },
            tooltip: {
              ...updatedSLOWidgetsInfo?.tooltip,
              message: getString('cv.slos.dataCollectionFailure'),
              sideBorderColor: ''
            }
          }
          break
      }

      return updatedSLOWidgetsInfo
    })
  }
  return sloWidgetsInfo
}
