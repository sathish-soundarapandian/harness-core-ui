import { Icon, Layout, Text } from '@harness/uicore'
import type { Color } from '@harness/design-system'
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
      <Icon name={'full-circle'} color={color} margin={{ right: 'small' }} padding={{ top: 'small' }} />
      <Text margin="small">{title}</Text>
    </Layout.Horizontal>
    <Text font={{ weight: 'bold', size: 'medium' }} color="grey700">{`${score} %`}</Text>
  </Layout.Vertical>
)

export default ScoreCard
