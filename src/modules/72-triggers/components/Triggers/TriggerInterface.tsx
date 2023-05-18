/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  ArtifactTriggerConfig,
  ManifestTriggerConfig,
  NGTriggerSourceV2,
  TriggerCatalogItem,
  WebhookTriggerConfigV2
} from 'services/pipeline-ng'

export type TriggerType = NGTriggerSourceV2['type']

export type TriggerBaseType = Exclude<TriggerType, 'MultiRegionArtifact'>

export type SourceRepo = Exclude<Required<WebhookTriggerConfigV2>['type'], 'AwsCodeCommit' | 'Harness'>

export type ScheduleType = Extract<TriggerCatalogItem['triggerCatalogType'][number], 'Cron'>

/**
 * There are two type of Artifact Trigger
 * 1: Artifact: For single artifact source
 * 2: MultiRegionArtifact: For multiple artifact source
 */
export type ArtifactTriggerType = Extract<TriggerType, 'Artifact' | 'MultiRegionArtifact'>

export type TriggerArtifactType = Required<ArtifactTriggerConfig>['type']

export type ManifestType = Required<ManifestTriggerConfig>['type']

export type TriggerSubType = SourceRepo | ScheduleType | TriggerArtifactType | ManifestType
