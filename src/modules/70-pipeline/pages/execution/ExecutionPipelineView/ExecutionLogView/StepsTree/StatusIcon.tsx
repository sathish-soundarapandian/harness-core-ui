import React from 'react'
import { mapKeys } from 'lodash-es'
import { IconName, Icon, IconProps } from '@harness/icons'
import cx from 'classnames'

import { ExecutionStatusIconMap } from '@pipeline/utils/executionUtils'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'

import css from './StatusIcon.module.scss'

export const IconMap: Record<string, IconName> = {
  ...mapKeys(ExecutionStatusIconMap, (_value, key) => key.toLowerCase()),
  running: 'spinner',
  asyncwaiting: 'spinner',
  timedwaiting: 'spinner',
  taskwaiting: 'spinner'
}

export interface StatusIconProps extends Omit<IconProps, 'name'> {
  status?: ExecutionStatus
}

export function StatusIcon(props: StatusIconProps): React.ReactElement | null {
  const { status, className, ...rest } = props

  return status ? (
    <Icon
      {...rest}
      className={cx(css.statusIcon, css[status.toLowerCase() as keyof typeof css], className)}
      name={IconMap[status.toLowerCase()]}
    />
  ) : null
}
