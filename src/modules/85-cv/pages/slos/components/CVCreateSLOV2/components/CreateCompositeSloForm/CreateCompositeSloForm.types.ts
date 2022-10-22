/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export interface CreateCompositeSloFormInterface {
  loading: boolean
  error: any
  retryOnError: () => void
  handleRedirect: () => void
  runValidationOnMount?: boolean
}

export enum CreateCompositeSLOSteps {
  Define_SLO_Identification = 'Define_SLO_Identification',
  Set_SLO_Time_Window = 'Set_SLO_Time_Window',
  Add_SLOs = 'Add_SLOs',
  Set_SLO_Target = 'Set_SLO_Target',
  Error_Budget_Policy = 'Error_Budget_Policy'
}

export const enum CompositeSLOFormFields {
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
  SLO_TARGET_PERCENTAGE = 'SLOTargetPercentage',
  NOTIFICATION_RULE_REFS = 'notificationRuleRefs'
}
