/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef } from 'react'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ruleServiceStatusLabelMap } from '@ce/constants'
import css from './InstanceStatusIndicator.module.scss'

interface InstanceStatusIndicatorV2Props {
  status: string
  disabled?: boolean
  refetchStatus?: () => void
}

export const InstanceStatusIndicatorV2: React.FC<InstanceStatusIndicatorV2Props> = ({
  status,
  disabled,
  refetchStatus
}) => {
  const { getString } = useStrings()
  const serviceState = ruleServiceStatusLabelMap.get(status)
  const intervalId = useRef<number | undefined>()

  useEffect(() => {
    if (serviceState?.intent === 'load' && refetchStatus) {
      if (!intervalId.current) {
        intervalId.current = window.setInterval(() => refetchStatus(), 5000)
      }
    } else if (intervalId.current) {
      window.clearInterval(intervalId.current)
    }
    return () => window.clearInterval(intervalId.current)
  }, [serviceState?.intent])

  if (!serviceState) {
    return null
  }

  return (
    <>
      {!disabled ? (
        <Text
          font={{ variation: FontVariation.UPPERCASED }}
          icon={serviceState.icon}
          iconProps={{ size: 14 }}
          className={cx(css.stateLabel, {
            [css.runningLabel]: serviceState.intent === 'running',
            [css.stoppedLabel]: serviceState.intent === 'stopped',
            [css.loadingLabel]: serviceState.intent === 'load'
          })}
        >
          {getString(serviceState.labelStringId)}
        </Text>
      ) : (
        <Text
          className={cx(css.stateLabel, css.disabledLabel)}
          font={{ variation: FontVariation.UPPERCASED }}
          icon="deployment-aborted-legacy"
        >
          {getString('ce.common.disabled')}
        </Text>
      )}
    </>
  )
}
