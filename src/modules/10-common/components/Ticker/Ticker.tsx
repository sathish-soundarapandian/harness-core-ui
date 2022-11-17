/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'

import css from './Ticker.module.scss'

export enum TickerVerticalAlignment {
  TOP = 'TickerVerticalAlignment.TOP',
  CENTER = 'TickerVerticalAlignment.CENTER',
  BOTTOM = 'TickerVerticalAlignment.BOTTOM'
}

export interface TickerProps {
  decreaseMode?: boolean
  boost?: boolean
  color?: string
  leftAlign?: boolean
  tickerRightAligned?: boolean
  value: string | React.ReactElement
  verticalAlign?: TickerVerticalAlignment
  size?: number
  tickerContainerStyles?: string
  tickerValueStyles?: string
}

export const Ticker: React.FC<TickerProps> = props => {
  const {
    decreaseMode = false,
    boost = false,
    leftAlign = false,
    tickerRightAligned = false,
    verticalAlign = TickerVerticalAlignment.BOTTOM,
    color = Color.GREEN_500,
    size = 6,
    value,
    tickerContainerStyles = '',
    tickerValueStyles = '',
    children
  } = props
  const iconName = boost
    ? decreaseMode
      ? 'double-chevron-down'
      : 'double-chevron-up'
    : decreaseMode
    ? 'main-caret-down'
    : 'main-caret-up'
  return (
    <div
      className={cx(css.tickerContainer, { [css.reverseAlignment]: leftAlign }, tickerContainerStyles)}
      data-test="ticker"
    >
      {children ? <>{children}</> : <></>}
      <div
        className={cx(
          css.ticker,
          { [css.tickerTopAlign]: verticalAlign === TickerVerticalAlignment.TOP },
          { [css.tickerCenterAlign]: verticalAlign === TickerVerticalAlignment.CENTER },
          { [css.tickerReverseAlignment]: tickerRightAligned }
        )}
      >
        <div className={css.iconContainer}>
          <Icon name={iconName} color={color} size={size} />
        </div>
        <div className={cx(css.tickerValue, tickerValueStyles)} data-test="tickerValue">
          {value}
        </div>
      </div>
    </div>
  )
}
