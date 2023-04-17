/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { UseStringsReturn } from 'framework/strings'
import type {
  ServiceLevelObjectiveV2DTO,
  SimpleServiceLevelObjectiveSpec,
  SLOTargetDTO,
  MonthlyCalenderSpec,
  RollingSLOTargetSpec,
  WeeklyCalendarSpec,
  CalenderSLOTargetSpec,
  SLOHealthListView,
  ProjectParams,
  ServiceLevelIndicatorDTO,
  ServiceLevelIndicatorSpec,
  RatioSLIMetricSpec,
  ThresholdSLIMetricSpec,
  WindowBasedServiceLevelIndicatorSpec
} from 'services/cv'
import type { SLOTargetChartWithAPIGetSliGraphProps } from '../SLOTargetChart/SLOTargetChart.types'

export const enum SLOV2FormFields {
  NAME = 'name',
  IDENTIFIER = 'identifier',
  DESCRIPTION = 'description',
  TAGS = 'tags',
  USER_JOURNEY_REF = 'userJourneyRef',
  MONITORED_SERVICE_REF = 'monitoredServiceRef',
  HEALTH_SOURCE_REF = 'healthSourceRef',
  SLI_TYPE = 'SLIType',
  SLI_METRIC_TYPE = 'SLIMetricType',
  EVENT_TYPE = 'eventType',
  VALID_REQUEST_METRIC = 'validRequestMetric',
  GOOD_REQUEST_METRIC = 'goodRequestMetric',
  OBJECTIVE_VALUE = 'objectiveValue',
  OBJECTIVE_COMPARATOR = 'objectiveComparator',
  SLI_MISSING_DATA_TYPE = 'SLIMissingDataType',
  PERIOD_TYPE = 'periodType',
  PERIOD_LENGTH = 'periodLength',
  PERIOD_LENGTH_TYPE = 'periodLengthType',
  DAY_OF_MONTH = 'dayOfMonth',
  DAY_OF_WEEK = 'dayOfWeek',
  SERVICE_LEVEL_OBJECTIVES_DETAILS = 'serviceLevelObjectivesDetails',
  SLO_TARGET_PERCENTAGE = 'SLOTargetPercentage',
  NOTIFICATION_RULE_REFS = 'notificationRuleRefs',
  TYPE = 'type',
  SERVICE_LEVEL_INDICATOR_TYPE = 'serviceLevelIndicatorType',
  EVALUATION_TYPE = 'evaluationType',
  CONSIDER_CONSECUTIVE_MINUTES = 'considerConsecutiveMinutes',
  CONSIDER_ALL_CONSECUTIVE_MINUTES_FROM_START_AS_BAD = 'considerAllConsecutiveMinutesFromStartAsBad'
}

export interface SLOObjective extends Partial<SLOHealthListView> {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  serviceLevelObjectiveRef: string
  weightagePercentage: number
  isManuallyUpdated?: boolean
}

