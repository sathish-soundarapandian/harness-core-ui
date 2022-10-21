/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
// temporary mock data
import { parse } from 'yaml'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { AddDrawerMapInterface, CategoryInterface } from '@common/components/AddDrawer/AddDrawer'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import {
  manifestTypeIcons,
  ManifestDataType,
  manifestTypeLabels
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import {
  ArtifactIconByType,
  ArtifactTitleIdByType,
  ENABLED_ARTIFACT_TYPES
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import type { TriggerCatalogItem } from 'services/pipeline-ng'
import { ScheduleType, TriggerBaseType } from '@triggers/components/Triggers/TriggerInterface'
import { TriggerTypes, AWS_CODECOMMIT, AwsCodeCommit } from './TriggersWizardPageUtils'

export const GitSourceProviders: Record<
  string,
  { value: ConnectorInfoDTO['type'] | 'AwsCodeCommit' | 'Custom'; iconName: IconName }
> = {
  GITHUB: { value: 'Github', iconName: 'github' },
  GITLAB: { value: 'Gitlab', iconName: 'service-gotlab' },
  BITBUCKET: { value: 'Bitbucket', iconName: 'bitbucket-selected' },
  AZURE_REPO: { value: 'AzureRepo', iconName: 'service-azure' },
  AWS_CODECOMMIT: { value: 'AwsCodeCommit', iconName: 'service-aws-code-deploy' },
  CUSTOM: { value: 'Custom', iconName: 'build' }
}

const TriggerTypeIcons: Record<'SCHEDULE' | 'NEW_ARTIFACT', IconName> = {
  SCHEDULE: 'trigger-schedule',
  NEW_ARTIFACT: 'new-artifact'
}
export const getTriggerIcon = ({
  type,
  webhookSourceRepo,
  buildType
}: {
  type: string
  webhookSourceRepo?: string // string temporary until backend
  buildType?: string
}): IconName => {
  const updatedWebhookSourceRepo =
    webhookSourceRepo === AwsCodeCommit ? AWS_CODECOMMIT : webhookSourceRepo?.toUpperCase()
  const webhookSourceRepoIconName =
    webhookSourceRepo && updatedWebhookSourceRepo && GitSourceProviders[updatedWebhookSourceRepo]?.iconName
  if (type === TriggerTypes.WEBHOOK && webhookSourceRepoIconName) {
    return webhookSourceRepoIconName
  } else if (type === TriggerTypes.SCHEDULE) {
    return TriggerTypeIcons.SCHEDULE
  } else if (type === TriggerTypes.MANIFEST && buildType) {
    if (buildType === ManifestDataType.HelmChart) {
      return manifestTypeIcons.HelmChart
    }
  } else if (type === TriggerTypes.ARTIFACT && buildType) {
    switch (buildType) {
      case ENABLED_ARTIFACT_TYPES.Gcr:
        return ArtifactIconByType.Gcr
      case ENABLED_ARTIFACT_TYPES.Ecr:
        return ArtifactIconByType.Ecr
      case ENABLED_ARTIFACT_TYPES.DockerRegistry:
        return ArtifactIconByType.DockerRegistry
      case ENABLED_ARTIFACT_TYPES.Acr:
        return ArtifactIconByType.Acr
      case ENABLED_ARTIFACT_TYPES.AmazonS3:
        return ArtifactIconByType.AmazonS3
      case ENABLED_ARTIFACT_TYPES.Jenkins:
        return ArtifactIconByType.Jenkins
    }
  }
  return 'yaml-builder-trigger'
}

export const getSourceRepoOptions = (getString: UseStringsReturn['getString']): { label: string; value: string }[] => [
  { label: getString('common.repo_provider.githubLabel'), value: GitSourceProviders.GITHUB.value },
  { label: getString('common.repo_provider.gitlabLabel'), value: GitSourceProviders.GITLAB.value },
  { label: getString('common.repo_provider.bitbucketLabel'), value: GitSourceProviders.BITBUCKET.value },
  { label: getString('common.repo_provider.azureRepos'), value: GitSourceProviders.AZURE_REPO.value },
  { label: getString('common.repo_provider.customLabel'), value: GitSourceProviders.CUSTOM.value }
]

const TriggerCategoryToLabelMap: Record<Required<TriggerCatalogItem>['category'], StringKeys> = {
  WEBHOOK: 'execution.triggerType.WEBHOOK',
  ARTIFACT: 'pipeline.artifactTriggerConfigPanel.artifact',
  MANIFEST: 'manifestsText',
  SCHEDULED: 'triggers.scheduledLabel'
}

type TriggerCatalogType =
  | 'Github'
  | 'Gitlab'
  | 'Bitbucket'
  | 'Codecommit'
  | 'GCR'
  | 'ECR'
  | 'DockerRegistry'
  | 'Artifactory'
  | 'ACR'
  | 'AmazonS3'
  | 'Nexus'
  | 'HelmChart'
  | 'Cron'

const TriggerCatalogTypeToLabelMap: Record<TriggerCatalogType, StringKeys> = {
  Github: 'common.repo_provider.githubLabel',
  Gitlab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'common.repo_provider.bitbucketLabel',
  Codecommit: 'common.repo_provider.awscodecommit',
  GCR: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Gcr],
  ECR: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Ecr],
  DockerRegistry: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.DockerRegistry],
  Artifactory: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry],
  ACR: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Acr],
  AmazonS3: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.AmazonS3],
  Nexus: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Nexus3Registry],
  HelmChart: manifestTypeLabels.HelmChart,
  Cron: 'triggers.cronLabel'
}

