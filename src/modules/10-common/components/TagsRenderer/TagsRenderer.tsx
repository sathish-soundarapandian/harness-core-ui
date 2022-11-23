/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout, Tag, TagsPopover, tagsType } from '@harness/uicore'
import { useStrings } from 'framework/strings'

export interface ListTagsProps {
  tags: tagsType
  length?: number
  className?: string
  tagClassName?: string
  width?: number
  targetClassName?: string
}

const getWidthForTags = (length: number, width: number): number => {
  switch (length) {
    case 1:
      return width
    case 2:
      return width / 2
    default:
      return width / 3
  }
}
const TagsRenderer: React.FC<ListTagsProps> = props => {
  const { tags, length = 3, className, width = 240, tagClassName, targetClassName } = props
  const baseTags = Object.keys(tags).slice(0, length)
  const remainingTags = Object.keys(tags)
    .slice(length)
    .reduce((result: tagsType, key) => {
      result[key] = tags[key]
      return result
    }, {})
  const { getString } = useStrings()
  return (
    <>
      <Layout.Horizontal spacing="xsmall" className={className}>
        {baseTags.map(key => {
          const value = tags[key]
          return (
            <Tag style={{ maxWidth: getWidthForTags(baseTags.length, width) }} className={tagClassName} key={key}>
              {value ? `${key}:${value}` : key}
            </Tag>
          )
        })}
        {Object.keys(tags).length - length > 0 && (
          <TagsPopover
            tags={remainingTags}
            tagClassName={tagClassName}
            target={<Text className={targetClassName}>{getString('plus') + (Object.keys(tags).length - length)}</Text>}
          />
        )}
      </Layout.Horizontal>
    </>
  )
}

export default TagsRenderer
