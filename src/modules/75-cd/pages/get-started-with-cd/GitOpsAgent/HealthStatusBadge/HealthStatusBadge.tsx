/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
// This file is copied form gitops/web/src/components/HealthStatusBadge/HealthStatusBadge.tsx
import type { IconName } from '@harness/uicore'
import { Icon } from '@harness/uicore'
import classNames from 'classnames'
import React from 'react'

import { String } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import css from './HealthStatusBadge.module.scss'

// adopted from  https://github.com/argoproj/argo-cd/blob/ff4541894885696808b479d123c40effc28bae45/ui/src/app/shared/models.ts#L294
export enum HealthStatus {
  Unknown = 'Unknown',
  Progressing = 'Progressing',
  Suspended = 'Suspended',
  Healthy = 'Healthy',
  Unhealthy = 'Unhealthy',
  Degraded = 'Degraded',
  Missing = 'Missing'
}

export const stringMap: Record<HealthStatus, keyof StringsMap> = {
  [HealthStatus.Degraded]: 'cd.getStartedWithCD.healthStatus.degraded',
  [HealthStatus.Healthy]: 'cd.getStartedWithCD.healthStatus.healthy',
  [HealthStatus.Unhealthy]: 'cd.getStartedWithCD.healthStatus.degraded',
  [HealthStatus.Missing]: 'cd.getStartedWithCD.healthStatus.missing',
  [HealthStatus.Progressing]: 'cd.getStartedWithCD.healthStatus.progressing',
  [HealthStatus.Suspended]: 'cd.getStartedWithCD.healthStatus.suspended',
  [HealthStatus.Unknown]: 'cd.getStartedWithCD.healthStatus.unknown'
}

export const iconMap: Record<HealthStatus, IconName> = {
  [HealthStatus.Degraded]: 'heart-broken',
  [HealthStatus.Healthy]: 'heart',
  [HealthStatus.Unhealthy]: 'heart-broken',
  [HealthStatus.Missing]: 'gitops-missing',
  [HealthStatus.Progressing]: 'loading',
  [HealthStatus.Suspended]: 'gitops-missing',
  [HealthStatus.Unknown]: 'gitops-unknown'
}

export const iconSizeMap: Record<HealthStatus, { medium: number; large: number }> = {
  [HealthStatus.Degraded]: { medium: 10, large: 12 },
  [HealthStatus.Healthy]: { medium: 10, large: 12 },
  [HealthStatus.Unhealthy]: { medium: 12, large: 12 },
  [HealthStatus.Missing]: { medium: 14, large: 16 },
  [HealthStatus.Progressing]: { medium: 16, large: 18 },
  [HealthStatus.Suspended]: { medium: 10, large: 12 },
  [HealthStatus.Unknown]: { medium: 16, large: 18 }
}

export interface HealthStatusBadgeProps {
  status?: string
  iconOnly?: boolean
  size?: 'medium' | 'large'
}

export default function HealthStatusBadge(props: HealthStatusBadgeProps): React.ReactElement {
  const { status, size = 'medium' } = props
  const finalStatus = status && status in HealthStatus ? (status as HealthStatus) : HealthStatus.Unknown

  return (
    <div
      className={classNames(css.main, { [css.iconOnly]: props.iconOnly })}
      data-size={size}
      data-status={finalStatus.toLowerCase()}
    >
      <Icon size={props.iconOnly ? 14 : iconSizeMap[finalStatus][size]} name={iconMap[finalStatus]} />
      {props.iconOnly ? null : <String stringID={stringMap[finalStatus as HealthStatus]} />}
    </div>
  )
}
