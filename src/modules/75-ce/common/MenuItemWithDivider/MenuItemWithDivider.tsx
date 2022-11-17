/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout } from '@harness/uicore'

import css from './MenuItemWithDivider.module.scss'

const MenuItemWithDivider: React.FC<{ text: string }> = ({ text }) => {
  return (
    <Layout.Horizontal
      spacing="small"
      padding={{
        left: 'small',
        right: 'small'
      }}
    >
      <Text font="small">
        <div className={css.menuItemDividerText}>{text}</div>
      </Text>
      <div className={css.divider} />
    </Layout.Horizontal>
  )
}

export default MenuItemWithDivider
