/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Menu } from '@blueprintjs/core'
import { Layout, SelectOption, Text, TextProps } from '@harness/uicore'
import type { IItemRendererProps } from '@blueprintjs/select'
import type { SelectWithBiLevelOption } from '@harness/uicore/dist/components/Select/BiLevelSelect'
interface ItemRendererWithMenuItemProps {
  item: SelectOption | SelectWithBiLevelOption
  itemProps: IItemRendererProps
  disabled?: boolean
  style?: TextProps
  icon?: IconName
}

const ItemRendererWithMenuItem = ({
  item,
  itemProps,
  disabled = false,
  style,
  icon
}: ItemRendererWithMenuItemProps): React.ReactElement => {
  const { handleClick } = itemProps
  return (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small" {...style}>
            <Text icon={icon}>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={disabled}
        onClick={handleClick}
      />
    </div>
  )
}

export default ItemRendererWithMenuItem
