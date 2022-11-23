/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon } from '@harness/uicore'
import Draggable from 'react-draggable'
import type { TimelineSliderHandleProps } from './TimelineSliderHandle.types'
import css from './TimelineSliderHandle.module.scss'

export default function TimelineSliderHandle(props: TimelineSliderHandleProps): JSX.Element {
  const { className, onDrag, onDragEnd, bounds, defaultPosition, position } = props
  return (
    <Draggable
      onDrag={onDrag}
      onStop={onDragEnd}
      position={position}
      defaultPosition={defaultPosition}
      bounds={bounds}
      axis="x"
    >
      <div className={className}>
        <Icon name="drag-handle-horizontal" className={css.main} />
      </div>
    </Draggable>
  )
}
