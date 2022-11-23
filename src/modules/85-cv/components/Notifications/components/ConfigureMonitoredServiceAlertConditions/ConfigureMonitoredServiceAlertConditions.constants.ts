/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'

export enum Condition {
  CHANGE_IMPACT = 'ChangeImpact',
  HEALTH_SCORE = 'HealthScore',
  CHANGE_OBSERVED = 'ChangeObserved',
  CODE_ERRORS = 'CodeErrors'
}

export enum ChangeType {
  DEPLOYMENT = 'Deployment',
  INFRASTRUCTURE = 'Infrastructure',
  INCIDENT = 'Incident'
}

export enum EventStatus {
  NEW_EVENTS = 'NewEvents'
}

export enum EventType {
  ALL_EVENTS = 'AllEvents',
  EXCEPTIONS = 'Exceptions',
  LOG_ERRORS = 'LogErrors',
  HTTP_ERRORS = 'HttpErrors',
  CUSTOM_ERRORS = 'CustomErrors',
  TIMEOUT_ERRORS = 'TimeoutErrors'
}

export const conditionOptions: SelectOption[] = [
  { label: 'Change Impact', value: Condition.CHANGE_IMPACT },
  { label: 'Health Score', value: Condition.HEALTH_SCORE },
  { label: 'Change Observed', value: Condition.CHANGE_OBSERVED },
  { label: 'Code Errors', value: Condition.CODE_ERRORS }
]

export const changeTypeOptions: SelectOption[] = [
  { label: 'Deployment', value: ChangeType.DEPLOYMENT },
  { label: 'Infrastructure', value: ChangeType.INFRASTRUCTURE },
  { label: 'Incident', value: ChangeType.INCIDENT }
]

export const eventStatusOptions: SelectOption[] = [{ label: 'New Events', value: EventStatus.NEW_EVENTS }]

export const allEventsTypeOption = { label: 'All Events', value: EventType.ALL_EVENTS }

export const eventTypeOptions: SelectOption[] = [
  allEventsTypeOption,
  { label: 'Exceptions', value: EventType.EXCEPTIONS },
  { label: 'Log Errors', value: EventType.LOG_ERRORS },
  { label: 'HTTP Errors', value: EventType.HTTP_ERRORS },
  { label: 'Custom Errors', value: EventType.CUSTOM_ERRORS },
  { label: 'Timeout Errors', value: EventType.TIMEOUT_ERRORS }
]
