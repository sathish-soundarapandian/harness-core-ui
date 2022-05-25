/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { CanvasWidget as CanvasWidgetCore, DiagramProps } from '@projectstorm/react-canvas-core'
import cx from 'classnames'

import { Event } from '@pipeline/utils/PipelineStudioUtils'
import { RollbackToggleSwitch, RollbackToggleSwitchProps } from './RollbackToggleSwitch/RollbackToggleSwitch'
import css from './CanvasWidget.module.scss'

interface CanvasWidgetProps extends DiagramProps {
  isRollback?: boolean
  rollBackProps?: Omit<RollbackToggleSwitchProps, 'onChange'>
}

export function CanvasWidget(props: CanvasWidgetProps): React.ReactElement {
  const { className = '', isRollback = false, rollBackProps = {}, ...rest } = props
  return (
    <>
      <CanvasWidgetCore className={cx(css.canvas, className)} {...rest} />
      {isRollback && (
        <RollbackToggleSwitch
          {...rollBackProps}
          onChange={type => props.engine.fireEvent({ type } as any, Event.RollbackClicked)}
        />
      )}
    </>
  )
}
