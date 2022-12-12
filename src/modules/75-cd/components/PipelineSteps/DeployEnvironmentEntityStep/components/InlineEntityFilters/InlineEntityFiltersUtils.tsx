/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { StringKeys } from 'framework/strings'

export enum InlineEntityFiltersRadioType {
  MANUAL = 'manual',
  FILTERS = 'filters'
}

export interface InlineEntityFiltersProps {
  filterPrefix: string
  readonly: boolean
  entityStringKey: StringKeys
  onRadioValueChange?(selectedRadioValue: InlineEntityFiltersRadioType): void
  showCard?: boolean
  hasTopMargin?: boolean
  baseComponent: React.ReactElement
  entityFilterListProps: {
    entities: EntityType[]
    filters: EntityFilterType[]
    defaultFilterType?: EntityFilterType
    placeholderProps: {
      entity: string
      tags: string
    }
    allowableTypes: AllowedTypes
  }
  gridAreaProps?: {
    headerAndRadio: string
    content: string
  }
}

export enum EntityType {
  ENVIRONMENTS = 'environments',
  INFRASTRUCTURES = 'infrastructures',
  CLUSTERS = 'gitOpsClusters'
}

export enum EntityFilterType {
  ALL = 'all',
  TAGS = 'tags'
}

export const entityTypeStringsMap: Record<EntityType, StringKeys> = {
  environments: 'environments',
  infrastructures: 'common.infrastructures',
  gitOpsClusters: 'common.clusters'
}

export const entityFilterTypeStringsMap: Record<EntityFilterType, StringKeys> = {
  all: 'all',
  tags: 'tagsLabel'
}

export type EntityFilterListProps = InlineEntityFiltersProps['entityFilterListProps'] & {
  filterPrefix: string
  readonly: boolean
}
