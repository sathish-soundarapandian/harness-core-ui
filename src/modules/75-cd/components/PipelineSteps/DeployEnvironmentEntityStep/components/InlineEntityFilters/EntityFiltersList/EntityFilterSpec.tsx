/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty, isNil } from 'lodash-es'

import { Layout, RUNTIME_INPUT_VALUE, TagsPopover, Text } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { FilterSpec, FilterYaml } from 'services/cd-ng'

import { isValueFixed, isValueRuntimeInput } from '@common/utils/utils'

import {
  EntityFilterMatchType,
  entityFilterMatchTypeStringsMap
} from '../AddEditEntityFilterModal/AddEditEntityFilterModal.types'

export default function EntityFilterSpec({
  type,
  spec
}: {
  type: FilterYaml['type']
  spec?: FilterSpec
}): React.ReactElement {
  const { getString } = useStrings()
  const isSpecPresent = !isEmpty(spec) && !isNil(spec)

  if (!isSpecPresent) {
    return <>-</>
  }

  if (type === 'tags' && spec?.matchType && spec?.tags) {
    const isMatchTypeRuntime = isValueRuntimeInput(spec?.matchType)
    const isTagsRuntime = isValueRuntimeInput(spec?.tags)

    /**
     * 2 exclusive conditions with matchType and tags
     * 1. Both Runtime
     * 2. Any other combination
     *  */

    if (isMatchTypeRuntime && isTagsRuntime) {
      return <>{RUNTIME_INPUT_VALUE}</>
    } else {
      const matchTypeValue = isValueFixed(spec?.matchType)
        ? getString(entityFilterMatchTypeStringsMap[spec?.matchType as EntityFilterMatchType])
        : spec?.matchType

      const tagsValue = isValueFixed(spec?.tags) ? (
        <TagsPopover tags={defaultTo(spec?.tags, {})} target={<TagsPopoverTarget tags={spec?.tags} />} />
      ) : (
        `\xa0-\xa0${spec.tags}`
      )

      return (
        <Layout.Horizontal>
          {matchTypeValue}
          {tagsValue}
        </Layout.Horizontal>
      )
    }
  } else {
    return <>-</>
  }
}

export function TagsPopoverTarget({
  tags,
  standAlone
}: {
  tags: { [key: string]: string }
  standAlone?: boolean
}): React.ReactElement {
  const tagsKeys = Object.keys(tags)
  let finalTagString = ''

  for (let i = 0; i < Math.min(tagsKeys.length, 2); i++) {
    const key = tagsKeys[i]
    const value = tags[key]

    finalTagString += (i === 0 ? (standAlone ? '' : '\xa0-\xa0') : ',\xa0') + (value ? `${key}:${value}` : key)
  }

  return (
    <Layout.Horizontal>
      <Text
        lineClamp={1}
        tooltipProps={{
          isOpen: false
        }}
      >
        {finalTagString}
      </Text>
      {tagsKeys.length - 2 > 0 && <Text>{`\xa0(+${tagsKeys.length - 2})`}</Text>}
    </Layout.Horizontal>
  )
}
