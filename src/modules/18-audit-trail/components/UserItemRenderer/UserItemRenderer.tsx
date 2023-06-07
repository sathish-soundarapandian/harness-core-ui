/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { MouseEventHandler } from 'react'
import { Layout, Text, Avatar, MultiSelectOption } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { Menu } from '@blueprintjs/core'

export interface UserItem extends MultiSelectOption {
  email?: string
}

interface UserItemRendererProps {
  item: UserItem
  handleClick: MouseEventHandler<HTMLElement>
}

const UserItemRenderer: React.FC<UserItemRendererProps> = ({ handleClick, item }) => {
  return (
    <Menu.Item
      key={item.value.toString()}
      text={
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
          <Avatar name={item.label} email={item.email || item.value.toString()} size="small" hoverCard={false} />
          <Layout.Vertical padding={{ left: 'small' }}>
            <Text color={Color.BLACK}>{item.label}</Text>
            <Text color={Color.GREY_700}>{item.email || item.value}</Text>
          </Layout.Vertical>
        </Layout.Horizontal>
      }
      onClick={handleClick}
    />
  )
}

export default UserItemRenderer