export interface SLOV2Form {
  [SLOV2FormFields.TYPE]: ServiceLevelObjectiveV2DTO['type']
  [SLOV2FormFields.NAME]: ServiceLevelObjectiveV2DTO['name']
  [SLOV2FormFields.IDENTIFIER]: ServiceLevelObjectiveV2DTO['identifier']
  [SLOV2FormFields.DESCRIPTION]?: ServiceLevelObjectiveV2DTO['description']
  [SLOV2FormFields.TAGS]?: { [key: string]: string }
  [SLOV2FormFields.USER_JOURNEY_REF]: ServiceLevelObjectiveV2DTO['userJourneyRefs']
  [SLOV2FormFields.HEALTH_SOURCE_REF]?: SimpleServiceLevelObjectiveSpec['healthSourceRef']
  [SLOV2FormFields.MONITORED_SERVICE_REF]?: SimpleServiceLevelObjectiveSpec['monitoredServiceRef']
  [SLOV2FormFields.PERIOD_TYPE]: SLOTargetDTO['type']
  [SLOV2FormFields.PERIOD_LENGTH]?: RollingSLOTargetSpec['periodLength']
  [SLOV2FormFields.PERIOD_LENGTH_TYPE]?: CalenderSLOTargetSpec['type']
  [SLOV2FormFields.DAY_OF_MONTH]?: MonthlyCalenderSpec['dayOfMonth']
  [SLOV2FormFields.DAY_OF_WEEK]?: WeeklyCalendarSpec['dayOfWeek']
  [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: SLOTargetDTO['sloTargetPercentage']
  [SLOV2FormFields.NOTIFICATION_RULE_REFS]: ServiceLevelObjectiveV2DTO['notificationRuleRefs']
  [SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS]?: SLOObjective[]
  [SLOV2FormFields.SERVICE_LEVEL_INDICATOR_TYPE]?: SimpleServiceLevelObjectiveSpec['serviceLevelIndicatorType']
  [SLOV2FormFields.SLI_MISSING_DATA_TYPE]?: WindowBasedServiceLevelIndicatorSpec['sliMissingDataType']
  [SLOV2FormFields.SLI_METRIC_TYPE]?: ServiceLevelIndicatorSpec['type']
  [SLOV2FormFields.EVENT_TYPE]?: RatioSLIMetricSpec['eventType']
  [SLOV2FormFields.GOOD_REQUEST_METRIC]?: RatioSLIMetricSpec['metric1']
  [SLOV2FormFields.VALID_REQUEST_METRIC]?: RatioSLIMetricSpec['metric2']
  [SLOV2FormFields.OBJECTIVE_VALUE]?: RatioSLIMetricSpec['thresholdValue']
  [SLOV2FormFields.OBJECTIVE_COMPARATOR]?: RatioSLIMetricSpec['thresholdType']
  [SLOV2FormFields.EVALUATION_TYPE]?: ServiceLevelIndicatorDTO['type']
  [SLOV2FormFields.CONSIDER_CONSECUTIVE_MINUTES]?: ThresholdSLIMetricSpec['considerConsecutiveMinutes']
  [SLOV2FormFields.CONSIDER_ALL_CONSECUTIVE_MINUTES_FROM_START_AS_BAD]?: ThresholdSLIMetricSpec['considerAllConsecutiveMinutesFromStartAsBad']
}

export interface GetSLOIdentifierWithOrgAndProjectProps {
  sloIdentifier?: string
  projectParams?: ProjectParams
}

export enum EvaluationType {
  WINDOW = 'Window',
  REQUEST = 'Request'
}

export enum SLITypes {
  AVAILABILITY = 'Availability',
  LATENCY = 'Latency'
}

export enum SLIMetricTypes {
  THRESHOLD = 'Threshold',
  RATIO = 'Ratio'
}

export enum SLIEventTypes {
  GOOD = 'Good',
  BAD = 'Bad'
}

export enum Comparators {
  LESS = '<',
  GREATER = '>',
  LESS_EQUAL = '<=',
  GREATER_EQUAL = '>='
}

export enum SLIMissingDataTypes {
  GOOD = 'Good',
  BAD = 'Bad',
  IGNORE = 'Ignore'
}

export enum PeriodTypes {
  ROLLING = 'Rolling',
  CALENDAR = 'Calender'
}

export enum PeriodLengthTypes {
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly'
}

export enum Days {
  MONDAY = 'Mon',
  TUESDAY = 'Tue',
  WEDNESDAY = 'Wed',
  THURSDAY = 'Thu',
  FRIDAY = 'Fri',
  SATURDAY = 'Sat',
  SUNDAY = 'Sun'
}

export interface SLIProps
  extends Omit<SLOTargetChartWithAPIGetSliGraphProps, 'serviceLevelIndicator' | 'monitoredServiceIdentifier'> {
  formikProps: FormikProps<SLOV2Form>
  showChart?: boolean
}

export interface GetMetricRequestValuesBySLIMetricTypeProps {
  sliMetricType?: string
  validRequestMetric?: string
  goodRequestMetric?: string
  evaluationType?: string
}

export interface GetMetricFormValueBySLIMetricTypeProps {
  sliMetricType?: string
  metric1?: string
  metric2?: string
  evaluationType?: string
}

export interface SLOTargetAndBudgetPolicyProps
  extends Omit<SLOTargetChartWithAPIGetSliGraphProps, 'serviceLevelIndicator' | 'monitoredServiceIdentifier'> {
  formikProps: FormikProps<SLOV2Form>
}
export interface ErrorBudgetInterface {
  periodType: SLOV2Form['periodType']
  periodLength: SLOV2Form['periodLength']
  periodLengthType: SLOV2Form['periodLengthType']
  SLOTargetPercentage: SLOV2Form['SLOTargetPercentage']
}

export interface GetSimpleSLOCustomErrorProps {
  considerConsecutiveMinutes?: number
  considerAllConsecutiveMinutesFromStartAsBad?: boolean
  evaluationType?: string
  getString?: UseStringsReturn['getString']
  onlyStatus?: boolean
}

export interface GetSimpleSLOCustomErrorValues {
  status: boolean
  errorMessage?: Record<string, string>
}
