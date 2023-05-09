/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import type { Renderer, CellProps, Column } from 'react-table'
import type { FormikProps } from 'formik'
import { defaultTo, isEmpty, isEqual, isUndefined } from 'lodash-es'
import type { SLOConsumptionBreakdown, SLOTargetFilterDTO, ServiceLevelIndicatorDTO } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import {
  PeriodLengthTypes,
  PeriodTypes,
  SLOFormulaType,
  SLOObjective,
  SLOV2Form,
  SLOV2FormFields
} from '../../CVCreateSLOV2.types'
import { createSloTargetFilterDTO, getColorProp } from './components/AddSlos/AddSLOs.utils'
import {
  MinNumberOfSLO,
  MaxNumberOfSLO,
  SLOWeight,
  WarningModalType,
  ImpactPercentage
} from './CreateCompositeSloForm.constant'
import { CompositeSLOFormFields, CreateCompositeSLOSteps } from './CreateCompositeSloForm.types'
import type { UseCreateCompositeSloWarningModalProps } from './useCreateCompositeSloWarningModal'
import { SLOErrorType } from '../../CVCreateSLOV2.constants'

const addSLOError = (formikProps: FormikProps<SLOV2Form>, getString?: UseStringsReturn['getString']) => {
  let errorList: string[] = []
  const { serviceLevelObjectivesDetails, sloFormulaType } = formikProps.values
  const isFormulaWeightedAverage = sloFormulaType === SLOFormulaType.WEIGHTED_AVERAGE

  const sumOfSLOweight = serviceLevelObjectivesDetails?.reduce((total, num) => {
    return num.weightagePercentage + total
  }, 0)
  const hasDeletedSLO = serviceLevelObjectivesDetails?.some(
    slo => slo?.sloError?.sloErrorType === SLOErrorType.SimpleSLODeletion
  )
  if (!serviceLevelObjectivesDetails?.length) {
    errorList = [getString?.('cv.CompositeSLO.AddSLOValidation.minMaxSLOCount') as string]
    return { status: false, errorMessages: errorList }
  } else if (defaultTo(sumOfSLOweight, 0) !== 100 && isFormulaWeightedAverage) {
    errorList = [getString?.('cv.CompositeSLO.AddSLOValidation.totalSLOWeight') as string]
    return { status: false, errorMessages: errorList }
  } else if (serviceLevelObjectivesDetails?.length < MinNumberOfSLO) {
    errorList = [getString?.('cv.CompositeSLO.AddSLOValidation.minSLOCount') as string]
    return { status: false, errorMessages: errorList }
  } else if (serviceLevelObjectivesDetails?.length > MaxNumberOfSLO) {
    errorList = [getString?.('cv.CompositeSLO.AddSLOValidation.maxSLOCount') as string]
    return { status: false, errorMessages: errorList }
  } else if (hasDeletedSLO) {
    const sloName = serviceLevelObjectivesDetails
      ?.filter(slo => slo?.sloError?.sloErrorType === SLOErrorType.SimpleSLODeletion)
      .map(slo => slo.sloIdentifier)
      .join(', ')
    const errorMessage = getString?.('cv.slos.simpleSLODeletion', { sloName })
    errorList = [errorMessage as string]
    return { status: false, errorMessages: errorList }
  } else {
    const hasInValidValue = serviceLevelObjectivesDetails.some(slo => {
      if (isFormulaWeightedAverage) {
        return slo.weightagePercentage > SLOWeight.MAX || slo.weightagePercentage < SLOWeight.MIN
      } else {
        return slo.weightagePercentage > ImpactPercentage.MAX || slo.weightagePercentage < ImpactPercentage.MIN
      }
    })
    errorList = hasInValidValue ? [getString?.('cv.CompositeSLO.AddSLOValidation.weightMinMax') as string] : []
    return { status: !hasInValidValue, errorMessages: errorList }
  }
}

export const validateDefineSLOSection = (formikProps: FormikProps<SLOV2Form>): boolean => {
  formikProps.setFieldTouched(CompositeSLOFormFields.NAME, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.IDENTIFIER, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.USER_JOURNEY_REF, true)

  const isNameValid = /^[0-9a-zA-Z-_\s]+$/.test(formikProps.values['name'])
  const { name, identifier, userJourneyRef } = formikProps.values
  if (!name || !identifier || isEmpty(userJourneyRef) || !isNameValid) {
    return false
  }
  return true
}

