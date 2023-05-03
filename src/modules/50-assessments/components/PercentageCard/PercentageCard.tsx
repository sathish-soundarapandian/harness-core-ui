import { Container, Layout, Text } from '@harness/uicore'
import React from 'react'
import cx from 'classnames'
import css from './PercentageCard.module.scss'

interface PercentageCardProps {
  title: string
  percentage?: number
  percentageTitle?: string
  textLineOne: string
  textLineTwo: string
}

export default function PercentageCard(props: PercentageCardProps): JSX.Element {
  const { title, percentage, percentageTitle, textLineOne, textLineTwo } = props
  return (
    <Container className={css.percentageBox} padding={'large'} margin={{ right: 'medium' }}>
      <Layout.Vertical>
        <Text className={css.titleText} padding={{ bottom: 'medium' }}>
          {title}
        </Text>
        <Text
          className={cx(css.percentageText, {
            [css.isPercentageDiffHigher]: percentageTitle === 'Higher',
            [css.isPercentageDiffLower]: percentageTitle === 'Lower'
          })}
          padding={{ bottom: 'medium' }}
        >{`${percentage}% ${percentageTitle ?? ''}`}</Text>
        <Text className={css.contentText} padding={{ bottom: 'small' }}>
          {textLineOne}
        </Text>
        <Text className={css.contentText}>{textLineTwo}</Text>
      </Layout.Vertical>
    </Container>
  )
}
