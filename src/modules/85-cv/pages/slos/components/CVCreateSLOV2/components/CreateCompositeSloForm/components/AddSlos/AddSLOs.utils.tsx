/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep, defaultTo } from 'lodash-es'
import { Text } from '@harness/uicore'
import type { Renderer, CellProps } from 'react-table'
import type { SLODashboardApiFilter, SLOTargetFilterDTO } from 'services/cv'
import {
  SLOObjective,
  SLOV2Form,
  PeriodTypes,
  PeriodLengthTypes
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { getSLORefIdWithOrgAndProject } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.utils'
import { SLOType } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.constants'
import type {
  GetDistributionUpdatedProps,
  ResetOnDeleteProps,
  UpdateWeightPercentageForCurrentSLOProps
} from './AddSLOs.types'

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

export const getDistribution = ({
  weight,
  currentIndex,
  sloList,
  manuallyUpdatedSlos,
  isReset
}: GetDistributionUpdatedProps): SLOObjective[] => {
  const updatedSLOList = [...sloList]
  const length = sloList.length
  const totalWeightOfManuallyUpdatedSlos = manuallyUpdatedSlos
    .filter(item => item !== currentIndex)
    .reduce((total, num) => {
      return updatedSLOList[num]?.weightagePercentage + total
    }, 0)
  let remaining = 100 - weight - totalWeightOfManuallyUpdatedSlos

  if (remaining <= 0) {
    remaining = 0
  }

  const derivedWeight = remaining / (length - (manuallyUpdatedSlos.length || 1))

  // update currentSLO and already covered slos
  for (let sloIndex = 0; sloIndex < sloList.length; sloIndex++) {
    if (currentIndex === sloIndex) {
      updateWeightPercentageForCurrentSLO({
        weight,
        index: sloIndex,
        sloList: updatedSLOList,
        isReset
      })
    }
  }

  updateNonManuallyUpdatedSlos(updatedSLOList, sloList, derivedWeight)

  return updatedSLOList
}

export const RenderName: Renderer<CellProps<SLOObjective>> = ({ row }) => {
  return <Text>{row.original.name || row.original.serviceLevelObjectiveRef}</Text>
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
  projectIdentifier: string,
  isAccountLevel?: boolean,
  max = 100
): SLOObjective[] => {
  const selectedSlosLength = selectedSlos.length
  const weight = Number(max / selectedSlosLength).toFixed(1)
  const lastWeight = Number(max - Number(weight) * (selectedSlosLength - 1)).toFixed(1)
  const updatedSLOObjective = selectedSlos.map((item, index) => {
    const orgAndProjectIdentifiers = {
      orgIdentifier: isAccountLevel ? defaultTo(item?.projectParams?.orgIdentifier, '') : orgIdentifier,
      projectIdentifier: isAccountLevel ? defaultTo(item?.projectParams?.projectIdentifier, '') : projectIdentifier
    }
    return {
      ...item,
      accountId,
      ...orgAndProjectIdentifiers,
      isManuallyUpdated: false,
      weightagePercentage: index === selectedSlosLength - 1 ? Number(lastWeight) : Number(weight)
    }
  })
  return updatedSLOObjective
}

export const resetOnDelete = ({
  serviceLevelObjectivesDetails,
  serviceLevelObjectiveRef,
  accountId,
  orgIdentifier,
  projectIdentifier,
  isAccountLevel
}: ResetOnDeleteProps): SLOObjective[] => {
  const filterServiceLevelObjective = isAccountLevel
    ? serviceLevelObjectivesDetails?.filter(item => getSLORefIdWithOrgAndProject(item) !== serviceLevelObjectiveRef)
    : serviceLevelObjectivesDetails?.filter(item => item.serviceLevelObjectiveRef !== serviceLevelObjectiveRef)
  const nonManuallyUpdatdWeightsSlo = filterServiceLevelObjective?.filter(item => !item.isManuallyUpdated) || []
  const manuallyUpdatdWeightsSlo = filterServiceLevelObjective?.filter(item => item.isManuallyUpdated) || []
  const sumofMauallyUpdatedSLO = manuallyUpdatdWeightsSlo?.reduce((total, num) => {
    return num?.weightagePercentage + total
  }, 0)
  const remainingWeight = 100 - (sumofMauallyUpdatedSLO || 0)
  const updatedWeightDistributionForNonManuallyUpdated = resetSLOWeightage(
    nonManuallyUpdatdWeightsSlo,
    accountId,
    orgIdentifier,
    projectIdentifier,
    isAccountLevel,
    remainingWeight
  )
  return [...manuallyUpdatdWeightsSlo, ...updatedWeightDistributionForNonManuallyUpdated]
}
const updateNonManuallyUpdatedSlos = (
  updatedSLOList: SLOObjective[],
  sloList: SLOObjective[],
  derivedWeight: number
): void => {
  const manuallyUpdatedSlos = (updatedSLOList || [])
    .map((item, index) => {
      if (!item?.isManuallyUpdated) {
        return { index, id: getSLORefIdWithOrgAndProject(item) }
      }
    })
    .filter(item => item !== undefined)

  const sloIdentifierList = sloList.map(item => getSLORefIdWithOrgAndProject(item))

  for (let sloIndex = 0; sloIndex < manuallyUpdatedSlos.length; sloIndex++) {
    const isLast = sloIndex === manuallyUpdatedSlos.length - 1

    let updatedWeight = Number(derivedWeight.toFixed(2))
    if (isLast) {
      const totalWeightExcludingLastSLO = sloList.reduce((acc, sloDetail, index, array) => {
        const sloWeight = index === array.length - 1 ? 0 : sloDetail.weightagePercentage
        return (acc = acc + sloWeight)
      }, 0)
      updatedWeight = Number((100 - totalWeightExcludingLastSLO).toFixed(2))
    }

    updateWeightPercentageForNonManualSLO({
      weight: updatedWeight,
      index: sloIdentifierList.indexOf(manuallyUpdatedSlos[sloIndex]?.id || '') || 0,
      sloList: updatedSLOList
    })
  }
}
