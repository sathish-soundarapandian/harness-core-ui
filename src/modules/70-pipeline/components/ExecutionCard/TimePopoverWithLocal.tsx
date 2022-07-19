/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Text, Popover, TextProps, Layout, IconName } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Classes, IPopoverProps, PopoverInteractionKind, Position } from '@blueprintjs/core'

import ReactTimeago from 'react-timeago'
import moment from 'moment'
import css from './ExecutionCard.module.scss'

export interface TimePopoverProps extends TextProps, React.ComponentProps<typeof ReactTimeago> {
  time: number
  popoverProps?: IPopoverProps
  icon?: IconName
  className?: string
}

enum TimeZone {
  UTC = 'UTC',
  LOCAL = 'LOCAL'
}

function TimeDate(timeZone: string, time: number): JSX.Element {
  return (
    <>
      <Layout.Horizontal className={css.popoverClass} spacing={'medium'}>
        <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_200}>
          {timeZone}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal className={css.dateTimeStyle} spacing={'small'}>
        <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_200}>
          DATE
        </Text>
        <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.WHITE}>
          {timeZone === TimeZone.UTC ? moment(time).utc().format('DD/MM/YYYY') : new Date(time).toLocaleDateString()}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal className={css.dateTimeStyle} spacing={'small'}>
        <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_200}>
          TIME
        </Text>
        <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.WHITE}>
          {timeZone === TimeZone.UTC ? `${moment(time).utc().format('HH:mm:ss')}` : new Date(time).toLocaleTimeString()}
        </Text>
      </Layout.Horizontal>
    </>
  )
}

export function TimePopoverWithLocal(props: TimePopoverProps): ReactElement {
  const { time, popoverProps, icon, className, ...textProps } = props
  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.TOP}
      className={Classes.DARK}
      {...popoverProps}
    >
      <Text inline {...textProps} icon={icon} className={className}>
        <ReactTimeago date={time} live title={''} />
      </Text>
      <Layout.Vertical padding="medium">
        {TimeDate(TimeZone.UTC, time)}
        {TimeDate(TimeZone.LOCAL, time)}
      </Layout.Vertical>
    </Popover>
  )
}
