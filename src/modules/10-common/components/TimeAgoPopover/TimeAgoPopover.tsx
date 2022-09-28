/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Popover, Container, TextProps, Layout, IconName } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { Classes, IPopoverProps, PopoverInteractionKind, Position } from '@blueprintjs/core'

import ReactTimeago from 'react-timeago'

export interface TimeAgoPopoverProps extends TextProps, React.ComponentProps<typeof ReactTimeago> {
  time: number
  popoverProps?: IPopoverProps
  icon?: IconName
  className?: string
}
export const TimeAgoPopover: React.FC<TimeAgoPopoverProps> = props => {
  const { time, popoverProps, icon, className, ...textProps } = props
  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.TOP}
      className={Classes.DARK}
      modifiers={{ preventOverflow: { escapeWithReference: true } }}
      {...popoverProps}
    >
      <Text inline {...textProps} icon={icon} className={className}>
        <ReactTimeago date={time} live title={''} />
      </Text>
      <Container padding="medium">
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'small'}>
          <Text font={{ size: 'xsmall', weight: 'semi-bold' }} color={Color.GREY_200}>
            DATE
          </Text>
          <Text font={{ size: 'small', weight: 'bold' }} color={Color.WHITE}>
            {new Date(time).toLocaleDateString()}
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal margin={{ top: 'small' }} flex={{ justifyContent: 'flex-start' }} spacing={'small'}>
          <Text font={{ size: 'xsmall', weight: 'semi-bold' }} color={Color.GREY_200}>
            TIME
          </Text>
          <Text font={{ size: 'small', weight: 'bold' }} color={Color.WHITE}>
            {new Date(time).toLocaleTimeString()}
          </Text>
        </Layout.Horizontal>
      </Container>
    </Popover>
  )
}
