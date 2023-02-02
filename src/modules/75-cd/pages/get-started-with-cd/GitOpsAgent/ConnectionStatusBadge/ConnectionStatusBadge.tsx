/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// This file is copied form gitops/web/src/components/ConnectionStatusBadge/ConnectionStatusBadge.tsx
import type { IconName } from '@harness/uicore'
import { Icon } from '@harness/uicore'
import React from 'react'
import type { V1ConnectedStatus } from 'services/gitops'
import { String } from 'framework/strings'
import type { StringsMap } from 'stringTypes'

import css from './ConnectionStatusBadge.module.scss'

const stringMap: Record<V1ConnectedStatus, keyof StringsMap> = {
  CONNECTED: 'connected',
  DISCONNECTED: 'cd.getStartedWithCD.disconnected',
  CONNECTED_STATUS_UNSET: 'cd.getStartedWithCD.healthStatus.unknown'
}

const iconMap: Record<V1ConnectedStatus, IconName> = {
  CONNECTED: 'tick-circle',
  DISCONNECTED: 'warning-sign',
  CONNECTED_STATUS_UNSET: 'expired'
}

export interface ConnectionStatusBadgeProps {
  status?: string
  size?: 'medium' | 'large'
}

/**
 *
 * @param props status size
 * @prop status - string value
 * @prop size - size of badge medium or large
 * @returns ReactElement
 */
export default function ConnectionStatusBadge(props: ConnectionStatusBadgeProps): React.ReactElement {
  const { status, size = 'medium' } = props
  const finalStatus = status ? (status as V1ConnectedStatus) : 'CONNECTED_STATUS_UNSET'
  return (
    <div className={css.main} data-size={size} data-status={finalStatus.toLowerCase()}>
      <Icon size={size === 'large' ? 12 : 10} name={iconMap[finalStatus]} />
      <String stringID={stringMap[finalStatus]} />
    </div>
  )
}