export const validateSetSLOTimeWindow = (formikProps: FormikProps<SLOV2Form>, enableRequestSLO?: boolean): boolean => {
  formikProps.setFieldTouched(CompositeSLOFormFields.PERIOD_LENGTH, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.PERIOD_TYPE, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.PERIOD_LENGTH_TYPE, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.DAY_OF_MONTH, true)
  formikProps.setFieldTouched(CompositeSLOFormFields.DAY_OF_WEEK, true)

  if (enableRequestSLO) {
    formikProps.setFieldTouched(SLOV2FormFields.EVALUATION_TYPE, true)
  }
  const { periodType, periodLength, periodLengthType, dayOfMonth, dayOfWeek, evaluationType } = formikProps.values

  if (enableRequestSLO && isUndefined(evaluationType)) {
    return false
  }

  if (periodType === PeriodTypes.ROLLING) {
    return Boolean(periodLength)
  }
  if (periodType === PeriodTypes.CALENDAR) {
    if (periodLengthType === PeriodLengthTypes.MONTHLY) {
      return Boolean(periodLengthType) && Boolean(dayOfMonth)
    }
    if (periodLengthType === PeriodLengthTypes.WEEKLY) {
      return Boolean(periodLengthType) && Boolean(dayOfWeek)
    }
    if (periodLengthType === PeriodLengthTypes.QUARTERLY) {
      return Boolean(periodLengthType)
    }
  }
  return false
}

export const validateAddSLO = (formikProps: FormikProps<SLOV2Form>): boolean => {
  const { status } = addSLOError(formikProps)
  return status
}

export const validateSetSLOTarget = (formikProps: FormikProps<SLOV2Form>): boolean => {
  formikProps.setFieldTouched(CompositeSLOFormFields.SLO_TARGET_PERCENTAGE, true)
  const { SLOTargetPercentage } = formikProps.values
  const shouldBeGreaterThanZero = SLOTargetPercentage > 0
  const shouldBeLessThanHundred = SLOTargetPercentage < 100
  if (SLOTargetPercentage && !isNaN(SLOTargetPercentage) && shouldBeGreaterThanZero && shouldBeLessThanHundred) {
    return true
  }
  return false
}

export const validateErrorBudgetPolicy = (): boolean => {
  return true
}

export const isFormDataValid = (
  formikProps: FormikProps<SLOV2Form>,
  selectedTabId: CreateCompositeSLOSteps,
  enableRequestSLO?: boolean
): boolean => {
  switch (selectedTabId) {
    case CreateCompositeSLOSteps.Define_SLO_Identification:
      return validateDefineSLOSection(formikProps)
    case CreateCompositeSLOSteps.Set_SLO_Time_Window:
      return validateSetSLOTimeWindow(formikProps, enableRequestSLO)
    case CreateCompositeSLOSteps.Add_SLOs:
      return validateAddSLO(formikProps)
    case CreateCompositeSLOSteps.Set_SLO_Target:
      return validateSetSLOTarget(formikProps)
    case CreateCompositeSLOSteps.Error_Budget_Policy:
      return validateErrorBudgetPolicy()
    default:
      return false
  }
}

const errorDefineSLOSection = (errors: FormikProps<SLOV2Form>['errors']) => {
  const { name, identifier, userJourneyRef } = errors
  return [name, identifier, userJourneyRef as string].filter(item => Boolean(item)) as string[]
}

const errorSetSLOTimeWindow = (errors: FormikProps<SLOV2Form>['errors']) => {
  const { periodLength, periodLengthType, periodType } = errors
  return [periodLength, periodLengthType, periodType].filter(item => Boolean(item)) as string[]
}

const errorAddSLO = (formikProps: FormikProps<SLOV2Form>, getString: UseStringsReturn['getString']) => {
  const { errorMessages } = addSLOError(formikProps, getString)
  return errorMessages.filter(item => Boolean(item)) as string[]
}

const errorSetSLOTarget = (errors: FormikProps<SLOV2Form>['errors']) => {
  const { SLOTargetPercentage } = errors
  return [SLOTargetPercentage].filter(item => Boolean(item)) as string[]
}

export const getErrorMessageByTabId = (
  formikProps: FormikProps<SLOV2Form>,
  selectedTabId: CreateCompositeSLOSteps,
  getString: UseStringsReturn['getString']
): string[] => {
  switch (selectedTabId) {
    case CreateCompositeSLOSteps.Define_SLO_Identification:
      return errorDefineSLOSection(formikProps.errors)
    case CreateCompositeSLOSteps.Set_SLO_Time_Window:
      return errorSetSLOTimeWindow(formikProps.errors)
    case CreateCompositeSLOSteps.Add_SLOs:
      return errorAddSLO(formikProps, getString)
    case CreateCompositeSLOSteps.Set_SLO_Target:
      return errorSetSLOTarget(formikProps.errors)
    case CreateCompositeSLOSteps.Error_Budget_Policy:
      return []
    default:
      return []
  }
}

export const shouldOpenPeriodUpdateModal = (
  formikValues: SLOV2Form,
  filterData: React.MutableRefObject<SLOTargetFilterDTO | undefined>
): boolean => {
  const formikFilterData = createSloTargetFilterDTO(formikValues)
  return (
    Boolean(formikValues.periodType) &&
    Boolean(filterData?.current) &&
    !isEmpty(formikValues.serviceLevelObjectivesDetails) &&
    !isEqual(formikFilterData, filterData?.current)
  )
}

