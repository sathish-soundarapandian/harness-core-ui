/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum TriggerBaseType {
  WEBHOOK = 'Webhook',
  SCHEDULE = 'Scheduled'
}

export enum SourceRepo {
  Github = 'Github',
  Gitlab = 'Gitlab',
  Bitbucket = 'Bitbucket',
  AzureRepo = 'AzureRepo',
  Custom = 'Custom'
}

export enum ScheduleType {
  Cron = 'Cron'
}

export const TriggerSubType = { ...SourceRepo, ...ScheduleType }
export type TriggerSubType = SourceRepo | ScheduleType
