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
import { DefaultDataCollectionEndtime } from '@cv/pages/slos/SLOCard/SLOCardContent.utils'
import type { TimelineDataPoint } from '../../TimelineRow.types'
import { DATE_FORMAT } from '../../TimelineRow.constants'
import { getInitialPositionOfWidget } from '../../TimelineRow.utils'
import css from '../../TimelineRow.module.scss'

export interface DataCollectionFailureProps {
  widget: TimelineDataPoint
  index: number
}

export default function DataCollectionFailure(props: DataCollectionFailureProps): JSX.Element {
  const { widget, index } = props
  const { getString } = useStrings()
  const tillPresent = getString('cv.slos.untilPresent')
  const { icon, leftOffset: position, startTime, endTime, tooltip } = widget
  const timeString =
    endTime === DefaultDataCollectionEndtime * 1000
      ? `${moment(new Date(startTime)).format(DATE_FORMAT)} - ${tillPresent}`
      : `${moment(new Date(startTime)).format(DATE_FORMAT)} - ${moment(new Date(endTime)).format(DATE_FORMAT)}`
  const { height, width, url } = icon
  const initialPosition = getInitialPositionOfWidget(position, height, width)

  return (
    <Container key={`${startTime}-${position}-${index}`} className={css.event} style={initialPosition}>
      <Popover
        interactionKind={PopoverInteractionKind.HOVER}
        popoverClassName={css.widgetsPopover}
        position={PopoverPosition.TOP}
        content={
          <Container className={css.widgetContainer} padding={'small'}>
            <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall' }}>
              {timeString}
            </Text>
            <Text className={css.widgetTextElements}>{tooltip?.message}</Text>
          </Container>
        }
      >
        <svg height={height} width={width} className={css.widgetIcon} data-testid="dataCollectionFailureIcon">
          <image href={url} height={height} width={width} />
        </svg>
      </Popover>
    </Container>
  )
}
