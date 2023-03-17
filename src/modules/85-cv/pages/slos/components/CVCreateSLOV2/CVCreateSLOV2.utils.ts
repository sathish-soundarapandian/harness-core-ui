/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEqual, defaultTo, pick } from 'lodash-es'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'
import { SelectOption, Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { UseStringsReturn } from 'framework/strings'
import type {
  CalenderSLOTargetSpec,
  MetricDTO,
  MonitoredServiceDTO,
  MonitoredServiceWithHealthSources,
  RatioSLIMetricSpec,
  RollingSLOTargetSpec,
  ServiceLevelIndicatorDTO,
  ServiceLevelObjectiveDetailsDTO,
  ServiceLevelObjectiveV2DTO,
  SLOTargetDTO,
  ThresholdSLIMetricSpec,
  UserJourneyResponse
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
  GetMetricRequestValuesBySLIMetricTypeProps
} from './CVCreateSLOV2.types'
import { serviceLevelObjectiveKeys } from './components/CreateCompositeSloForm/CreateCompositeSloForm.constant'
import type { SLIForm } from './components/CreateSimpleSloForm/CreateSimpleSloForm.types'

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

export const getSLOV2InitialFormData = (
  sloType: ServiceLevelObjectiveV2DTO['type'],
  serviceLevelObjective?: ServiceLevelObjectiveV2DTO
): SLOV2Form => {
  if (serviceLevelObjective) {
    if (sloType === 'Simple') {
      return {
        [SLOV2FormFields.TYPE]: serviceLevelObjective.type,
        // SLO Name definition
        [SLOV2FormFields.NAME]: serviceLevelObjective.name,
        [SLOV2FormFields.IDENTIFIER]: serviceLevelObjective.identifier,
        [SLOV2FormFields.DESCRIPTION]: serviceLevelObjective.description,
        [SLOV2FormFields.TAGS]: serviceLevelObjective.tags,
        [SLOV2FormFields.USER_JOURNEY_REF]: serviceLevelObjective.userJourneyRefs,
        // SLO Period Type
        [SLOV2FormFields.PERIOD_TYPE]: defaultTo(serviceLevelObjective.sloTarget.type, 'Rolling'),
        // for Rolling
        [SLOV2FormFields.PERIOD_LENGTH]: serviceLevelObjective?.sloTarget?.spec?.periodLength,
        // for Calendar
        [SLOV2FormFields.PERIOD_LENGTH_TYPE]: serviceLevelObjective?.sloTarget?.spec?.type,
        [SLOV2FormFields.DAY_OF_MONTH]: serviceLevelObjective?.sloTarget?.spec?.spec?.dayOfMonth,
        [SLOV2FormFields.DAY_OF_WEEK]: serviceLevelObjective?.sloTarget?.spec?.spec?.dayOfWeek,

        //SPEC
        [SLOV2FormFields.MONITORED_SERVICE_REF]: serviceLevelObjective.spec?.monitoredServiceRef,
        [SLOV2FormFields.HEALTH_SOURCE_REF]: serviceLevelObjective.spec?.healthSourceRef,
        [SLOV2FormFields.SERVICE_LEVEL_INDICATOR_TYPE]: defaultTo(
          serviceLevelObjective.spec?.serviceLevelIndicatorType,
          SLITypes.AVAILABILITY
        ),
        [SLOV2FormFields.SLI_METRIC_TYPE]: defaultTo(
          serviceLevelObjective.spec?.serviceLevelIndicators?.[0]?.spec?.type,
          SLIMetricTypes.THRESHOLD
        ),
        [SLOV2FormFields.EVENT_TYPE]: serviceLevelObjective.spec?.serviceLevelIndicators?.[0]?.spec?.spec?.eventType,
        ...getMetricFormValuesBySLIMetricType({
          sliMetricType: serviceLevelObjective.spec?.serviceLevelIndicators?.[0]?.spec?.type,
          metric1: serviceLevelObjective.spec?.serviceLevelIndicators?.[0]?.spec?.spec?.metric1,
          metric2: serviceLevelObjective.spec?.serviceLevelIndicators?.[0]?.spec?.spec?.metric2
        }),
        [SLOV2FormFields.OBJECTIVE_VALUE]:
          serviceLevelObjective.spec?.serviceLevelIndicators?.[0]?.spec?.spec?.thresholdValue,
        [SLOV2FormFields.OBJECTIVE_COMPARATOR]:
          serviceLevelObjective.spec?.serviceLevelIndicators?.[0]?.spec?.spec?.thresholdType,
        [SLOV2FormFields.SLI_MISSING_DATA_TYPE]:
          serviceLevelObjective.spec?.serviceLevelIndicators?.[0]?.sliMissingDataType,

        // SLO target
        [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: serviceLevelObjective.sloTarget.sloTargetPercentage,
        // SLO Notificaitons
        [SLOV2FormFields.NOTIFICATION_RULE_REFS]: serviceLevelObjective?.notificationRuleRefs
      }
    } else {
      return {
        [SLOV2FormFields.TYPE]: serviceLevelObjective.type,
        // SLO Name definition
        [SLOV2FormFields.NAME]: serviceLevelObjective.name,
        [SLOV2FormFields.IDENTIFIER]: serviceLevelObjective.identifier,
        [SLOV2FormFields.DESCRIPTION]: serviceLevelObjective.description,
        [SLOV2FormFields.TAGS]: serviceLevelObjective.tags,
        [SLOV2FormFields.USER_JOURNEY_REF]: serviceLevelObjective.userJourneyRefs,
        // SLO Period Type
        [SLOV2FormFields.PERIOD_TYPE]: defaultTo(serviceLevelObjective.sloTarget.type, 'Rolling'),
        // for Rolling
        [SLOV2FormFields.PERIOD_LENGTH]: serviceLevelObjective?.sloTarget?.spec?.periodLength,
        // for Calendar
        [SLOV2FormFields.PERIOD_LENGTH_TYPE]: serviceLevelObjective?.sloTarget?.spec?.type,
        [SLOV2FormFields.DAY_OF_MONTH]: serviceLevelObjective?.sloTarget?.spec?.spec?.dayOfMonth,
        [SLOV2FormFields.DAY_OF_WEEK]: serviceLevelObjective?.sloTarget?.spec?.spec?.dayOfWeek,
        // Add SLOs
        [SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS]: serviceLevelObjective?.spec?.serviceLevelObjectivesDetails,
        // SLO target
        [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: serviceLevelObjective.sloTarget.sloTargetPercentage,
        // SLO Notificaitons
        [SLOV2FormFields.NOTIFICATION_RULE_REFS]: serviceLevelObjective?.notificationRuleRefs
      }
    }
  } else {
    const simpleSLODefaults = {
      [SLOV2FormFields.SERVICE_LEVEL_INDICATOR_TYPE]: SLITypes.AVAILABILITY,
      [SLOV2FormFields.SLI_METRIC_TYPE]: SLIMetricTypes.RATIO
    }
    let defaultValues = {}
    if (sloType === 'Simple') {
      defaultValues = simpleSLODefaults
    }
    return {
      ...defaultValues,
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
  sliMetricType = '',
  validRequestMetric = '',
  goodRequestMetric
}: GetMetricRequestValuesBySLIMetricTypeProps): {
  metric1: string
  metric2?: string
} => {
  return sliMetricType === SLIMetricTypes.RATIO
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
  sliMetricType = '',
  metric1 = '',
  metric2
}: GetMetricFormValueBySLIMetricTypeProps): {
  validRequestMetric: string
  goodRequestMetric?: string
} => {
  return sliMetricType === SLIMetricTypes.RATIO
    ? {
        validRequestMetric: metric2 ?? '',
        goodRequestMetric: metric1
      }
    : {
        validRequestMetric: metric1,
        goodRequestMetric: undefined
      }
}

export const createSLOV2RequestPayload = (
  values: SLOV2Form,
  orgIdentifier: string,
  projectIdentifier: string
): ServiceLevelObjectiveV2DTO => {
  const sloType = values.type
  if (sloType === 'Simple') {
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
        serviceLevelIndicators: [
          {
            name: `${values.monitoredServiceRef}_${values.healthSourceRef}_${values.identifier}_${uuid()}}`,
            identifier: `${values.monitoredServiceRef}_${values.healthSourceRef}_${values.identifier}_${uuid()}`,
            spec: {
              type: values.SLIMetricType,
              spec: {
                eventType: values.SLIMetricType === SLIMetricTypes.RATIO ? values.eventType : undefined,
                ...getMetricValuesBySLIMetricType({
                  sliMetricType: values.SLIMetricType,
                  goodRequestMetric: values.goodRequestMetric,
                  validRequestMetric: values.validRequestMetric
                }),
                thresholdValue: values.objectiveValue,
                thresholdType: values.objectiveComparator
              }
            },
            sliMissingDataType: values.SLIMissingDataType
          }
        ]
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
      .min(1, getString('cv.minValueN', { n: 1 }))
      .max(100, getString('cv.maxValue', { n: 100 }))
      .required(REQUIRED)
  })
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
    [SLOV2FormFields.OBJECTIVE_VALUE]: Yup.number()
      .typeError(REQUIRED)
      .min(0, getString('cv.minValueN', { n: 0 }))
      .when([SLOV2FormFields.SLI_METRIC_TYPE], {
        is: SLIMetricType => SLIMetricType === SLIMetricTypes.RATIO,
        then: Yup.number()
          .typeError(REQUIRED)
          .max(100, getString('cv.maxValue', { n: 100 }))
      })
      .required(REQUIRED),
    [SLOV2FormFields.OBJECTIVE_COMPARATOR]: Yup.string().required(REQUIRED),
    [SLOV2FormFields.SLI_MISSING_DATA_TYPE]: Yup.string().required(getString('cv.sliMissingDataTypeIsRequired')),
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

export const convertSLOFormDataToServiceLevelIndicatorDTO = (values: SLOV2Form): ServiceLevelIndicatorDTO => {
  return {
    name: values.name,
    identifier: values.identifier,
    healthSourceRef: values.healthSourceRef,
    sliMissingDataType: values.SLIMissingDataType as any,
    spec: {
      type: values.SLIMetricType,
      spec: {
        eventType: values.SLIMetricType === SLIMetricTypes.RATIO ? values.eventType : undefined,
        ...getMetricValuesBySLIMetricType({
          sliMetricType: values.SLIMetricType,
          goodRequestMetric: values.goodRequestMetric,
          validRequestMetric: values.validRequestMetric
        }),
        thresholdValue: values.objectiveValue,
        thresholdType: values.objectiveComparator
      } as ThresholdSLIMetricSpec & RatioSLIMetricSpec
    }
  }
}

export const convertServiceLevelIndicatorToSLIFormData = (serviceLevelIndicator: ServiceLevelIndicatorDTO): SLIForm => {
  const { type: SLIType, name, identifier, healthSourceRef, sliMissingDataType, spec } = serviceLevelIndicator
  const { type: SLIMetricType, spec: SLIMetricSpec } = spec
  const { eventType, metric1, metric2, thresholdValue, thresholdType } = SLIMetricSpec as ThresholdSLIMetricSpec &
    RatioSLIMetricSpec

  return {
    name,
    identifier,
    healthSourceRef,
    SLIType,
    SLIMetricType,
    eventType,
    ...getMetricFormValuesBySLIMetricType({ sliMetricType: SLIMetricType, metric1, metric2 }),
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
