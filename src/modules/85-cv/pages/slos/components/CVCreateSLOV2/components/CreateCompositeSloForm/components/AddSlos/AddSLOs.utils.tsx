/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import type { Renderer, CellProps } from 'react-table'
import { PeriodTypes, PeriodLengthTypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import type { ServiceLevelObjectiveDetailsDTO, SLODashboardApiFilter, SLOTargetFilterDTO } from 'services/cv'
import type { SLOObjective, SLOV2Form } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { SLOType } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.constants'

export const getDistribution = (
  weight: number,
  currentIndex: number,
  originalList: ServiceLevelObjectiveDetailsDTO[]
): ServiceLevelObjectiveDetailsDTO[] => {
  const clonedArr = [...originalList]
  const length = originalList.length
  const remaining = 100 - Number(weight)
  const newWeight = (remaining / (length - 1)).toFixed(2)

  for (let idx = 0; idx < originalList.length; idx++) {
    if (currentIndex === idx) {
      clonedArr[idx].weightagePercentage = Number(weight)
    } else if (idx === originalList.length - 1) {
      const lastOne = (100 - (weight + Number(newWeight) * (length - 2))).toFixed(2)
      clonedArr[idx].weightagePercentage = Number(lastOne)
    } else {
      clonedArr[idx].weightagePercentage = Number(newWeight)
    }
  }

  return clonedArr
}

export const RenderName: Renderer<CellProps<ServiceLevelObjectiveDetailsDTO>> = ({ row }) => {
  return <Text>{row.original.serviceLevelObjectiveRef}</Text>
}

export const createRequestBodyForSLOHealthListViewV2 = ({ values }: { values: SLOV2Form }): SLODashboardApiFilter => {
  return {
    type: SLOType.SIMPLE,
    sloTargetFilterDTO: {
      ...createSloTargetFilterDTO(values),
      type: values.periodType
    }
  }
}

export const createSloTargetFilterDTO = (values: SLOV2Form): SLOTargetFilterDTO => {
  const { periodType, periodLength } = values
  if (values.periodType === PeriodTypes.ROLLING) {
    return {
      spec: {
        periodLength
      },
      type: periodType
    }
  } else if (values.periodType === PeriodTypes.CALENDAR) {
    const { dayOfMonth, dayOfWeek, periodLengthType } = values
    if (values.periodLengthType === PeriodLengthTypes.MONTHLY) {
      return {
        spec: {
          type: periodLengthType,
          spec: { dayOfMonth }
        }
      }
    } else if (values.periodLengthType === PeriodLengthTypes.WEEKLY) {
      return {
        spec: {
          type: periodLengthType,
          spec: { dayOfWeek }
        }
      }
    } else if (values.periodLengthType === PeriodLengthTypes.QUARTERLY) {
      return {
        spec: {
          type: periodLengthType,
          spec: {}
        }
      }
    }
  }
  return {
    spec: {},
    type: periodType
  }
}

export const onWeightChange = ({
  weight,
  index,
  serviceLevelObjectivesDetails,
  setServiceLevelObjectivesDetails,
  setCursorIndex
}: {
  weight: number
  index: number
  setCursorIndex: React.Dispatch<React.SetStateAction<number>>
  serviceLevelObjectivesDetails: SLOObjective[]
  setServiceLevelObjectivesDetails: React.Dispatch<React.SetStateAction<SLOObjective[]>>
}): void => {
  if (weight < 100) {
    const neweDist = getDistribution(weight, index, serviceLevelObjectivesDetails)
    setServiceLevelObjectivesDetails(neweDist)
  } else {
    const cloneList = [...serviceLevelObjectivesDetails]
    cloneList[index].weightagePercentage = weight
    setServiceLevelObjectivesDetails(cloneList)
  }
  setCursorIndex(index)
}
