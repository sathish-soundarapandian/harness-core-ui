/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'

interface TagViewerProps {
  style?: React.CSSProperties
  tag: string
}

const TagViewer: React.FC<TagViewerProps> = ({ tag, style }) => (
  <Text
    style={{
      padding: '4px var(--spacing-small)',
      display: 'inline-block',
      color: 'var(--primary-9)',
      background: 'var(--grey-100)',
      borderRadius: '4px',
      fontSize: '10px',
      ...style
    }}
  >
    {tag}
  </Text>
)

export interface TagsViewerProps {
  tags: string[] | null | undefined
  style?: React.CSSProperties
}

export const TagsViewer: React.FC<TagsViewerProps> = ({ tags, style }) => (
  <Container
    style={{
      display: 'inline-flex',
      flexWrap: 'wrap' /*, gap: 'var(--spacing-xsmall)' -> Safari does not support it yet (Feb 2021) :( */,
      margin: 'calc(-1 * var(--spacing-xsmall)) 0 0 calc(-1 * var(--spacing-xsmall))',
      width: 'calc(100% + var(--spacing-xsmall))'
    }}
  >
    {tags?.map(tag => (
      <TagViewer key={tag} tag={tag} style={{ margin: 'var(--spacing-xsmall) 0 0 var(--spacing-xsmall)', ...style }} />
    ))}
  </Container>
)
