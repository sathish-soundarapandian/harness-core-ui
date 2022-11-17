/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep } from 'lodash-es'
import { Text } from '@harness/uicore'
import type { Renderer, CellProps } from 'react-table'
import { PeriodTypes, PeriodLengthTypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import type { ServiceLevelObjectiveDetailsDTO, SLODashboardApiFilter, SLOTargetFilterDTO } from 'services/cv'
import type { SLOObjective, SLOV2Form } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { SLOType } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.constants'
import type { GetDistributionUpdatedProps, UpdateWeightPercentageForCurrentSLOProps } from './AddSLOs.types'

const updateWeightPercentageForCurrentSLO = ({
  weight,
  index,
  sloList,
  isReset
}: UpdateWeightPercentageForCurrentSLOProps): void => {
  sloList[index].weightagePercentage = Number(weight)
  sloList[index].isManuallyUpdated = isReset ? false : true
}

const updateWeightPercentageForNonManualSLO = ({
  weight,
  index,
  sloList
}: UpdateWeightPercentageForCurrentSLOProps): void => {
  sloList[index].weightagePercentage = Number(weight)
}

const removeAlreadyCoveredManuallyUpdatedSLO = (manuallyUpdatedSlos: number[], currentIndex: number): number[] =>
  manuallyUpdatedSlos.filter(item => item !== currentIndex)

export const getDistribution = ({
  weight,
  currentIndex,
  sloList,
  manuallyUpdatedSlos,
  isReset
}: GetDistributionUpdatedProps): SLOObjective[] => {
  const clonedArr = [...sloList]
  let cloneManuallyUpdatedSlos = cloneDeep(manuallyUpdatedSlos)
  const length = sloList.length
  let remaining =
    100 -
    weight -
    manuallyUpdatedSlos
      .filter(item => item !== currentIndex)
      .reduce((total, num) => {
        return clonedArr[num]?.weightagePercentage + total
      }, 0)

  if (remaining <= 0) {
    remaining = 0
  }

  const derivedWeight = remaining / (length - (manuallyUpdatedSlos.length || 1))

  for (let idx = 0; idx < sloList.length; idx++) {
    const isSloWeightManuallyUpdated = manuallyUpdatedSlos.includes(idx)
    if (currentIndex === idx) {
      updateWeightPercentageForCurrentSLO({
        weight,
        index: idx,
        sloList,
        isReset
      })
    } else if (currentIndex !== idx && isSloWeightManuallyUpdated) {
      cloneManuallyUpdatedSlos = removeAlreadyCoveredManuallyUpdatedSLO(cloneManuallyUpdatedSlos, currentIndex)
    } else if (currentIndex !== idx && !isSloWeightManuallyUpdated) {
      updateWeightPercentageForNonManualSLO({
        weight: Number(derivedWeight.toFixed(2)),
        index: idx,
        sloList
      })
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

const getManuallyUpdatedSlos = (sloDetailsList: SLOObjective[]) =>
  sloDetailsList
    .map((item, index) => {
      if (item?.isManuallyUpdated) {
        return index
      }
    })
    .filter(item => item !== undefined) as number[]

export const onWeightChange = ({
  weight,
  index,
  serviceLevelObjectivesDetails,
  setServiceLevelObjectivesDetails,
  setCursorIndex,
  isReset
}: {
  weight: number
  index: number
  setCursorIndex: React.Dispatch<React.SetStateAction<number>>
  serviceLevelObjectivesDetails: SLOObjective[]
  setServiceLevelObjectivesDetails: (updatedSLODetails: SLOObjective[]) => void
  isReset?: boolean
}): void => {
  if (weight < 100 && /^\d+(?:\.\d{1,2})?$/.test(weight.toString())) {
    const sloDetailsList = cloneDeep(serviceLevelObjectivesDetails)
    const neweDistInta = getDistribution({
      weight,
      isReset: isReset,
      currentIndex: index,
      sloList: sloDetailsList,
      manuallyUpdatedSlos: getManuallyUpdatedSlos(sloDetailsList)
    })
    setServiceLevelObjectivesDetails(neweDistInta)
  }
  setCursorIndex(index)
}

export const resetSLOWeightage = (
  selectedSlos: SLOObjective[],
  accountId: string,
  orgIdentifier: string,
  projectIdentifier: string
): SLOObjective[] => {
  const selectedSlosLength = selectedSlos.length
  const weight = Number(100 / selectedSlosLength).toFixed(1)
  const lastWeight = Number(100 - Number(weight) * (selectedSlosLength - 1)).toFixed(1)
  const updatedSLOObjective = selectedSlos.map((item, index) => {
    return {
      ...item,
      accountId,
      orgIdentifier,
      projectIdentifier,
      isManuallyUpdated: false,
      weightagePercentage: index === selectedSlosLength - 1 ? Number(lastWeight) : Number(weight)
    }
  })
  return updatedSLOObjective
}
