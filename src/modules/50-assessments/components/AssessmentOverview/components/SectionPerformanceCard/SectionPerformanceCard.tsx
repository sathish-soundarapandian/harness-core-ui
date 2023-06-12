import { Card, Layout, Tag, Text } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { SectionScore } from 'services/assessments'
import { getSectionImage } from '../../../utils'
import { getLevelImage } from './SectionPerformanceCard.utils'
import css from './SectionPerformanceCard.module.scss'

interface SectionPerformanceCardProps {
  sectionScore: SectionScore
}

const SectionPerformanceCard = ({ sectionScore }: SectionPerformanceCardProps): JSX.Element => {
  const { getString } = useStrings()
  const sectionImage = getSectionImage(sectionScore.sectionText)
  const level = sectionScore.sectionScore?.maturityLevel || 'LEL_1'
  const levelImage = getLevelImage(level)
  return (
    <Card className={css.sectionPerformanceCard}>
      <Layout.Vertical>
        <img src={sectionImage} width="45" height="45" alt="" className={css.sectionIcon} />
        <Text className={css.sectionName} font={{ weight: 'bold', size: 'normal' }}>
          {sectionScore.sectionText}
        </Text>
        <img src={levelImage} width="160" height="88" alt="" className={css.margin} />
        <Text className={css.margin} font={{ weight: 'bold', size: 'medium' }}>
          {`${getString('assessments.levelString')} ${level.at(-1)}`}
        </Text>
        <div className={css.margin}>
          {sectionScore.numRecommendations ? (
            <Tag intent={Intent.PRIMARY}>{`${sectionScore.numRecommendations} ${getString(
              'assessments.recommendations'
            )}`}</Tag>
          ) : (
            <Tag>{getString('assessments.youAreBestInCategory')}</Tag>
          )}
        </div>
      </Layout.Vertical>
    </Card>
  )
}

export default SectionPerformanceCard
