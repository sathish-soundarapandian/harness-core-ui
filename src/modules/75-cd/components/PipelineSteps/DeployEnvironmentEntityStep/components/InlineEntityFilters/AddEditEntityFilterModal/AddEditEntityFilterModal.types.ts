/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { StringKeys } from 'framework/strings'
import type { EnvSwaggerObjectWrapper, TagsFilter } from 'services/cd-ng'
import type { FilterYaml } from '../../../types'

export type EntityType = Required<EnvSwaggerObjectWrapper>['envFilterEntityType']

export const entityTypeStringsMap: Record<EntityType, StringKeys> = {
  environments: 'environments',
  infrastructures: 'common.infrastructures',
  gitOpsClusters: 'common.clusters'
}

export type EntityFilterType = FilterYaml['type']

export const entityFilterTypeStringsMap: Record<EntityFilterType, StringKeys> = {
  all: 'all',
  tags: 'tagsLabel'
}

export type EntityFilterMatchType = TagsFilter['matchType']

export const entityFilterMatchTypeStringsMap: Record<EntityFilterMatchType, StringKeys> = {
  all: 'all',
  any: 'common.any'
}

export interface AddEditEntityFilterModalState {
  isOpen: boolean
  index: number
  initialValues: FilterYaml
}

export interface AddEditEntityFilterProps {
  entities: EntityType[]
  filters?: EntityFilterType[]
}

export type AddEditEntityFilterModalProps = AddEditEntityFilterModalState &
  AddEditEntityFilterProps & {
    allEntityFilterIdentifiers: string[]
    onClose(index?: number, filter?: FilterYaml): void
    allowableTypes: AllowedTypes
  }

export interface AddEditEntityFilterFormState extends Omit<FilterYaml, 'entities'> {
  entities: SelectOption[]
}
