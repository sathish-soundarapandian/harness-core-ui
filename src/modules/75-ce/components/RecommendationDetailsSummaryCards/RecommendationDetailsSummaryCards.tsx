/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Layout, Text, Icon, Container } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './RecommendationDetailsSummaryCards.module.scss'

interface RecommendationDetailsSavingsCardProps {
  title: string
  amount: string
  amountSubTitle: string
  subTitle: string
}

export const RecommendationDetailsSavingsCard: React.FC<RecommendationDetailsSavingsCardProps> = props => {
  const { title, amount, amountSubTitle, subTitle } = props
  const { getString } = useStrings()

  return (
    <Card className={cx(css.savingsCard)} style={{ backgroundColor: Color.PRIMARY_1 }} elevation={1}>
      <Layout.Vertical spacing="small">
        <Text
          font={{ variation: FontVariation.H6 }}
          color={Color.GREY_500}
          tooltipProps={{ dataTooltipId: 'recommendationDetailsSavingsCardTitle' }}
        >
          {title}
        </Text>
        <Layout.Horizontal style={{ alignItems: 'baseline' }} spacing="xsmall">
          <Icon name="money-icon" size={28} color={Color.GREEN_700} />
          <Text color={Color.GREEN_700} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.recommendation.listPage.uptoText')}
          </Text>
          <Text className={css.amount} color={Color.GREEN_600} font={{ variation: FontVariation.H3 }}>
            {amount}
          </Text>
          <Text color={Color.GREEN_700} font={{ variation: FontVariation.BODY2 }}>
            {amountSubTitle}
          </Text>
        </Layout.Horizontal>
        <Text color={Color.GREY_500} font={{ variation: FontVariation.TINY }}>
          {subTitle}
        </Text>
      </Layout.Vertical>
    </Card>
  )
}

interface RecommendationDetailsSpendCardProps {
  title: string
  spentBy: string
  withRecommendationAmount: string
  withoutRecommendationAmount: string
}

export const RecommendationDetailsSpendCard: React.FC<RecommendationDetailsSpendCardProps> = props => {
  const { title, spentBy, withRecommendationAmount, withoutRecommendationAmount } = props
  const { getString } = useStrings()

  return (
    <Card className={cx(css.potentialSpendCard)} elevation={1}>
      <Layout.Vertical spacing="small">
        <Layout.Horizontal style={{ alignItems: 'baseline' }} padding={{ bottom: 'small' }} spacing="xsmall">
          <Text
            font={{ variation: FontVariation.H6 }}
            color={Color.GREY_500}
            tooltipProps={{ dataTooltipId: 'recommendationDetailsSpendCardTitle' }}
          >
            {title}
          </Text>
          <Text color={Color.GREY_500}>{`(${getString('ce.recommendation.detailsPage.monthlySpendByDate', {
            date: spentBy
          })})`}</Text>
        </Layout.Horizontal>
        <Layout.Horizontal padding={{ left: 'small', right: 'small' }}>
          <Layout.Vertical
            padding={{ right: 'medium' }}
            flex={{ justifyContent: 'space-between', alignItems: 'start' }}
          >
            <Text className={css.amount} font={{ variation: FontVariation.H3 }}>
              {withRecommendationAmount}
            </Text>
            <Layout.Horizontal spacing="xsmall">
              <Text color={Color.GREEN_700} font={{ variation: FontVariation.TINY }}>
                {getString('common.with')}
              </Text>
              <Text color={Color.GREY_500} font={{ variation: FontVariation.TINY }}>
                {getString('ce.recommendation.sideNavText').toLowerCase()}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
          <Container
            margin={{ left: 'medium', right: 'medium' }}
            style={{ borderLeft: '1px solid var(--grey-300)', height: 52 }}
          />
          <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'start' }}>
            <Text className={css.amount} font={{ variation: FontVariation.H6 }} padding={{ top: 'xsmall' }}>
              {withoutRecommendationAmount}
            </Text>
            <Layout.Horizontal spacing="xsmall">
              <Text color={Color.RED_700} font={{ variation: FontVariation.TINY }}>
                {getString('common.without')}
              </Text>
              <Text color={Color.GREY_500} font={{ variation: FontVariation.TINY }}>
                {getString('ce.recommendation.sideNavText').toLowerCase()}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Layout.Vertical>
    </Card>
  )
}
