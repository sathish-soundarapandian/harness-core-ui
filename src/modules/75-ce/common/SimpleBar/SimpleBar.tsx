/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Color, Container, FontVariation, Layout, Text, Utils } from '@harness/uicore'
import css from './SimpleBar.module.scss'

interface SimpleBarProps {
  widthInPercentage: number
  description?: string
  descriptionDirection?: 'top' | 'bottom'
  primaryColor: Color
  secondaryColor?: Color
}

const SimpleBar: React.FC<SimpleBarProps> = ({
  widthInPercentage,
  description,
  descriptionDirection,
  primaryColor,
  secondaryColor = Color.GREY_200
}) => {
  return (
    <Layout.Vertical
      className={cx(css.simpleBar, {
        [css.reverseDirection]: descriptionDirection === 'bottom'
      })}
    >
      <Layout.Horizontal flex>
        <Text font={{ variation: FontVariation.SMALL }}>{description}</Text>
        <Text color={primaryColor} font={{ variation: FontVariation.BODY2_SEMI }}>
          {widthInPercentage + '%'}
        </Text>
      </Layout.Horizontal>
      <Container className={css.barContainer} style={{ background: Utils.getRealCSSColor(secondaryColor) }}>
        <Container
          className={cx(css.dataBar, {
            [css.activate]: Boolean(widthInPercentage)
          })}
          style={{ ['--bar-width' as any]: `${widthInPercentage}%`, background: Utils.getRealCSSColor(primaryColor) }}
        ></Container>
      </Container>
    </Layout.Vertical>
  )
}

export default SimpleBar
