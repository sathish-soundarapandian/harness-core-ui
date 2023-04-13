/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEqual, defaultTo, pick, isUndefined, isBoolean, isNumber } from 'lodash-es'
import * as Yup from 'yup'
import { SelectOption, Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { UseStringsReturn } from 'framework/strings'
import type {
  CalenderSLOTargetSpec,
  MetricDTO,
  MonitoredServiceDTO,
  MonitoredServiceWithHealthSources,
  RatioSLIMetricSpec,
  RequestBasedServiceLevelIndicatorSpec,
  RestResponseServiceLevelObjectiveV2Response,
  RollingSLOTargetSpec,
  ServiceLevelIndicatorDTO,
  ServiceLevelObjectiveDetailsDTO,
  ServiceLevelObjectiveV2DTO,
  SLOTargetDTO,
  ThresholdSLIMetricSpec,
  UserJourneyResponse,
  WindowBasedServiceLevelIndicatorSpec
} from 'services/cv'
import {
  PeriodLengthTypes,
  PeriodTypes,
  SLOObjective,
  SLOV2Form,
  SLOV2FormFields,
  SLITypes,
  SLIMetricTypes,
  GetMetricFormValueBySLIMetricTypeProps,
  GetSLOIdentifierWithOrgAndProjectProps,
  GetMetricRequestValuesBySLIMetricTypeProps,
  EvaluationType,
  GetSimpleSLOCustomErrorProps,
  GetSimpleSLOCustomErrorValues
} from './CVCreateSLOV2.types'
import {
  MaxConsecutiveStartTime,
  serviceLevelObjectiveKeys
} from './components/CreateCompositeSloForm/CreateCompositeSloForm.constant'
import type { SLIForm } from './components/CreateSimpleSloForm/CreateSimpleSloForm.types'
import { SLOType } from './CVCreateSLOV2.constants'

export const filterServiceLevelObjectivesDetailsFromSLOObjective = (
  serviceLevelObjectivesDetails?: SLOObjective[]
): ServiceLevelObjectiveDetailsDTO[] =>
  serviceLevelObjectivesDetails
    ? serviceLevelObjectivesDetails.map(sloDetail => {
        const formData = { ...sloDetail, ...sloDetail?.projectParams }
        const keysTobeSendInRequestBody = [...serviceLevelObjectiveKeys]
        return pick(formData, keysTobeSendInRequestBody) as ServiceLevelObjectiveDetailsDTO
      })
    : []

const populateMetricInSLOForm = (serviceLevelObjective: ServiceLevelObjectiveV2DTO) => {
  const { spec } = serviceLevelObjective
  const { serviceLevelIndicators } = spec || {}
  const [data] = serviceLevelIndicators || {}
  return data?.type === EvaluationType.REQUEST
    ? {
        [SLOV2FormFields.EVENT_TYPE]: data?.spec?.eventType,
        ...getMetricFormValuesBySLIMetricType({
          evaluationType: data?.type,
          sliMetricType: data?.spec?.type,
          metric1: data?.spec?.metric1,
          metric2: data?.spec?.metric2
        })
      }
    : {
        [SLOV2FormFields.EVENT_TYPE]: data?.spec?.spec?.eventType,
        ...getMetricFormValuesBySLIMetricType({
          evaluationType: data?.type,
          sliMetricType: data?.spec?.type,
          metric1: data?.spec?.spec?.metric1,
          metric2: data?.spec?.spec?.metric2
        })
      }
}

export const getSLOCommonFormValues = (serviceLevelObjective: ServiceLevelObjectiveV2DTO) => {
  const { name, identifier, type, description, tags, userJourneyRefs, sloTarget, notificationRuleRefs } =
    serviceLevelObjective
  return {
    [SLOV2FormFields.TYPE]: type,
    // SLO Name definition
    [SLOV2FormFields.NAME]: name,
    [SLOV2FormFields.IDENTIFIER]: identifier,
    [SLOV2FormFields.DESCRIPTION]: description,
    [SLOV2FormFields.TAGS]: tags,
    [SLOV2FormFields.USER_JOURNEY_REF]: userJourneyRefs,
    // SLO Period Type
    [SLOV2FormFields.PERIOD_TYPE]: defaultTo(sloTarget.type, 'Rolling'),
    // for Rolling
    [SLOV2FormFields.PERIOD_LENGTH]: sloTarget?.spec?.periodLength,
    // for Calendar
    [SLOV2FormFields.PERIOD_LENGTH_TYPE]: sloTarget?.spec?.type,
    [SLOV2FormFields.DAY_OF_MONTH]: sloTarget?.spec?.spec?.dayOfMonth,
    [SLOV2FormFields.DAY_OF_WEEK]: sloTarget?.spec?.spec?.dayOfWeek,
    // SLO target
    [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: sloTarget.sloTargetPercentage,
    // SLO Notificaitons
    [SLOV2FormFields.NOTIFICATION_RULE_REFS]: notificationRuleRefs
  }
}

const getOptionalConfigWindowBased = (data: ServiceLevelIndicatorDTO) => {
  return data?.type === EvaluationType.WINDOW
    ? {
        [SLOV2FormFields.CONSIDER_CONSECUTIVE_MINUTES]: data?.spec?.spec?.considerConsecutiveMinutes,
        [SLOV2FormFields.CONSIDER_ALL_CONSECUTIVE_MINUTES_FROM_START_AS_BAD]:
          data?.spec?.spec?.considerAllConsecutiveMinutesFromStartAsBad
      }
    : undefined
}

export const getSimpleSLOFormValue = (serviceLevelObjective: ServiceLevelObjectiveV2DTO) => {
  const { spec } = serviceLevelObjective
  const { monitoredServiceRef, healthSourceRef, serviceLevelIndicatorType, serviceLevelIndicators } = spec || {}
  const [data] = serviceLevelIndicators
  return {
    ...getSLOCommonFormValues(serviceLevelObjective),
    //SPEC
    [SLOV2FormFields.MONITORED_SERVICE_REF]: monitoredServiceRef,
    [SLOV2FormFields.HEALTH_SOURCE_REF]: healthSourceRef,
    [SLOV2FormFields.SERVICE_LEVEL_INDICATOR_TYPE]: defaultTo(serviceLevelIndicatorType, SLITypes.AVAILABILITY),
    [SLOV2FormFields.EVALUATION_TYPE]: defaultTo(data?.type, EvaluationType.WINDOW),
    [SLOV2FormFields.SLI_METRIC_TYPE]: defaultTo(data?.spec?.type, SLIMetricTypes.THRESHOLD),
    ...populateMetricInSLOForm(serviceLevelObjective),
    [SLOV2FormFields.OBJECTIVE_VALUE]: data?.spec?.spec?.thresholdValue,
    [SLOV2FormFields.OBJECTIVE_COMPARATOR]: data?.spec?.spec?.thresholdType,
    [SLOV2FormFields.SLI_MISSING_DATA_TYPE]: data?.spec?.sliMissingDataType,
    ...getOptionalConfigWindowBased(data)
  }
}

export const getCompositeSLOFormValue = (serviceLevelObjective: ServiceLevelObjectiveV2DTO) => {
  const { spec } = serviceLevelObjective
  return {
    ...getSLOCommonFormValues(serviceLevelObjective),
    // Add SLOs
    [SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS]: spec?.serviceLevelObjectivesDetails
  }
}

export const getCommonInitialFormValue = (sloType: ServiceLevelObjectiveV2DTO['type']) => ({
  [SLOV2FormFields.TYPE]: sloType,
  [SLOV2FormFields.NAME]: '',
  [SLOV2FormFields.IDENTIFIER]: '',
  [SLOV2FormFields.USER_JOURNEY_REF]: [],
  [SLOV2FormFields.MONITORED_SERVICE_REF]: '',
  [SLOV2FormFields.HEALTH_SOURCE_REF]: '',
  [SLOV2FormFields.PERIOD_TYPE]: PeriodTypes.ROLLING,
  [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: 99,
  [SLOV2FormFields.NOTIFICATION_RULE_REFS]: []
})

export const getSimpleSLOInitialFormValues = (occurenceBased: boolean) => {
  const featureFlagBasedProp = occurenceBased
    ? {}
    : {
        [SLOV2FormFields.SERVICE_LEVEL_INDICATOR_TYPE]: SLITypes.AVAILABILITY
      }
  return {
    ...featureFlagBasedProp,
    [SLOV2FormFields.SLI_METRIC_TYPE]: SLIMetricTypes.RATIO,
    [SLOV2FormFields.EVALUATION_TYPE]: EvaluationType.WINDOW
  }
}

export const getSLOV2InitialFormData = (
  sloType: ServiceLevelObjectiveV2DTO['type'],
  serviceLevelObjective?: ServiceLevelObjectiveV2DTO,
  occurenceBased = false
): SLOV2Form => {
  if (serviceLevelObjective) {
    if (sloType === SLOType.SIMPLE) {
      return getSimpleSLOFormValue(serviceLevelObjective)
    } else {
      return getCompositeSLOFormValue(serviceLevelObjective)
    }
  } else {
    let defaultValues = {}
    if (sloType === SLOType.SIMPLE) {
      defaultValues = getSimpleSLOInitialFormValues(occurenceBased)
    }
    return {
      ...defaultValues,
      ...getCommonInitialFormValue(sloType)
    }
  }
}

export const getSLOTarget = (values: SLOV2Form): SLOTargetDTO['spec'] => {
  if (values.periodType === PeriodTypes.ROLLING) {
    return {
      periodLength: values.periodLength
    }
  } else if (values.periodType === PeriodTypes.CALENDAR) {
    const { dayOfMonth, dayOfWeek } = values
    if (values.periodLengthType === PeriodLengthTypes.MONTHLY) {
      return {
        type: values.periodLengthType,
        spec: { dayOfMonth }
      }
    }
    if (values.periodLengthType === PeriodLengthTypes.WEEKLY) {
      return {
        type: values.periodLengthType,
        spec: { dayOfWeek }
      }
    }
    if (values.periodLengthType === PeriodLengthTypes.QUARTERLY) {
      return {
        type: values.periodLengthType,
        spec: {}
      }
    }
    return {
      periodLength: values.periodLength
    }
  }
  return {}
}

export const getMetricValuesBySLIMetricType = ({
  evaluationType,
  sliMetricType = '',
  validRequestMetric = '',
  goodRequestMetric
}: GetMetricRequestValuesBySLIMetricTypeProps): {
  metric1: string
  metric2?: string
} => {
  const isRequest = evaluationType === EvaluationType.REQUEST
  return (!isRequest && sliMetricType === SLIMetricTypes.RATIO) || isRequest
    ? {
        metric1: goodRequestMetric ?? '',
        metric2: validRequestMetric
      }
    : {
        metric1: validRequestMetric,
        metric2: undefined
      }
}

export const getMetricFormValuesBySLIMetricType = ({
  evaluationType,
  sliMetricType = '',
  metric1 = '',
  metric2
}: GetMetricFormValueBySLIMetricTypeProps): {
  validRequestMetric: string
  goodRequestMetric?: string
} => {
  const isRequest = evaluationType === EvaluationType.REQUEST
  return (!isRequest && sliMetricType === SLIMetricTypes.RATIO) || isRequest
    ? {
        validRequestMetric: metric2 ?? '',
        goodRequestMetric: metric1
      }
    : {
        validRequestMetric: metric1,
        goodRequestMetric: undefined
      }
}

const createRequestBasedServiceLevelIndicatorSpec = (values: SLOV2Form): RequestBasedServiceLevelIndicatorSpec => {
  const { eventType, goodRequestMetric, validRequestMetric } = values
  const data = {
    eventType,
    metric1: goodRequestMetric,
    metric2: validRequestMetric
  }
  return data as RequestBasedServiceLevelIndicatorSpec
}

const createWindowBasedServiceLevelIndicatorSpec = (values: SLOV2Form): WindowBasedServiceLevelIndicatorSpec => {
  const { SLIMissingDataType, SLIMetricType } = values
  const isRatio = SLIMetricType === SLIMetricTypes.RATIO
  const data = {
    sliMissingDataType: SLIMissingDataType,
    type: SLIMetricType,
    spec: isRatio ? createRatioSLIMetricSpec(values) : createThresholdSLIMetricSpec(values)
  }
  return data
}

export const areOptionalFieldsFilled = (
  considerConsecutiveMinutes?: number,
  considerAllConsecutiveMinutesFromStartAsBad?: boolean
): boolean => !isUndefined(considerAllConsecutiveMinutesFromStartAsBad) && !isUndefined(considerConsecutiveMinutes)

export const createOptionalConfigPayload = (
  values: SLOV2Form
): { considerAllConsecutiveMinutesFromStartAsBad?: boolean; considerConsecutiveMinutes?: number } => {
  const { considerConsecutiveMinutes, considerAllConsecutiveMinutesFromStartAsBad } = values

  return areOptionalFieldsFilled(considerConsecutiveMinutes, considerAllConsecutiveMinutesFromStartAsBad)
    ? {
        considerAllConsecutiveMinutesFromStartAsBad,
        considerConsecutiveMinutes
      }
    : {}
}

const createThresholdSLIMetricSpec = (values: SLOV2Form): ThresholdSLIMetricSpec => {
  const { validRequestMetric, objectiveComparator, objectiveValue } = values
  const optionalConfig = createOptionalConfigPayload(values)
  const data = {
    metric1: validRequestMetric,
    thresholdType: objectiveComparator,
    thresholdValue: objectiveValue,
    ...optionalConfig
  }
  return data as ThresholdSLIMetricSpec
}

const createRatioSLIMetricSpec = (values: SLOV2Form): RatioSLIMetricSpec => {
  const { eventType, validRequestMetric, goodRequestMetric, objectiveComparator, objectiveValue } = values
  const optionalConfig = createOptionalConfigPayload(values)
  const data = {
    eventType,
    metric1: goodRequestMetric,
    metric2: validRequestMetric,
    thresholdType: objectiveComparator,
    thresholdValue: objectiveValue,
    ...optionalConfig
  }
  return data as RatioSLIMetricSpec
}

export const getSpecData = (
  values: SLOV2Form
): WindowBasedServiceLevelIndicatorSpec | RequestBasedServiceLevelIndicatorSpec => {
  const { evaluationType } = values
  return evaluationType === EvaluationType.WINDOW
    ? createWindowBasedServiceLevelIndicatorSpec(values)
    : createRequestBasedServiceLevelIndicatorSpec(values)
}

export const convertSLOFormDataToServiceLevelIndicatorDTO = (values: SLOV2Form): ServiceLevelIndicatorDTO => {
  return {
    name: values.name,
    identifier: values.identifier,
    healthSourceRef: values.healthSourceRef,
    type: values.evaluationType,
    spec: getSpecData(values)
  }
}

export const getServiceLevelIndicatorsIdentifierFromResponse = (
  SLODataResponse: RestResponseServiceLevelObjectiveV2Response | null,
  isComposite?: boolean
): string | undefined =>
  isComposite
    ? undefined
    : SLODataResponse?.resource?.serviceLevelObjectiveV2?.spec?.serviceLevelIndicators?.[0]?.identifier

export const getServiceLevelIndicatorsIdentifier = (values: SLOV2Form, prvSLIIdentifier?: string): string => {
  const { identifier, validRequestMetric } = values
  return prvSLIIdentifier ?? `${identifier}_${validRequestMetric}`
}

export const createSLOV2RequestPayload = (
  values: SLOV2Form,
  orgIdentifier: string,
  projectIdentifier: string,
  serviceLevelIndicatorsIdentifierFromResponse?: string
): ServiceLevelObjectiveV2DTO => {
  const sloType = values.type
  if (sloType === 'Simple') {
    const serviceLevelIndicatorsIdentifier = getServiceLevelIndicatorsIdentifier(
      values,
      serviceLevelIndicatorsIdentifierFromResponse
    )
    const serviceLevelIndicators = {
      name: serviceLevelIndicatorsIdentifier,
      identifier: serviceLevelIndicatorsIdentifier,
      type: values.evaluationType,
      spec: getSpecData(values)
    }

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
        spec: { ...getSLOTarget(values) }
      },
      spec: {
        monitoredServiceRef: values.monitoredServiceRef,
        healthSourceRef: values.healthSourceRef,
        serviceLevelIndicatorType: values.serviceLevelIndicatorType,
        serviceLevelIndicators: [{ ...serviceLevelIndicators }]
      }
    }
  } else {
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
        spec: { ...getSLOTarget(values) }
      },
      spec: {
        serviceLevelObjectivesDetails: filterServiceLevelObjectivesDetailsFromSLOObjective(
          values.serviceLevelObjectivesDetails
        )
      }
    }
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

const getSLOTargetSchemaValidation = (getString: UseStringsReturn['getString']) => {
  const REQUIRED = getString('cv.required')
  return {
    [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: Yup.number()
      .typeError(REQUIRED)
      .test('minSLOTarget', getString('cv.minValueN', { n: 0 }), function (SLOTargetPercentage) {
        return SLOTargetPercentage && SLOTargetPercentage > 0
      })
      .test('maxSLOTarget', getString('cv.maxValue', { n: 100 }), function (SLOTargetPercentage) {
        return SLOTargetPercentage && SLOTargetPercentage < 100
      })
  }
}

export const getSLOV2FormValidationSchema = (getString: UseStringsReturn['getString']): any => {
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
    ...getSLOTargetSchemaValidation(getString)
  })
}

