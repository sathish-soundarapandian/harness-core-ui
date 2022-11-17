/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import TagsRenderer, { ListTagsProps } from '@common/components/TagsRenderer/TagsRenderer'
import css from './TemplateTags.module.scss'

export const TemplateTags: React.FC<ListTagsProps> = (props): JSX.Element => {
  const { tags } = props
  const [length, setLength] = React.useState(Object.keys(tags).length)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useLayoutEffect(() => {
    setLength(Object.keys(tags).length)
  }, [JSON.stringify(tags)])

  React.useLayoutEffect(() => {
    const currentHeight = ref?.current?.clientHeight
    if (currentHeight && currentHeight > 24) {
      setLength(length - 1)
    }
  }, [length])

  return (
    <Container className={css.container}>
      <Container ref={ref}>
        <TagsRenderer
          className={css.tagsContainer}
          tagClassName={css.tag}
          targetClassName={css.count}
          {...props}
          length={length}
        />
      </Container>
    </Container>
  )
}
