/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CategoryInterface } from '@common/components/AddDrawer/AddDrawer'
import { Connectors } from '@connectors/constants'
import type { StringKeys } from 'framework/strings'
import { getCategoryItems } from '../utils/TriggersListUtils'

const getString = (key: StringKeys): string => key

describe('Test util methods', () => {
  test('Test getCategoryItems method', () => {
    let triggerCategories = getCategoryItems(getString, false).categories
    expect(triggerCategories.length).toBe(5)
    let webhookTriggerCategories = triggerCategories.find((item: CategoryInterface) => item.categoryValue === 'Webhook')
    expect(webhookTriggerCategories).toBeDefined()
    expect(webhookTriggerCategories?.items?.length).toBe(5)

    // with AZURE_REPO_CONNECTOR FF enabled
    triggerCategories = getCategoryItems(getString, true).categories
    expect(triggerCategories.length).toBe(5)
    webhookTriggerCategories = triggerCategories.find((item: CategoryInterface) => item.categoryValue === 'Webhook')
    expect(webhookTriggerCategories).toBeDefined()
    expect(webhookTriggerCategories?.items?.find(item => item.value === Connectors.AZURE_REPO)).toBeDefined()
    expect(webhookTriggerCategories?.items?.length).toBe(6)
  })
})
