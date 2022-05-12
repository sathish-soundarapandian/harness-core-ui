/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Layout, Text, IconName, Container } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import css from './RecommendationSavingsCard.module.scss'

interface RecommendationSavingsCardProps {
  title: string
  amount: string | React.ReactElement
  subTitle?: string
  amountSubTitle?: string
  iconName?: IconName
  cardCssName?: string
  titleImg?: string
}

const RecommendationSavingsCard: React.FC<RecommendationSavingsCardProps> = props => {
  const { title, amount, subTitle, amountSubTitle, iconName, cardCssName, titleImg } = props

  return (
    <Card className={cx(css.savingsCard, cardCssName)} elevation={1}>
      <Layout.Vertical spacing="small">
        <Layout.Horizontal spacing={'small'}>
          {titleImg && <img src={titleImg} width={20} />}
          <Text color={Color.GREY_500} font={{ variation: FontVariation.H6 }}>
            {title}
          </Text>
        </Layout.Horizontal>
        <Container>
          <Text
            inline
            font={{ variation: FontVariation.H3 }}
            color={iconName ? Color.GREEN_700 : Color.GREY_800}
            icon={iconName ? iconName : undefined}
            iconProps={{ size: 28 }}
          >
            {amount}
          </Text>
          {amountSubTitle ? (
            <Text inline color={Color.GREY_400} font={{ variation: FontVariation.TINY }} margin={{ left: 'xsmall' }}>
              {amountSubTitle}
            </Text>
          ) : null}
        </Container>
        {subTitle ? (
          <Text color={Color.GREY_600} font={{ variation: FontVariation.TINY }}>
            {subTitle}
          </Text>
        ) : null}
      </Layout.Vertical>
    </Card>
  )
}

export default RecommendationSavingsCard
