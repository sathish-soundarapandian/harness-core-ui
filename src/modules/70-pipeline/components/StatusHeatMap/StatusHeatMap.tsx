/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, Icon, IconName, Popover, PopoverProps } from '@harness/uicore'
import cx from 'classnames'
import React, { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import {
  ExecutionStatus,
  isExecutionAborted,
  isExecutionApprovalRejected,
  isExecutionExpired,
  isExecutionFailed,
  isExecutionPaused,
  isExecutionPausing,
  isExecutionRunning,
  isExecutionSuccess,
  isExecutionSuspended,
  isExecutionWaiting
} from '@pipeline/utils/statusHelpers'
import css from './StatusHeatMap.module.scss'

// Visually, all of the statuses are limited to these variants - https://www.figma.com/file/4HavSweFhZeVsJoaWwSrj8/Pipelines?node-id=3499%3A285830
type CombinedStatus = 'default' | 'success' | 'aborted' | 'failed' | 'paused' | 'running'

const statusIconMap: Partial<Record<CombinedStatus, { name: IconName; color?: string; size: number }>> = {
  aborted: {
    name: 'circle-stop',
    color: Color.GREY_600,
    size: 12
  },
  failed: {
    name: 'warning-sign',
    color: Color.RED_900,
    size: 10
  },
  paused: {
    name: 'pause',
    color: Color.ORANGE_900,
    size: 12
  },
  running: {
    name: 'loading',
    color: Color.PRIMARY_7,
    size: 12
  }
}

export const getCombinedStatus = (status: ExecutionStatus): CombinedStatus => {
  let state: CombinedStatus = 'default'

  if (isExecutionSuccess(status)) {
    state = 'success'
  } else if (isExecutionAborted(status) || isExecutionExpired(status)) {
    state = 'aborted'
  } else if (isExecutionFailed(status) || isExecutionSuspended(status) || isExecutionApprovalRejected(status)) {
    state = 'failed'
  } else if (isExecutionPaused(status) || isExecutionPausing(status) || isExecutionWaiting(status)) {
    state = 'paused'
  } else if (isExecutionRunning(status)) {
    state = 'running'
  } else {
    // ['Skipped,Queued,Discontinuing,NotStarted'] or any other unknown status will default to this
    state = 'default'
  }

  return state
}

export interface StatusHeatMapProps<T> {
  data: T[]
  getId: (item: T, index: string) => string
  getStatus: (item: T) => ExecutionStatus
  className?: string
  getPopoverProps?: (item: T) => PopoverProps
  onClick?: (item: T, event: React.MouseEvent) => void
  getLinkProps?: (item: T) => ComponentProps<Link> | undefined
}

export interface StatusCell<T> {
  row: T
  id: string
}

export function StatusHeatMap<T>(props: StatusHeatMapProps<T>): React.ReactElement {
  const { data, getId, getStatus, className, getPopoverProps, onClick, getLinkProps } = props

  function StatusCell({ row, id }: StatusCell<T>) {
    const combinedStatus = getCombinedStatus(getStatus(row))
    const iconProps = statusIconMap[combinedStatus]
    return (
      <div
        data-id={getId(row, id)}
        data-state={combinedStatus}
        className={css.statusHeatMapCell}
        onClick={e => onClick?.(row, e)}
      >
        {iconProps && <Icon {...iconProps} />}
      </div>
    )
  }

  return (
    <div className={cx(css.statusHeatMap, className)}>
      {data.map((row, index) => {
        const id = getId(row, index.toString())
        const linkProps = getLinkProps && getLinkProps(row)
        return (
          <Popover disabled={!getPopoverProps} key={id} {...getPopoverProps?.(row)}>
            {linkProps ? (
              <Link {...linkProps}>
                <StatusCell row={row} id={id} />
              </Link>
            ) : (
              <StatusCell row={row} id={id} />
            )}
          </Popover>
        )
      })}
    </div>
  )
}
