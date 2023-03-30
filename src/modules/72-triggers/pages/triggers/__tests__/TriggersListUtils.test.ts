/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CategoryInterface } from '@common/components/AddDrawer/AddDrawer'
import { Connectors } from '@connectors/constants'
import { TriggerBaseType } from '@triggers/components/Triggers/TriggerInterface'
import type { StringKeys } from 'framework/strings'
import type { TriggerCatalogResponse } from 'services/pipeline-ng'
import { getCategoryItems, getTriggerCategoryDrawerMapFromTriggerCatalogItem } from '../utils/TriggersListUtils'
import { triggerCatalogSuccessResponse } from './TriggerCatalogResponseMockData'

const getString = (key: StringKeys): string => key

const getTriggerCategoryData =
  (triggerCategories: CategoryInterface[]) =>
  (categoryValue: TriggerBaseType): CategoryInterface =>
    triggerCategories.find(triggerCategory => triggerCategory.categoryValue === categoryValue) as CategoryInterface

const webhookTriggerCategoryItems = [
  {
    itemLabel: 'common.repo_provider.githubLabel',
    value: 'Github',
    iconName: 'github'
  },
  {
    itemLabel: 'common.repo_provider.gitlabLabel',
    value: 'Gitlab',
    iconName: 'service-gotlab'
  },
  {
    itemLabel: 'common.repo_provider.bitbucketLabel',
    value: 'Bitbucket',
    iconName: 'bitbucket-selected'
  },
  {
    itemLabel: 'common.repo_provider.awscodecommit',
    value: 'AwsCodeCommit',
    iconName: 'service-aws-code-deploy'
  },
  {
    itemLabel: 'common.repo_provider.customLabel',
    value: 'Custom',
    iconName: 'build'
  }
]

const artifactTriggerCategoryItems = [
  {
    itemLabel: 'connectors.GCR.name',
    value: 'Gcr',
    iconName: 'service-gcp'
  },
  {
    itemLabel: 'connectors.ECR.name',
    value: 'Ecr',
    iconName: 'ecr-step'
  },
  {
    itemLabel: 'dockerRegistry',
    value: 'DockerRegistry',
    iconName: 'service-dockerhub'
  },
  {
    itemLabel: 'connectors.artifactory.artifactoryLabel',
    value: 'ArtifactoryRegistry',
    iconName: 'service-artifactory'
  },
  {
    itemLabel: 'pipeline.ACR.name',
    value: 'Acr',
    iconName: 'service-azure'
  },
  {
    itemLabel: 'pipeline.artifactsSelection.amazonS3Title',
    value: 'AmazonS3',
    iconName: 'service-service-s3'
  },
  {
    itemLabel: 'pipeline.artifactsSelection.googleArtifactRegistryTitle',
    value: 'GoogleArtifactRegistry',
    iconName: 'service-gar'
  },
  {
    itemLabel: 'common.repo_provider.customLabel',
    value: 'CustomArtifact',
    iconName: 'custom-artifact'
  },
  {
    itemLabel: 'pipeline.artifactsSelection.githubPackageRegistryTitle',
    value: 'GithubPackageRegistry',
    iconName: 'service-github-package'
  }
]

const manifestTriggerCategoryItems = [
  {
    itemLabel: 'common.HelmChartLabel',
    value: 'HelmChart',
    iconName: 'service-helm'
  }
]

const scheduledTriggerCategoryItems = [
  {
    itemLabel: 'triggers.cronLabel',
    value: 'Cron',
    iconName: 'trigger-schedule'
  }
]

describe('Test util methods', () => {
  test('Test getCategoryItems method', () => {
    const triggerCategories = getCategoryItems(getString, true, true, true, true).categories
    let webhookTriggerCategories = triggerCategories.find((item: CategoryInterface) => item.categoryValue === 'Webhook')
    expect(triggerCategories.length).toBe(5)
    webhookTriggerCategories = triggerCategories.find((item: CategoryInterface) => item.categoryValue === 'Webhook')
    expect(webhookTriggerCategories).toBeDefined()
    expect(webhookTriggerCategories?.items?.find(item => item.value === Connectors.AZURE_REPO)).toBeDefined()
    expect(webhookTriggerCategories?.items?.length).toBe(5)
  })

  test('Test getTriggerCategoryDrawerMapFromTriggerCatalogItem method', () => {
    const triggerCategoryDrawerData = getTriggerCategoryDrawerMapFromTriggerCatalogItem(
      getString,
      (triggerCatalogSuccessResponse.data as TriggerCatalogResponse).catalog
    )
    expect(triggerCategoryDrawerData.drawerLabel).toBe(getString('common.triggersLabel'))
    expect(triggerCategoryDrawerData.showAllLabel).toBe(getString('triggers.showAllTriggers'))

    const triggerCategories = triggerCategoryDrawerData.categories
    expect(triggerCategories.length).toBe(4)

    const getCategoryData = getTriggerCategoryData(triggerCategories)
    const webhookTriggerCategory = getCategoryData(TriggerBaseType.WEBHOOK)
    expect(webhookTriggerCategory.categoryLabel).toBe(getString('execution.triggerType.WEBHOOK'))
    expect(webhookTriggerCategory.items).toEqual(webhookTriggerCategoryItems)

    const artifactTriggerCategory = getCategoryData(TriggerBaseType.ARTIFACT)
    expect(artifactTriggerCategory.categoryLabel).toBe(getString('pipeline.artifactTriggerConfigPanel.artifact'))
    expect(artifactTriggerCategory.items).toEqual(artifactTriggerCategoryItems)

    const manifestTriggerCategory = getCategoryData(TriggerBaseType.MANIFEST)
    expect(manifestTriggerCategory.categoryLabel).toBe(getString('manifestsText'))
    expect(manifestTriggerCategory.items).toEqual(manifestTriggerCategoryItems)

    const scheduledTriggerCategory = getCategoryData(TriggerBaseType.SCHEDULE)
    expect(scheduledTriggerCategory.categoryLabel).toBe(getString('triggers.scheduledLabel'))
    expect(scheduledTriggerCategory.items).toEqual(scheduledTriggerCategoryItems)
  })
})
