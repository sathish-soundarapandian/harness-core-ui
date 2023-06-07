/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Avatar } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { isEmail } from '@common/utils/Validation'
import type { UserItem } from '../UserItemRenderer/UserItemRenderer'

interface UserItemRendererProps {
  item: UserItem
  validate?: boolean
}

const UserItemRenderer: React.FC<UserItemRendererProps> = ({ item, validate = false }) => {
  return (
    <Layout.Horizontal key={item.value.toString()} flex spacing="small">
      <Avatar name={item.label} email={item.value.toString()} size="xsmall" hoverCard={false} />
      <Text color={validate && !isEmail(item.value.toString().toLowerCase()) ? Color.RED_500 : Color.BLACK}>
        {item.label}
      </Text>
    </Layout.Horizontal>
  )
}

export default UserItemRenderer
