/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import moment from 'moment'
import { Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { TimelineDataPoint } from '../../TimelineRow.types'
import { DATE_FORMAT } from '../../TimelineRow.constants'
import { getInitialPositionOfWidget } from '../../TimelineRow.utils'
import css from '../../TimelineRow.module.scss'

export interface DownTimeProps {
  widget: TimelineDataPoint
  index: number
}

export default function DownTime(props: DownTimeProps): JSX.Element {
  const { widget, index } = props
  const { getString } = useStrings()
  const { icon, leftOffset: position, startTime, endTime } = widget
  const { height, width, url } = icon
  const initialPosition = getInitialPositionOfWidget(position, height, width)

  return (
    <Container key={`${startTime}-${position}-${index}`} className={css.event} style={initialPosition}>
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        popoverClassName={css.widgetsPopover}
        position={PopoverPosition.TOP}
        content={
          <Container className={css.widgetContainer} padding={'small'}>
            <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall' }}>
              {getString('cv.sloDowntime.label')}
            </Text>
            <Text className={css.widgetTextElements}>
              {moment(new Date(startTime)).format(DATE_FORMAT)} - {moment(new Date(endTime)).format(DATE_FORMAT)}
            </Text>
          </Container>
        }
      >
        <svg height={height} width={width} className={css.widgetIcon} data-testid="downtimeIcon">
          <image href={url} height={height} width={width} />
        </svg>
      </Popover>
    </Container>
  )
}
