/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text, Popover, IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Classes, PopoverInteractionKind } from '@blueprintjs/core'
import css from './ActivityStack.module.scss'

export interface ActivityStackItems {
  name: string
  icon: IconName
  color: string
  lastUpdatedAt: string
  activity?: string
  updatedBy?: string
}

interface ActivityStackProps {
  items: ActivityStackItems[]
  tooltip: (item: ActivityStackItems) => void
}

const ActivityStack: React.FC<ActivityStackProps> = ({ items, tooltip }) => {
  return (
    <>
      {items.map((value: ActivityStackItems, index: number) => (
        <>
          <div>
            <Popover interactionKind={PopoverInteractionKind.HOVER} boundary="viewport" popoverClassName={Classes.DARK}>
              <div>
                <Layout.Horizontal className={css.alignCenter}>
                  <div className={css.circle} style={{ backgroundColor: value.color }}>
                    <Icon name={value.icon} className={css.icon} />
                  </div>
                  <Layout.Vertical padding="xsmall">
                    <Text font="normal" color={Color.BLACK}>
                      {value.name}
                    </Text>
                    <Text font="small">{value.lastUpdatedAt}</Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
              </div>
              {tooltip(value)}
            </Popover>
          </div>
          {index != items.length - 1 ? <div className={css.connector} /> : null}
        </>
      ))}
    </>
  )
}

export default ActivityStack
