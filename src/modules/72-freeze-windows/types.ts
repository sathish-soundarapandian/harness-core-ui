/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'

export interface EntityType {
  type: string
  filterType: 'All' | 'Equals' | 'NotEquals'
  entityRefs?: string[]
}

export interface EntityConfig {
  name: string
  entities: EntityType[]
}

export interface ResourcesInterface {
  orgs: SelectOption[]
  projects: SelectOption[]
}
