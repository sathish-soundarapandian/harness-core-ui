/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Text } from '@harness/uicore'
import React from 'react'
import type { Color } from '@harness/design-system'
import { numberFormatter } from '@cd/components/Services/common'
import css from './TickerValue.module.scss'

const TickerValue: React.FC<{ value: number; label: string; color: Color }> = props => {
  const percentage = numberFormatter(Math.abs(props.value), {
    truncate: false
  })
  const percentageText = Math.abs(props.value) > 100 ? `100+ %` : `${percentage}%`
  return (
    <Container className={css.tickerValue}>
      <Text className={css.tickerLabel} font={{ size: 'small', weight: 'bold' }}>
        {props.label}
      </Text>
      <Text font={{ size: 'xsmall' }} color={props.color}>
        {percentageText}
      </Text>
    </Container>
  )
}

export default TickerValue