export const getSimpleSLOCustomError = ({
  considerConsecutiveMinutes,
  considerAllConsecutiveMinutesFromStartAsBad,
  evaluationType,
  getString,
  onlyStatus
}: GetSimpleSLOCustomErrorProps): GetSimpleSLOCustomErrorValues => {
  let error = {}
  const considerConsecutiveMinutesValue = considerConsecutiveMinutes as number
  const isValidMInutesFromStart = isBoolean(considerAllConsecutiveMinutesFromStartAsBad)
  const isValidConsecutiveMinute = isNumber(considerConsecutiveMinutes) && !isNaN(considerConsecutiveMinutes)
  if (evaluationType === EvaluationType.WINDOW && (isValidConsecutiveMinute || isValidMInutesFromStart)) {
    if (isValidConsecutiveMinute && !isValidMInutesFromStart) {
      if (onlyStatus) {
        return { status: true }
      } else {
        error = {
          ...error,
          [SLOV2FormFields.CONSIDER_ALL_CONSECUTIVE_MINUTES_FROM_START_AS_BAD]: defaultTo(
            getString?.('cv.required'),
            ''
          )
        }
      }
    }
    if (!isValidConsecutiveMinute && isValidMInutesFromStart) {
      if (onlyStatus) {
        return { status: true }
      } else {
        error = {
          ...error,
          [SLOV2FormFields.CONSIDER_CONSECUTIVE_MINUTES]: defaultTo(getString?.('cv.required'), '')
        }
      }
    }
    if (isValidConsecutiveMinute && !(considerConsecutiveMinutesValue > 0)) {
      if (onlyStatus) {
        return { status: true }
      } else {
        error = {
          ...error,
          [SLOV2FormFields.CONSIDER_CONSECUTIVE_MINUTES]: defaultTo(
            getString?.('cv.slos.slis.optionalConfig.consecutiveMinsMin'),
            ''
          )
        }
      }
    }
    if (isValidConsecutiveMinute && !(considerConsecutiveMinutesValue <= MaxConsecutiveStartTime)) {
      if (onlyStatus) {
        return { status: true }
      } else {
        error = {
          ...error,
          [SLOV2FormFields.CONSIDER_CONSECUTIVE_MINUTES]: defaultTo(
            getString?.('cv.slos.slis.optionalConfig.consecutiveMinsMax'),
            ''
          )
        }
      }
    }
    return { errorMessage: error, status: false }
  }
  return { errorMessage: {}, status: false }
}

