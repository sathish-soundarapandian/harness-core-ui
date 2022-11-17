/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Text, TextProps, timeToDisplayText } from '@harness/uicore'
import { isNil } from 'lodash-es'
import { useStrings } from 'framework/strings'

export interface DurationProps extends Omit<TextProps, 'icon'> {
  startTime?: number
  endTime?: number // if endTime is nullable, endTime is Date.now() and the duration is re-calculated by an interval
  durationText?: React.ReactNode // optional text to override the default `Duration: ` prefix: ;
  showMilliSeconds?: boolean
  showZeroSecondsResult?: boolean
  showMsLessThanOneSecond?: boolean
  icon?: TextProps['icon'] | null
}

export function Duration(props: DurationProps): React.ReactElement {
  const {
    startTime,
    endTime,
    durationText,
    icon,
    showMilliSeconds,
    showZeroSecondsResult,
    showMsLessThanOneSecond,
    ...textProps
  } = props
  const [_endTime, setEndTime] = useState(endTime || Date.now())
  const { getString } = useStrings()

  useEffect(() => {
    if (endTime) {
      setEndTime(endTime)
    }

    const timeoutId =
      (!endTime &&
        window.setInterval(() => {
          setEndTime(Date.now())
        }, 1000)) ||
      0

    return () => {
      window.clearInterval(timeoutId)
    }
  }, [endTime])

  let delta = startTime ? Math.abs(startTime - _endTime) : 0

  if ((!showMilliSeconds && !showMsLessThanOneSecond) || (showMsLessThanOneSecond && delta > 1000)) {
    delta = Math.round(delta / 1000) * 1000
  }

  const text = showZeroSecondsResult ? timeToDisplayText(delta) || '0s' : timeToDisplayText(delta)

  return (
    <Text inline icon={isNil(icon) ? undefined : icon || 'hourglass'} {...textProps}>
      {durationText ?? getString('common.durationPrefix')}
      {text}
    </Text>
  )
}
