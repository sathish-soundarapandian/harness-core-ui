/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep, defaultTo } from 'lodash-es'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { Renderer, CellProps, Row } from 'react-table'
import type { RadioButtonProps } from '@harness/uicore/dist/components/RadioButton/RadioButton'
import type { SLODashboardApiFilter, SLOError, SLOTargetFilterDTO } from 'services/cv'
import {
  SLOObjective,
  SLOV2Form,
  PeriodTypes,
  PeriodLengthTypes,
  SLOFormulaType
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { getSLORefIdWithOrgAndProject } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.utils'
import { SLOErrorType, SLOType } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.constants'
import CVRadioLabelTextAndDescription from '@cv/components/CVRadioLabelTextAndDescription'
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
  const { name, serviceLevelObjectiveRef, sloError } = row.original
  const colorProp = getColorProp(sloError)
  return (
    <Text {...colorProp} lineClamp={1}>
      {name || serviceLevelObjectiveRef}
    </Text>
  )
}

export const createRequestBodyForSLOHealthListViewV2 = ({ values }: { values: SLOV2Form }): SLODashboardApiFilter => {
  return {
    type: SLOType.SIMPLE,
    sloTargetFilterDTO: {
      ...createSloTargetFilterDTO(values),
      type: values.periodType
    },
    evaluationType: values.evaluationType
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

export const onImpactPercentageChange = ({
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
  setServiceLevelObjectivesDetails: (updatedSLODetails: SLOObjective[]) => void
  isReset?: boolean
}): void => {
  const sloDetailsList = cloneDeep(serviceLevelObjectivesDetails)
  const neweDistInta = sloDetailsList.map((sloDetail, sloIndex) => {
    if (sloIndex === index) {
      sloDetail.weightagePercentage = weight
    }
    return sloDetail
  })
  setServiceLevelObjectivesDetails(neweDistInta)
  setCursorIndex(index)
}

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

export const getIsLastRow = (row: Row<SLOObjective>, serviceLevelObjectivesDetails: SLOObjective[]): boolean => {
  const totalRows = serviceLevelObjectivesDetails.length + 1
  const indexOfCurrentRow = row.index + 1
  return totalRows === indexOfCurrentRow
}

export const getColorProp = (sloError?: SLOError) => {
  const hasDeleteSLO = sloError?.sloErrorType === SLOErrorType.SimpleSLODeletion
  return hasDeleteSLO ? { color: Color.RED_450 } : {}
}

export const getFormulaTypeOptions = () => [
  { label: 'Weighted Average', value: SLOFormulaType.WEIGHTED_AVERAGE },
  { label: 'Least Performance', value: SLOFormulaType.LEAST_PERFORMANCE }
]

export const getSLOFormulaSelectOptions = (): Pick<RadioButtonProps, 'label' | 'value'>[] => {
  return [
    {
      label: (
        <CVRadioLabelTextAndDescription
          label="cv.CompositeSLO.weightedAverage"
          description="cv.CompositeSLO.AddSLOMessage" //"cv.CompositeSLO.weightedAverageSubtext"
        />
      ),
      value: SLOFormulaType.WEIGHTED_AVERAGE
    },
    {
      label: (
        <CVRadioLabelTextAndDescription
          label="cv.CompositeSLO.leastPerformance"
          description="cv.CompositeSLO.leastPerformanceSubText"
        />
      ),
      value: SLOFormulaType.LEAST_PERFORMANCE
    }
  ]
}