export const getSimpleSLOCustomValidation = (values: SLOV2Form, getString: UseStringsReturn['getString']) => {
  const { considerConsecutiveMinutes, considerAllConsecutiveMinutesFromStartAsBad, evaluationType } = values
  if (
    evaluationType === EvaluationType.WINDOW &&
    (!isUndefined(considerConsecutiveMinutes) || isBoolean(considerAllConsecutiveMinutesFromStartAsBad))
  ) {
    return getSimpleSLOCustomError({
      considerConsecutiveMinutes,
      considerAllConsecutiveMinutesFromStartAsBad,
      evaluationType,
      getString
    })?.errorMessage
  }
}

export const getSimpleSLOV2FormValidationSchema = (getString: UseStringsReturn['getString']): any => {
  const REQUIRED = getString('cv.required')
  const METRIC_IS_REQUIRED = getString('cv.metricIsRequired')

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
    [SLOV2FormFields.MONITORED_SERVICE_REF]: Yup.string().required(
      getString('connectors.cdng.validations.monitoringServiceRequired')
    ),
    [SLOV2FormFields.HEALTH_SOURCE_REF]: Yup.string().required(getString('cv.slos.validations.healthSourceRequired')),

    [SLOV2FormFields.EVENT_TYPE]: Yup.string().when(SLOV2FormFields.SLI_METRIC_TYPE, {
      is: SLIMetricType => SLIMetricType === SLIMetricTypes.RATIO,
      then: Yup.string().nullable().required(REQUIRED)
    }),
    [SLOV2FormFields.GOOD_REQUEST_METRIC]: Yup.string().when(SLOV2FormFields.SLI_METRIC_TYPE, {
      is: SLIMetricType => SLIMetricType === SLIMetricTypes.RATIO,
      then: Yup.string().nullable().required(METRIC_IS_REQUIRED)
    }),
    [SLOV2FormFields.VALID_REQUEST_METRIC]: Yup.string()
      .required(METRIC_IS_REQUIRED)
      .test(
        'bothMetricsShouldBeDifferent',
        getString('cv.metricForGoodAndValidRequestsShouldBeDifferent'),
        function (validRequestMetric) {
          return validRequestMetric && this.parent.SLIMetricType === SLIMetricTypes.RATIO
            ? validRequestMetric !== this.parent.goodRequestMetric
            : true
        }
      ),
    [SLOV2FormFields.OBJECTIVE_VALUE]: Yup.number().when(SLOV2FormFields.EVALUATION_TYPE, {
      is: evaluationType => evaluationType === EvaluationType.WINDOW,
      then: Yup.number()
        .typeError(REQUIRED)
        .test('minObjectiveValue', getString('cv.minValueN', { n: 0 }), function (objectiveValue) {
          return objectiveValue && objectiveValue > 0
        })
        .when([SLOV2FormFields.SLI_METRIC_TYPE], {
          is: SLIMetricType => SLIMetricType === SLIMetricTypes.RATIO,
          then: Yup.number()
            .typeError(REQUIRED)
            .test('maxObjectiveValue', getString('cv.maxValue', { n: 100 }), function (objectiveValue) {
              return objectiveValue && objectiveValue < 100
            })
        })
        .required(REQUIRED)
    }),
    [SLOV2FormFields.OBJECTIVE_COMPARATOR]: Yup.string().when(SLOV2FormFields.EVALUATION_TYPE, {
      is: evaluationType => evaluationType === EvaluationType.WINDOW,
      then: Yup.string().required(REQUIRED)
    }),
    [SLOV2FormFields.SLI_MISSING_DATA_TYPE]: Yup.string().when(SLOV2FormFields.EVALUATION_TYPE, {
      is: evaluationType => evaluationType === EvaluationType.WINDOW,
      then: Yup.string().required(getString('cv.sliMissingDataTypeIsRequired'))
    }),
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
    ...getSLOTargetSchemaValidation(getString)
  })
}

