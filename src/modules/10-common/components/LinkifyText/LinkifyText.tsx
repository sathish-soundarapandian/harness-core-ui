/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, TextProps } from '@wings-software/uicore'
import { tokenize } from 'linkifyjs'

interface BrokenText {
  type: 'TEXT' | 'URL'
  content: string
}

/**
 * adopted from https://github.com/nteract/ansi-to-react/blob/master/src/index.ts#L104
 * @deprecated
 */
export const breakOnLinks = (content = ''): BrokenText[] => {
  const LINK_REGEX = /(\s*|^)(https?:\/\/(?:www\.|(?!www))[^\s.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g
  const nodes: BrokenText[] = []
  let index = 0
  let match: RegExpExecArray | null

  while ((match = LINK_REGEX.exec(content)) !== null) {
    const [, pre, url] = match

    const startIndex = match.index + pre.length

    if (startIndex > index) {
      nodes.push({ type: 'TEXT', content: content.substring(index, startIndex) })
    }

    nodes.push({ type: 'URL', content: url })

    index = LINK_REGEX.lastIndex
  }

  if (index < content.length) {
    nodes.push({ type: 'TEXT', content: content.substring(index) })
  }

  return nodes
}

export const LinkifyText: React.FC<{ content?: string; textProps?: TextProps; linkStyles?: string }> = props => {
  const { content = '', textProps = {}, linkStyles = '' } = props
  const tokens = tokenize(content)
  return (
    <>
      {tokens.map((token, index) => {
        const txt = token.toString()

        if (token.isLink) {
          return (
            <a key={index} href={txt} target="_blank" rel="noreferrer" className={linkStyles}>
              {txt}
            </a>
          )
        } else {
          return (
            <Text key={index} {...textProps} inline>
              {txt}
            </Text>
          )
        }
      })}
    </>
  )
}
