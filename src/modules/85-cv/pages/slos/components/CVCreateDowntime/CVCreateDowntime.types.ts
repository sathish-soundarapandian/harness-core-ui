/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  DowntimeDTO,
  MonitoredServiceDetail,
  OnetimeDowntimeSpec,
  OnetimeDurationBasedSpec,
  OnetimeEndTimeBasedSpec,
  RecurringDowntimeSpec
} from 'services/cv'

export const enum DowntimeFormFields {
  NAME = 'name',
  IDENTIFIER = 'identifier',
  DESCRIPTION = 'description',
  TAGS = 'tags',
  CATEGORY = 'category',
  TYPE = 'type',
  TIMEZONE = 'timezone',
  START_TIME = 'startTime',
  END_TIME_MODE = 'endTimeMode',
  DURATION_VALUE = 'durationValue',
  DURATION_TYPE = 'durationType',
  END_TIME = 'endTime',
  RECURRENCE_VALUE = 'recurrenceValue',
  RECURRENCE_TYPE = 'recurrenceType',
  RECURRENCE_END_TIME = 'recurrenceEndTime',
  MS_LIST = 'msList'
}

export enum DowntimeCategory {
  SCHEDULED_MAINTENANCE = 'ScheduledMaintenance',
  DEPLOYMENT = 'Deployment',
  OTHER = 'Other'
}

export enum EndTimeMode {
  DURATION = 'Duration',
  END_TIME = 'EndTime'
}

export interface DowntimeForm {
  [DowntimeFormFields.NAME]: DowntimeDTO['name']
  [DowntimeFormFields.IDENTIFIER]: DowntimeDTO['identifier']
  [DowntimeFormFields.DESCRIPTION]?: DowntimeDTO['description']
  [DowntimeFormFields.TAGS]?: { [key: string]: string }
  [DowntimeFormFields.CATEGORY]: DowntimeDTO['category']
  [DowntimeFormFields.TYPE]: DowntimeDTO['spec']['type']
  [DowntimeFormFields.TIMEZONE]: DowntimeDTO['spec']['spec']['timezone']
  [DowntimeFormFields.START_TIME]: DowntimeDTO['spec']['spec']['startTime'] | string
  [DowntimeFormFields.END_TIME_MODE]?: OnetimeDowntimeSpec['type']
  [DowntimeFormFields.DURATION_VALUE]?: OnetimeDurationBasedSpec['downtimeDuration']['durationValue']
  [DowntimeFormFields.DURATION_TYPE]?: OnetimeDurationBasedSpec['downtimeDuration']['durationType']
  [DowntimeFormFields.END_TIME]?: OnetimeEndTimeBasedSpec['endTime'] | string
  [DowntimeFormFields.RECURRENCE_VALUE]?: RecurringDowntimeSpec['downtimeRecurrence']['recurrenceValue']
  [DowntimeFormFields.RECURRENCE_TYPE]?: RecurringDowntimeSpec['downtimeRecurrence']['recurrenceType']
  [DowntimeFormFields.RECURRENCE_END_TIME]?: RecurringDowntimeSpec['recurrenceEndTime'] | string
  [DowntimeFormFields.MS_LIST]: MonitoredServiceDetail[]
}
