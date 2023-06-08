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
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
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
    return webhookSourceRepoIconName as IconName
  } else if (type === TriggerTypes.SCHEDULE) {
    return TriggerTypeIcons.SCHEDULE as IconName
  } else if (type === TriggerTypes.MANIFEST && buildType) {
    if (buildType === ManifestDataType.HelmChart) {
      return manifestTypeIcons.HelmChart
    }
  } else if (type === TriggerTypes.ARTIFACT && buildType) {
    return ArtifactIconByType[buildType as ArtifactType]
  }
  return 'yaml-builder-trigger'
}

export const getSourceRepoOptions = (getString: (str: StringKeys) => string): { label: string; value: string }[] => [
  { label: getString('common.repo_provider.githubLabel'), value: GitSourceProviders.GITHUB.value },
  { label: getString('common.repo_provider.gitlabLabel'), value: GitSourceProviders.GITLAB.value },
  { label: getString('common.repo_provider.bitbucketLabel'), value: GitSourceProviders.BITBUCKET.value },
  { label: getString('common.repo_provider.azureRepos'), value: GitSourceProviders.AZURE_REPO.value },
  { label: getString('common.repo_provider.customLabel'), value: GitSourceProviders.CUSTOM.value }
]

export interface ItemInterface {
  itemLabel: string
  iconName: IconName
  value: string
  visible?: boolean
  disabled?: boolean
  categoryValue?: string
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
  getString: (key: StringKeys) => string
}): { values?: any; error?: string } => {
  try {
    const triggerResponseJson = parse(data?.yaml || '')
    triggerResponseJson.trigger.enabled = enabled
    return { values: triggerResponseJson.trigger }
  } catch (e) {
    return { error: getString('triggers.cannotParseTriggersData') }
  }
}

export enum TriggerStatusEnum {
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
  SUCCESS = 'SUCCESS'
}

const TriggerCategoryToLabelMap: Record<Required<TriggerCatalogItem>['category'], StringKeys> = {
  Webhook: 'execution.triggerType.WEBHOOK',
  Artifact: 'pipeline.artifactTriggerConfigPanel.artifact',
  MultiRegionArtifact: 'pipeline.artifactTriggerConfigPanel.artifact',
  Manifest: 'manifestsText',
  Scheduled: 'triggers.scheduledLabel'
}

type TriggerCatalogType = Required<TriggerCatalogItem>['triggerCatalogType'][number]

const TriggerCatalogTypeToLabelMap: Record<TriggerCatalogType, StringKeys> = {
  Github: 'common.repo_provider.githubLabel',
  Gitlab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'common.repo_provider.bitbucketLabel',
  AwsCodeCommit: 'common.repo_provider.awscodecommit',
  Custom: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.CustomArtifact],
  Gcr: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Gcr],
  Ecr: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Ecr],
  DockerRegistry: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.DockerRegistry],
  ArtifactoryRegistry: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry],
  Acr: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Acr],
  AmazonS3: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.AmazonS3],
  GoogleArtifactRegistry: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry],
  CustomArtifact: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.CustomArtifact],
  GithubPackageRegistry: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.GithubPackageRegistry],
  Nexus2Registry: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Nexus2Registry],
  Nexus3Registry: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Nexus3Registry],
  Jenkins: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Jenkins],
  AzureArtifacts: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.AzureArtifacts],
  AmazonMachineImage: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.AmazonMachineImage],
  GoogleCloudStorage: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.GoogleCloudStorage],
  Bamboo: ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Bamboo],
  HelmChart: manifestTypeLabels.HelmChart,
  Cron: 'triggers.cronLabel'
}

const TriggerCatalogTypeToIconMap: Record<TriggerCatalogType, IconName> = {
  Github: GitSourceProviders.GITHUB.iconName,
  Gitlab: GitSourceProviders.GITLAB.iconName,
  Bitbucket: GitSourceProviders.BITBUCKET.iconName,
  AwsCodeCommit: GitSourceProviders.AWS_CODECOMMIT.iconName,
  Custom: GitSourceProviders.CUSTOM.iconName,
  Gcr: ArtifactIconByType.Gcr,
  Ecr: ArtifactIconByType.Ecr,
  DockerRegistry: ArtifactIconByType.DockerRegistry,
  ArtifactoryRegistry: ArtifactIconByType.ArtifactoryRegistry,
  Acr: ArtifactIconByType.Acr,
  AmazonS3: ArtifactIconByType.AmazonS3,
  GoogleArtifactRegistry: ArtifactIconByType.GoogleArtifactRegistry,
  GithubPackageRegistry: ArtifactIconByType.GithubPackageRegistry,
  CustomArtifact: ArtifactIconByType.CustomArtifact,
  Nexus2Registry: ArtifactIconByType.Nexus2Registry,
  Nexus3Registry: ArtifactIconByType.Nexus3Registry,
  Jenkins: ArtifactIconByType.Jenkins,
  AzureArtifacts: ArtifactIconByType.AzureArtifacts,
  AmazonMachineImage: ArtifactIconByType.AmazonMachineImage,
  GoogleCloudStorage: ArtifactIconByType.GoogleCloudStorage,
  Bamboo: ArtifactIconByType.Bamboo,
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
      categoryLabel: getString(TriggerCategoryToLabelMap[category]),
      categoryValue: category,
      items: triggerCatalogType.map(item => ({
        itemLabel: getString(TriggerCatalogTypeToLabelMap[item]),
        value: item,
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
