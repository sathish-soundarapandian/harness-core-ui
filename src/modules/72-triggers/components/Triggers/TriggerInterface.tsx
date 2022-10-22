/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ArtifactTriggerConfig, ManifestTriggerConfig, NGTriggerSourceV2 } from 'services/pipeline-ng'

export enum TriggerBaseType {
  WEBHOOK = 'Webhook',
  SCHEDULE = 'Scheduled',
  ARTIFACT = 'Artifact',
  MANIFEST = 'Manifest'
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

export type TriggerType = Required<NGTriggerSourceV2>['type']

export type TriggerArtifactType = Required<ArtifactTriggerConfig>['type']

export type ManifestType = Required<ManifestTriggerConfig>['type']

export type TriggerSubType = SourceRepo | ScheduleType | TriggerArtifactType | ManifestType
