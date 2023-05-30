/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color, FontVariation, StyledProps } from '@harness/design-system'

interface ListProps extends StyledProps {
  title: string
  content: string
}

const List: React.FC<ListProps> = props => {
  const { title, content, ...rest } = props

  return (
    <Container {...rest}>
      <Text
        font={{ variation: FontVariation.H6, weight: 'semi-bold' }}
        color={Color.GREY_900}
        margin={{ bottom: 'xlarge' }}
      >
        {title}
      </Text>
      <Text font={{ variation: FontVariation.BODY, weight: 'light' }} color={Color.GREY_600}>
        {content}
      </Text>
    </Container>
  )
}

export default List
