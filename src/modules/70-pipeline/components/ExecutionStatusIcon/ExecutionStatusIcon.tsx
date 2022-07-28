/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconProps } from '@harness/icons'
import { Icon, Layout, Popover } from '@wings-software/uicore'
import cx from 'classnames'
import React from 'react'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import ExecutionStatusLabel from '../ExecutionStatusLabel/ExecutionStatusLabel'
import css from './ExecutionStatusIcon.module.scss'

export const iconMap: Record<ExecutionStatus, IconProps> = {
  ApprovalRejected: { name: 'x', size: 14 },
  NotStarted: { name: 'play-outline', size: 14 },
  Skipped: { name: 'skipped', size: 14 },
  Success: { name: 'tick-circle', size: 14 },
  IgnoreFailed: { name: 'tick-circle', size: 14 },
  Failed: { name: 'warning-sign', size: 14 },
  Errored: { name: 'warning-sign', size: 14 },
  InterventionWaiting: { name: 'time', size: 14 },
  ResourceWaiting: { name: 'time', size: 14 },
  ApprovalWaiting: { name: 'time', size: 14 },
  Aborted: { name: 'circle-stop', size: 14 },
  Discontinuing: { name: 'circle-stop', size: 14 },
  Expired: { name: 'expired', size: 14 },
  Suspended: { name: 'banned', size: 14 },
  AsyncWaiting: { name: 'loading', size: 14 },
  TaskWaiting: { name: 'loading', size: 14 },
  TimedWaiting: { name: 'loading', size: 14 },
  Running: { name: 'loading', size: 14 },
  Queued: { name: 'queued', size: 14 },
  InputWaiting: { name: 'loading', size: 14 },
  Paused: { name: 'pause', size: 14 },
  Pausing: { name: 'pause', size: 14 }
}

export interface ExecutionStatusIconProps {
  status: ExecutionStatus
  className?: string
}

export function ExecutionStatusIcon({ status, className }: ExecutionStatusIconProps): React.ReactElement | null {
  if (!status || !iconMap[status]) return null

  return (
    <Popover
      position={Position.TOP}
      interactionKind={PopoverInteractionKind.HOVER}
      className={Classes.DARK}
      content={
        <Layout.Vertical spacing="medium" padding="small">
          <ExecutionStatusLabel status={status} />
        </Layout.Vertical>
      }
    >
      <Icon
        {...iconMap[status]}
        className={cx(css.statusIcon, css[status.toLowerCase() as keyof typeof css], className)}
      />
    </Popover>
  )
}