const TriggerCatalogTypeToValueMap: Record<TriggerCatalogType, string> = {
  Github: GitSourceProviders.GITHUB.value,
  Gitlab: GitSourceProviders.GITLAB.value,
  Bitbucket: GitSourceProviders.BITBUCKET.value,
  Codecommit: GitSourceProviders.AWS_CODECOMMIT.value,
  GCR: ENABLED_ARTIFACT_TYPES.Gcr,
  ECR: ENABLED_ARTIFACT_TYPES.Ecr,
  DockerRegistry: ENABLED_ARTIFACT_TYPES.DockerRegistry,
  Artifactory: ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
  ACR: ENABLED_ARTIFACT_TYPES.Acr,
  AmazonS3: ENABLED_ARTIFACT_TYPES.AmazonS3,
  Nexus: ENABLED_ARTIFACT_TYPES.Nexus3Registry,
  HelmChart: manifestTypeLabels.HelmChart,
  Cron: ScheduleType.Cron
}

const TriggerCatalogTypeToIconMap: Record<TriggerCatalogType, IconName> = {
  Github: GitSourceProviders.GITHUB.iconName,
  Gitlab: GitSourceProviders.GITLAB.iconName,
  Bitbucket: GitSourceProviders.BITBUCKET.iconName,
  Codecommit: GitSourceProviders.AWS_CODECOMMIT.iconName,
  GCR: ArtifactIconByType.Gcr,
  ECR: ArtifactIconByType.Gcr,
  DockerRegistry: ArtifactIconByType.DockerRegistry,
  Artifactory: ArtifactIconByType.ArtifactoryRegistry,
  ACR: ArtifactIconByType.Acr,
  AmazonS3: ArtifactIconByType.AmazonS3,
  Nexus: ArtifactIconByType.Nexus3Registry,
  HelmChart: manifestTypeIcons.HelmChart,
  Cron: TriggerTypeIcons.SCHEDULE
}

export const getTriggerCategoryDrawerMapFromTriggerCatalogItem = (
  getString: UseStringsReturn['getString'],
  triggerCatalogItems: TriggerCatalogItem[]
): AddDrawerMapInterface => {
  const categories: CategoryInterface[] = triggerCatalogItems.map(catalog => {
    const { category, triggerCatalogType } = catalog
    return {
      categoryLabel: (category && getString(TriggerCategoryToLabelMap[category])) ?? '',
      categoryValue: category && (TriggerBaseType[category] as string),
      items: (triggerCatalogType ?? []).map(item => ({
        itemLabel: getString(TriggerCatalogTypeToLabelMap[item]),
        value: TriggerCatalogTypeToValueMap[item],
        iconName: TriggerCatalogTypeToIconMap[item]
      }))
    }
  })

  return {
    drawerLabel: getString('common.triggersLabel'),
    showAllLabel: getString('triggers.showAllTriggers'),
    categories
  }
}

export interface TriggerDataInterface {
  triggerType: string
  sourceRepo?: string
  manifestType?: string
  artifactType?: string
  scheduleType?: string
}

export const getEnabledStatusTriggerValues = ({
  data,
  enabled,
  getString
}: {
  data: any
  enabled: boolean
  getString: UseStringsReturn['getString']
}): { values?: any; error?: string } => {
  try {
    const triggerResponseJson = parse(data?.yaml || '')
    triggerResponseJson.trigger.enabled = enabled
    return { values: triggerResponseJson.trigger }
  } catch (e) {
    return { error: getString('triggers.cannotParseTriggersData') }
  }
}
const TriggerStatus = {
  FAILED: 'FAILED',
  UNKNOWN: 'UNKNOWN',
  ERROR: 'ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAVAILABLE: 'UNAVAILABLE',
  SUCCESS: 'SUCCESS'
}

export const errorStatusList = [
  TriggerStatus.FAILED,
  TriggerStatus.UNKNOWN,
  TriggerStatus.ERROR,
  TriggerStatus.TIMEOUT,
  TriggerStatus.UNAVAILABLE
]
