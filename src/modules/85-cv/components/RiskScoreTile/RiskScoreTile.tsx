/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Container } from '@harness/uicore'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import type { TextProps } from '@harness/uicore/dist/components/Text/Text'
import { isNumber } from 'highcharts'
import { getColorStyle } from '@common/components/HeatMap/ColorUtils'
import css from './RiskScoreTile.module.scss'

export interface RiskScoreTileProps {
  riskScore: number
  className?: string
  textProps?: TextProps
  isLarge?: boolean
  isSmall?: boolean
}

export function RiskScoreTile(props: RiskScoreTileProps): JSX.Element {
  const { riskScore, className, textProps, isSmall, isLarge } = props
  const isRiskScoreDefined = isNumber(riskScore) && riskScore > -1

  return (
    <Container
      className={cx(
        css.main,
        isSmall ? css.smallTile : undefined,
        isLarge ? css.largeTile : undefined,
        className,
        isRiskScoreDefined ? getColorStyle(riskScore, 0, 100) : css.noRiskScore
      )}
    >
      <Text color={Color.WHITE} className={css.riskScore} {...textProps}>
        {isRiskScoreDefined ? riskScore : ''}
      </Text>
    </Container>
  )
}
