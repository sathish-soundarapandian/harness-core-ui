/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import css from './ItemContainer.module.scss'

export interface ItemContainerProps extends React.ComponentProps<typeof Container> {
  clickable?: boolean
}

const ClickableProps = { role: 'button', tabIndex: 0, className: css.withHover }

export const ItemContainer: React.FC<ItemContainerProps> = ({ style, children, clickable, ...props }) => {
  return (
    <Container
      {...(clickable ? ClickableProps : undefined)}
      padding="medium"
      style={{
        boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.08), 0px 0.5px 2px rgba(96, 97, 112, 0.16)',
        borderRadius: '8px',
        background: 'var(--white)',
        paddingLeft: 'var(--spacing-medium)',
        ...style
      }}
      {...props}
    >
      {children}
    </Container>
  )
}