export const getSLOIdentifierWithOrgAndProject = (item: GetSLOIdentifierWithOrgAndProjectProps) =>
  item.sloIdentifier
    ? `${item.sloIdentifier}.${item.projectParams?.orgIdentifier}.${item.projectParams?.projectIdentifier}`
    : ''

export const getSLORefIdWithOrgAndProject = (item: Partial<ServiceLevelObjectiveDetailsDTO>) =>
  `${item.serviceLevelObjectiveRef}.${item.orgIdentifier}.${item.projectIdentifier}`

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

export const convertServiceLevelIndicatorToSLIFormData = (serviceLevelIndicator: ServiceLevelIndicatorDTO): SLIForm => {
  const { type, name, identifier, healthSourceRef, sliMissingDataType, spec } = serviceLevelIndicator
  const isWindow = type === EvaluationType.WINDOW
  const { type: SLIMetricType, spec: SLIMetricSpec } = spec
  const { eventType, metric1, metric2, thresholdValue, thresholdType } = isWindow
    ? ((SLIMetricSpec || {}) as ThresholdSLIMetricSpec & RatioSLIMetricSpec)
    : spec

  return {
    name,
    identifier,
    healthSourceRef,
    evaluationType: type,
    SLIMetricType,
    eventType,
    ...getMetricFormValuesBySLIMetricType({ evaluationType: type, sliMetricType: SLIMetricType, metric1, metric2 }),
    objectiveValue: thresholdValue,
    objectiveComparator: thresholdType,
    SLIMissingDataType: sliMissingDataType
  }
}

export function getHealthSourceOptions(monitoredService?: MonitoredServiceDTO): SelectOption[] {
  return (
    monitoredService?.sources?.healthSources?.map(healthSource => ({
      label: healthSource?.name ?? '',
      value: healthSource?.identifier ?? ''
    })) ?? []
  )
}

export function getMonitoredServiceOptions(
  monitoredServiceWithHealthSources?: MonitoredServiceWithHealthSources[]
): SelectOption[] {
  return (
    monitoredServiceWithHealthSources?.map(monitoredService => ({
      label: monitoredService.name ?? '',
      value: monitoredService.identifier ?? ''
    })) ?? []
  )
}

export const getUserJourneyOptions = (userJourneyResponse?: UserJourneyResponse[]): SelectOption[] => {
  return (
    userJourneyResponse?.map(userJourney => ({
      label: userJourney.userJourney.name,
      value: userJourney.userJourney.identifier
    })) ?? []
  )
}

export const getSLOMetricOptions = (SLOMetricList?: MetricDTO[]): SelectOption[] => {
  return (
    SLOMetricList?.map(metric => ({
      label: metric.metricName ?? '',
      value: metric.identifier ?? ''
    })) ?? []
  )
}
