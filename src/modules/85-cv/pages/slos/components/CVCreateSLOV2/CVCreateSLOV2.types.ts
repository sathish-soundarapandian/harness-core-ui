import type {
  ServiceLevelObjectiveV2DTO,
  SimpleServiceLevelObjectiveSpec,
  SLOTargetDTO,
  MonthlyCalenderSpec,
  RollingSLOTargetSpec,
  WeeklyCalendarSpec,
  CalenderSLOTargetSpec,
  CompositeServiceLevelObjectiveSpec
} from 'services/cv'

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
  TYPE = 'type'
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
  [SLOV2FormFields.PERIOD_TYPE]?: SLOTargetDTO['type']
  [SLOV2FormFields.PERIOD_LENGTH]?: RollingSLOTargetSpec['periodLength']
  [SLOV2FormFields.PERIOD_LENGTH_TYPE]?: CalenderSLOTargetSpec['type']
  [SLOV2FormFields.DAY_OF_MONTH]?: MonthlyCalenderSpec['dayOfMonth']
  [SLOV2FormFields.DAY_OF_WEEK]?: WeeklyCalendarSpec['dayOfWeek']
  [SLOV2FormFields.SLO_TARGET_PERCENTAGE]: SLOTargetDTO['sloTargetPercentage']
  [SLOV2FormFields.NOTIFICATION_RULE_REFS]: ServiceLevelObjectiveV2DTO['notificationRuleRefs']
  [SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS]?: CompositeServiceLevelObjectiveSpec['serviceLevelObjectivesDetails']
}
