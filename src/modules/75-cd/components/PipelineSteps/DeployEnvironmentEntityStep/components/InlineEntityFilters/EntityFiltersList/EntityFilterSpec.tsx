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

import { isValueRuntimeInput } from '@common/utils/utils'

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
     * 4 conditions with matchType and tags
     * 1. Both Runtime
     * 2. Match Type Runtime
     * 3. Tags Runtime
     * 4. None Runtime
     *  */

    if (isMatchTypeRuntime && isTagsRuntime) {
      return <>{RUNTIME_INPUT_VALUE}</>
    } else if (isMatchTypeRuntime) {
      return (
        <Layout.Horizontal>
          {RUNTIME_INPUT_VALUE}
          <TagsPopover tags={defaultTo(spec?.tags, {})} target={<TagsPopoverTarget tags={spec?.tags} />} />
        </Layout.Horizontal>
      )
    } else if (isTagsRuntime) {
      return (
        <>
          {getString(entityFilterMatchTypeStringsMap[spec?.matchType as EntityFilterMatchType])} - {RUNTIME_INPUT_VALUE}
        </>
      )
    } else {
      return (
        <Layout.Horizontal>
          {getString(entityFilterMatchTypeStringsMap[spec?.matchType as EntityFilterMatchType])}
          <TagsPopover tags={defaultTo(spec?.tags, {})} target={<TagsPopoverTarget tags={spec?.tags} />} />
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

    finalTagString += (standAlone ? '' : i === 0 ? '\xa0-\xa0' : ',\xa0') + (value ? `${key}:${value}` : key)
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
