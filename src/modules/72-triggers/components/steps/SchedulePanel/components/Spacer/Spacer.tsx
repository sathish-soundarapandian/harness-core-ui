/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@wings-software/uicore'
import css from './Spacer.module.scss'

interface SpacerInterface {
  paddingTop?: string
  paddingBottom?: string
  width?: string
  marginLeft?: string
}

export default function Spacer(props: SpacerInterface): JSX.Element {
  const { paddingTop, paddingBottom, marginLeft, width } = props
  return (
    <Container
      style={{
        paddingTop: `${paddingTop ? paddingTop : '0'}`,
        paddingBottom: `${paddingBottom ? paddingBottom : '0'}`,
        marginLeft: `${marginLeft ? marginLeft : '0'}`,
        width: `${width ? width : '100%'}`
      }}
      className={css.spacer}
    >
      <Container />
    </Container>
  )
}
