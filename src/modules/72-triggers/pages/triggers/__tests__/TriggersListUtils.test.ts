/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CategoryInterface } from '@common/components/AddDrawer/AddDrawer'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { manifestTypeLabels } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { StringKeys } from 'framework/strings'
import { getTriggerCategoryDrawerMapFromTriggerCatalogItem, GitSourceProviders } from '../utils/TriggersListUtils'
import { triggerCatalogSuccessResponse } from './TriggerCatalogResponseMockData'

const getString = (key: StringKeys): string => key

describe('Test util methods', () => {
  test('Test getCategoryItems method', () => {
    const triggerCategories = getTriggerCategoryDrawerMapFromTriggerCatalogItem(
      getString,
      triggerCatalogSuccessResponse.data?.catalog ?? []
    ).categories
    const webhookTriggerCategories = triggerCategories.find(
      (item: CategoryInterface) => item.categoryValue === 'Webhook'
    )
    const artifactTriggerCategories = triggerCategories.find(
      (item: CategoryInterface) => item.categoryValue === 'Artifact'
    )
    const manifestTriggerCategories = triggerCategories.find(
      (item: CategoryInterface) => item.categoryValue === 'Manifest'
    )
    const scheduledTriggerCategories = triggerCategories.find(
      (item: CategoryInterface) => item.categoryValue === 'Scheduled'
    )
    expect(triggerCategories.length).toBe(4)
    expect(webhookTriggerCategories).toBeDefined()
    expect(webhookTriggerCategories?.items?.find(item => item.value === Connectors.AZURE_REPO)).toBeDefined()
    expect(webhookTriggerCategories?.items?.length).toBe(5)
    expect(artifactTriggerCategories).toBeDefined()
    expect(manifestTriggerCategories).toBeDefined()
    expect(scheduledTriggerCategories).toBeDefined()
    expect(webhookTriggerCategories?.items?.length).toBe(4)
    expect(artifactTriggerCategories?.items?.length).toBe(6)
    expect(manifestTriggerCategories?.items?.length).toBe(1)
    expect(scheduledTriggerCategories?.items?.length).toBe(1)
    expect(webhookTriggerCategories?.items?.find(item => item.value === GitSourceProviders.GITHUB.value)).toBeDefined()
    expect(webhookTriggerCategories?.items?.find(item => item.value === GitSourceProviders.GITLAB.value)).toBeDefined()
    expect(
      webhookTriggerCategories?.items?.find(item => item.value === GitSourceProviders.BITBUCKET.value)
    ).toBeDefined()
    expect(
      webhookTriggerCategories?.items?.find(item => item.value === GitSourceProviders.AWS_CODECOMMIT.value)
    ).toBeDefined()
    expect(artifactTriggerCategories?.items?.find(item => item.value === ENABLED_ARTIFACT_TYPES.Gcr)).toBeDefined()
    expect(artifactTriggerCategories?.items?.find(item => item.value === ENABLED_ARTIFACT_TYPES.Ecr)).toBeDefined()
    expect(
      artifactTriggerCategories?.items?.find(item => item.value === ENABLED_ARTIFACT_TYPES.DockerRegistry)
    ).toBeDefined()
    expect(
      artifactTriggerCategories?.items?.find(item => item.value === ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry)
    ).toBeDefined()
    expect(artifactTriggerCategories?.items?.find(item => item.value === ENABLED_ARTIFACT_TYPES.Acr)).toBeDefined()
    expect(artifactTriggerCategories?.items?.find(item => item.value === ENABLED_ARTIFACT_TYPES.AmazonS3)).toBeDefined()
    expect(manifestTriggerCategories?.items?.find(item => item.value === manifestTypeLabels.HelmChart)).toBeDefined()
    expect(scheduledTriggerCategories?.items?.find(item => item.value === 'Cron')).toBeDefined()
  })
})
