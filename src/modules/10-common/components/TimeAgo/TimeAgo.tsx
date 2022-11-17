/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ReactTimeago from 'react-timeago'
import { Text, TextProps } from '@harness/uicore'

export interface TimeAgoProps extends TextProps, React.ComponentProps<typeof ReactTimeago> {
  time: number
}

export const TimeAgo: React.FC<TimeAgoProps> = ({ time, ...textProps }) => {
  return (
    <Text inline icon="time" {...textProps}>
      <ReactTimeago date={time} live />
    </Text>
  )
}
