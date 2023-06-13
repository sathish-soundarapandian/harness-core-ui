import { Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import css from './ScoreDistribution.module.scss'

interface ScoreCardProps {
  score: number
  color: Color
  title: string
}

const ScoreCard = ({ score, color, title }: ScoreCardProps): JSX.Element => (
  <Layout.Vertical className={css.scoreCard}>
    <Layout.Horizontal margin={{ bottom: 'medium' }}>
      <Icon size={12} name={'full-circle'} color={color} margin={{ right: 'small' }} padding={{ top: 'small' }} />
      <Text font={{ variation: FontVariation.SMALL_SEMI }} margin="small" color={Color.GREY_500}>
        {title}
      </Text>
    </Layout.Horizontal>
    <Text font={{ variation: FontVariation.H4 }}>{`${score} %`}</Text>
  </Layout.Vertical>
)

export default ScoreCard
