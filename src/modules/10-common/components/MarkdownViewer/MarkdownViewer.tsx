/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { CodeBlock, Container, Text } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'

enum BlockType {
  HEADING = 'HEADING',
  TEXT = 'TEXT',
  CODE = 'CODE'
}

export interface MarkdownViewerProps extends React.ComponentProps<typeof Container> {
  stringId: StringKeys
  vars?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ stringId, vars, ...props }) => {
  const { getString } = useStrings()
  const markdown = getString(stringId, vars)
  const blocks: Array<{ type: BlockType; text: string; opened?: boolean }> = []

  markdown.split(/\n/).reduce((_blocks, line) => {
    if (line.startsWith('#')) {
      _blocks.push({
        type: BlockType.HEADING,
        text: line.substring(1).trim() // remove '#' and trim heading
      })
    } else if (line.trim().startsWith('```')) {
      // start or end a code block
      if (_blocks[_blocks.length - 1].type !== BlockType.CODE) {
        // start
        _blocks.push({
          type: BlockType.CODE,
          text: '',
          opened: true
        })
      } else {
        // end
        delete _blocks[_blocks.length - 1].opened
      }
    } else {
      // last block in _blocks is an opened code block, push lines into it
      if (_blocks.length && _blocks[_blocks.length - 1].type === BlockType.CODE && _blocks[_blocks.length - 1].opened) {
        _blocks[_blocks.length - 1].text += (_blocks[_blocks.length - 1].text.length ? '\n' : '') + line
      } else {
        // text block
        _blocks.push({
          type: BlockType.TEXT,
          text: line
        })
      }
    }

    return _blocks
  }, blocks)

  return (
    <Container {...props}>
      {blocks
        .filter(({ text }) => text.trim().length)
        .map(({ type, text }, index) => {
          const key = type + index

          switch (type) {
            case BlockType.HEADING:
              return (
                <Text
                  key={key}
                  style={{ color: '#333333', fontWeight: 600, lineHeight: '16px' }}
                  margin={{ top: 'xlarge', bottom: 'medium' }}
                >
                  <span dangerouslySetInnerHTML={{ __html: text }} />
                </Text>
              )
            case BlockType.CODE:
              return <CodeBlock key={key} allowCopy format="pre" snippet={text} />
            case BlockType.TEXT:
              return (
                <Text
                  key={key}
                  style={{ color: '#333333', lineHeight: '18px' }}
                  margin={{ top: 'xlarge', bottom: 'medium' }}
                >
                  <span dangerouslySetInnerHTML={{ __html: text }} />
                </Text>
              )
          }
        })}
    </Container>
  )
}
