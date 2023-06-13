import { Container, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React from 'react'
import cx from 'classnames'
import css from './PercentageCard.module.scss'

interface PercentageCardProps {
  percentage: number
  percentageTitle: string
  textLineOne: string
  textLineTwo: string
}

export default function PercentageCard(props: PercentageCardProps): JSX.Element {
  const { percentage, percentageTitle, textLineOne, textLineTwo } = props
  return (
    <Container className={css.percentageBox} padding={'large'} margin={{ right: 'medium' }}>
      <Layout.Vertical>
        <Layout.Horizontal margin={{ top: 'medium', bottom: 'xsmall' }}>
          <Text
            font={{ variation: FontVariation.H1 }}
            className={cx({
              [css.isPercentageDiffHigher]: percentageTitle === 'Higher',
              [css.isPercentageDiffLower]: percentageTitle === 'Lower'
            })}
          >{`${percentage}%  `}</Text>
          <Text font={{ variation: FontVariation.H4 }} padding={{ left: 'small', top: 'medium' }}>
            {percentageTitle}
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal margin={{ bottom: 'large' }}>
          <Text font={{ variation: FontVariation.BODY2 }} padding={{ top: 'xsmall' }}>
            Than
          </Text>
          <Text padding={{ bottom: 'small', left: 'small' }} font={{ variation: FontVariation.BODY2_SEMI }}>
            {textLineOne}
          </Text>
        </Layout.Horizontal>
        <Text font={{ variation: FontVariation.SMALL }}>{textLineTwo}</Text>
      </Layout.Vertical>
    </Container>
  )
}
