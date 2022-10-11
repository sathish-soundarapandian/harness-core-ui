/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { getDurationLabelFromMilliseconds } from './DurationView.utils'

export const DurationView = ({ durationMs }: { durationMs?: number }): JSX.Element => {
  const { getString } = useStrings()
  const durationLabel = durationMs ? getDurationLabelFromMilliseconds(durationMs) : getString('noData')
  return (
    <Text font={{ size: 'small' }} data-name={getString('duration')}>
      {`${getString('duration')} ${durationLabel}`}
    </Text>
  )
}