export const shouldOpenEvaluationUpdateModal = (
  formikValues: SLOV2Form,
  evaluationTypesRef: React.MutableRefObject<ServiceLevelIndicatorDTO['type']>
): boolean =>
  Boolean(formikValues.evaluationType) &&
  Boolean(evaluationTypesRef?.current) &&
  !isEmpty(formikValues.serviceLevelObjectivesDetails) &&
  evaluationTypesRef.current !== formikValues.evaluationType

export const RenderOrg: Renderer<CellProps<SLOObjective & SLOConsumptionBreakdown>> = ({ row }) => {
  const slo = row.original
  const colorProp = getColorProp(slo.sloError)
  return (
    <Text {...colorProp} lineClamp={1} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {slo?.orgName ?? slo?.orgIdentifier}
    </Text>
  )
}

export const RenderProject: Renderer<CellProps<SLOObjective & SLOConsumptionBreakdown>> = ({ row }) => {
  const slo = row.original
  const colorProp = getColorProp(slo.sloError)
  return (
    <Text
      {...colorProp}
      lineClamp={1}
      font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
      margin={{ right: 'large' }}
    >
      {slo?.projectName ?? slo?.projectIdentifier}
    </Text>
  )
}

export const getProjectAndOrgColumn = ({
  getString,
  isAccountLevel
}: {
  getString: UseStringsReturn['getString']
  isAccountLevel?: boolean
}) => [
  {
    Header: getString('orgLabel').toUpperCase(),
    Cell: RenderOrg,
    width: isAccountLevel ? '10%' : '15%'
  },
  {
    Header: getString('projectLabel').toUpperCase(),
    Cell: RenderProject,
    width: isAccountLevel ? '10%' : '15%'
  }
]

export const getColumsForProjectAndAccountLevel = ({
  isAccountLevel,
  allColumns,
  getString
}: {
  isAccountLevel: boolean
  getString: UseStringsReturn['getString']
  allColumns: Array<Column<any>>
}): Array<Column<any>> =>
  isAccountLevel
    ? allColumns
    : allColumns.filter(
        column =>
          ![getString('orgLabel').toUpperCase(), getString('projectLabel').toUpperCase()].includes(
            column.Header as string
          )
      )

export const getOkAndCancelActions = ({
  type,
  onChange,
  onClose,
  prevStepData,
  handleRedirect
}: {
  type: WarningModalType
  onClose: () => void
  onChange: UseCreateCompositeSloWarningModalProps['onChange']
  prevStepData: UseCreateCompositeSloWarningModalProps['prevStepData']
  handleRedirect: UseCreateCompositeSloWarningModalProps['handleRedirect']
}): {
  onClickOk?: () => void
  onClickCancel?: () => void
} => {
  switch (type) {
    case WarningModalType.SAVE_CHANGES:
      return {
        onClickOk: () => handleRedirect(),
        onClickCancel: () => onClose()
      }
    case WarningModalType.PERIOD_TYPE:
    case WarningModalType.EVALUATION_TYPE:
      return {
        onClickOk: () => {
          onChange(prevState => {
            return {
              ...prevState,
              serviceLevelObjectivesDetails: []
            }
          })
          onClose()
        },
        onClickCancel: () => {
          onChange({ ...prevStepData.current } as SLOV2Form)
          onClose()
        }
      }
    default:
      return {}
  }
}

export const getWarningModalProps = ({
  type,
  getString,
  okAndCancelActions
}: {
  type: WarningModalType
  okAndCancelActions: {
    onClickOk?: () => void
    onClickCancel?: () => void
  }
  getString: UseStringsReturn['getString']
}): {
  modalTitle?: string
  modalMessage?: string
  onClickOk?: () => void
  onClickCancel?: () => void
} => {
  switch (type) {
    case WarningModalType.SAVE_CHANGES:
      return {
        modalTitle: getString('unsavedChanges'),
        modalMessage: getString('common.unsavedChangesLong'),
        ...okAndCancelActions
      }
    case WarningModalType.PERIOD_TYPE:
      return {
        modalTitle: getString('cv.CompositeSLO.PeriodChangeWarning.title'),
        modalMessage: getString('cv.CompositeSLO.PeriodChangeWarning.message'),
        ...okAndCancelActions
      }
    case WarningModalType.EVALUATION_TYPE:
      return {
        modalTitle: getString('cv.CompositeSLO.EvaluationTypeChangeWarning.title'),
        modalMessage: getString('cv.CompositeSLO.EvaluationTypeChangeWarning.message'),
        ...okAndCancelActions
      }
    default:
      return {}
  }
}
