/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty, isNil } from 'lodash-es'

import { AllowedTypes, RUNTIME_INPUT_VALUE, Text } from '@harness/uicore'

import type { FilterSpec } from 'services/cd-ng'

import type { UseStringsReturn } from 'framework/strings'

import { isValueRuntimeInput } from '@common/utils/utils'

import {
  AddEditEntityFilterProps,
  EntityFilterMatchType,
  entityFilterMatchTypeStringsMap
} from '../AddEditEntityFilterModal/AddEditEntityFilterModal.types'

import css from './EntityFilterList.module.scss'

export function formatTagsObject(tags: FilterSpec): string | React.ReactElement[] {
  if (isEmpty(tags) || isNil(tags)) {
    return ' - '
  }

  const tagKeys = Object.keys(tags)

  return tagKeys.map((tagKey, index) => {
    return (
      <>
        {index !== 0 ? ', ' : ''}
        <Text key={tagKey} lineClamp={1} className={css.readonlyTags} inline>
          {tagKey + (tags[tagKey] ? `:${tags[tagKey]}` : '')}
        </Text>
      </>
    )
  })
}

export function renderFilterSpec(
  spec: FilterSpec,
  getString: UseStringsReturn['getString']
): string | React.ReactElement {
  const isSpecPresent = !isEmpty(spec) && !isNil(spec)

  if (!isSpecPresent) {
    return '-'
  }

  return isValueRuntimeInput(spec.tags) ? (
    RUNTIME_INPUT_VALUE
  ) : (
    <>
      <Text font={{ weight: 'bold' }}>
        {getString(entityFilterMatchTypeStringsMap[spec.matchType as EntityFilterMatchType])}
      </Text>
      &nbsp;{'-'}&nbsp;
      {formatTagsObject(spec.tags)}
    </>
  )
}

export type EntityFilterListProps = AddEditEntityFilterProps & {
  filterPrefix: string
  readonly: boolean
  allowableTypes: AllowedTypes
}
