/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEqual, defaultTo } from 'lodash-es'
import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import type { CalenderSLOTargetSpec, RollingSLOTargetSpec, ServiceLevelObjectiveV2DTO } from 'services/cv'
import { PeriodLengthTypes, PeriodTypes } from '../CVCreateSLO/CVCreateSLO.types'
import { SLOV2Form, SLOV2FormFields } from './CVCreateSLOV2.types'

export const getSLOV2InitialFormData = (
  sloType: ServiceLevelObjectiveV2DTO['type'],
  serviceLevelObjective?: ServiceLevelObjectiveV2DTO
): SLOV2Form => {
  if (serviceLevelObjective) {
    return {
      [SLOV2FormFields.TYPE]: serviceLevelObjective.type,
      //
      [SLOV2FormFields.NAME]: serviceLevelObjective.name,
      [SLOV2FormFields.IDENTIFIER]: serviceLevelObjective.identifier,
      [SLOV2FormFields.DESCRIPTION]: serviceLevelObjective.description,
      [SLOV2FormFields.TAGS]: serviceLevelObjective.tags,
      [SLOV2FormFields.USER_JOURNEY_REF]: serviceLevelObjective.userJourneyRefs,
      //
      [SLOV2FormFields.PERIOD_TYPE]: defaultTo(serviceLevelObjective.sloTarget.type, 'Rolling'),
      // for Rolling
      [SLOV2FormFields.PERIOD_LENGTH]: serviceLevelObjective?.sloTarget?.spec?.periodLength,
      // for Calendar
      [SLOV2FormFields.PERIOD_LENGTH_TYPE]: serviceLevelObjective?.sloTarget?.spec?.spec?.type,
      [SLOV2FormFields.DAY_OF_MONTH]: serviceLevelObjective?.sloTarget?.spec?.spec?.dayOfMonth,
      [SLOV2FormFields.DAY_OF_WEEK]: serviceLevelObjective?.sloTarget?.spec?.spec?.dayOfWeek,
      //
      [SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS]: serviceLevelObjective?.spec?.serviceLevelObjectivesDetails,
      //
      [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: serviceLevelObjective.sloTarget.sloTargetPercentage,
      //
      [SLOV2FormFields.NOTIFICATION_RULE_REFS]: serviceLevelObjective?.notificationRuleRefs
    }
  } else {
    return {
      [SLOV2FormFields.TYPE]: sloType,
      [SLOV2FormFields.NAME]: '',
      [SLOV2FormFields.IDENTIFIER]: '',
      [SLOV2FormFields.USER_JOURNEY_REF]: [],
      [SLOV2FormFields.MONITORED_SERVICE_REF]: '',
      [SLOV2FormFields.HEALTH_SOURCE_REF]: '',
      [SLOV2FormFields.PERIOD_TYPE]: PeriodTypes.ROLLING,
      [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: 99,
      [SLOV2FormFields.NOTIFICATION_RULE_REFS]: []
    }
  }
}

export const createSLOV2RequestPayload = (
  values: SLOV2Form,
  orgIdentifier: string,
  projectIdentifier: string
): ServiceLevelObjectiveV2DTO => {
  return {
    name: values.name,
    type: values.type,
    identifier: values.identifier,
    description: values.description,
    tags: values.tags,
    userJourneyRefs: values.userJourneyRef,
    orgIdentifier,
    projectIdentifier,
    notificationRuleRefs: values?.notificationRuleRefs,
    sloTarget: {
      sloTargetPercentage: values.SLOTargetPercentage,
      type: values.periodType,
      spec: {
        periodLength: values.periodLength
      }
    },
    spec: { serviceLevelObjectivesDetails: values.serviceLevelObjectivesDetails }
  }
}

const getVerifyData = (data: ServiceLevelObjectiveV2DTO) => {
  const { sloTarget, spec: sloSpec } = data
  const { sloTargetPercentage, type, spec } = sloTarget

  type === 'Calender' ? (spec as CalenderSLOTargetSpec) : (spec as RollingSLOTargetSpec)

  return {
    ...spec,
    ...sloSpec,
    sloTargetPercentage
  }
}

export const getIsUserUpdatedSLOData = (
  existingData: ServiceLevelObjectiveV2DTO,
  formData: ServiceLevelObjectiveV2DTO
): boolean => {
  const existingDataToVerify = getVerifyData(existingData)
  const formDataToVerify = getVerifyData(formData)
  return isEqual(existingDataToVerify, formDataToVerify)
}

export const getSLOV2FormValidationSchema = (getString: UseStringsReturn['getString']): any => {
  const REQUIRED = getString('cv.required')

  return Yup.object().shape({
    [SLOV2FormFields.NAME]: Yup.string()
      .trim()
      .required(getString('cv.slos.validations.nameValidation'))
      .matches(/^[0-9a-zA-Z-_\s]+$/, getString('cv.slos.validations.specialCharacters')),
    [SLOV2FormFields.IDENTIFIER]: Yup.string().when([SLOV2FormFields.NAME], {
      is: name => name,
      then: Yup.string().trim().required(getString('validation.identifierRequired'))
    }),
    [SLOV2FormFields.USER_JOURNEY_REF]: Yup.string().required(getString('cv.slos.validations.userJourneyRequired')),
    [SLOV2FormFields.PERIOD_LENGTH]: Yup.string().when([SLOV2FormFields.PERIOD_TYPE], {
      is: periodType => periodType === PeriodTypes.ROLLING,
      then: Yup.string().nullable().required(getString('cv.periodLengthIsRequired'))
    }),
    [SLOV2FormFields.PERIOD_LENGTH_TYPE]: Yup.string().when([SLOV2FormFields.PERIOD_TYPE], {
      is: periodType => periodType === PeriodTypes.CALENDAR,
      then: Yup.string().nullable().required(getString('cv.periodLengthIsRequired'))
    }),
    [SLOV2FormFields.DAY_OF_WEEK]: Yup.string().when([SLOV2FormFields.PERIOD_LENGTH_TYPE], {
      is: periodLengthType => periodLengthType === PeriodLengthTypes.WEEKLY,
      then: Yup.string().nullable().required(getString('cv.windowsEndIsRequired'))
    }),
    [SLOV2FormFields.DAY_OF_MONTH]: Yup.string().when([SLOV2FormFields.PERIOD_LENGTH_TYPE], {
      is: periodLengthType => periodLengthType === PeriodLengthTypes.MONTHLY,
      then: Yup.string().nullable().required(getString('cv.windowsEndIsRequired'))
    }),
    [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: Yup.number()
      .typeError(REQUIRED)
      .min(0, getString('cv.minValueN', { n: 0 }))
      .max(100, getString('cv.maxValue', { n: 100 }))
      .required(REQUIRED)
  })
}
