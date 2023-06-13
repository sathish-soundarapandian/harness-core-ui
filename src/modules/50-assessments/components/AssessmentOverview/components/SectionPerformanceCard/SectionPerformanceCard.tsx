import { Card, Layout, Tag, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { SectionScore } from 'services/assessments'
import { getSectionImage } from '../../../utils'
import { getLevelImage } from './SectionPerformanceCard.utils'
import ResultTag from '../../../ResultTag/ResultTag'
import css from './SectionPerformanceCard.module.scss'

interface SectionPerformanceCardProps {
  sectionScore: SectionScore
  resultCode: string
}

const SectionPerformanceCard = ({ sectionScore, resultCode }: SectionPerformanceCardProps): JSX.Element => {
  const { getString } = useStrings()
  const history = useHistory()
  const sectionImage = getSectionImage(sectionScore.sectionText)
  const level = sectionScore.sectionScore?.maturityLevel || 'LEL_1'
  const levelImage = getLevelImage(level)
  const onCardClick = useCallback(() => {
    history.push(
      `/assessment/results/${resultCode}?focusCategory=${sectionScore.sectionText?.replace(/ /g, '').toLowerCase()}`
    )
  }, [history, resultCode, sectionScore.sectionText])
  return (
    <Card className={css.sectionPerformanceCard} onClick={onCardClick}>
      <Layout.Vertical>
        <img src={sectionImage} width="45" height="45" alt="" className={css.sectionIcon} />
        <Text className={css.sectionName} font={{ variation: FontVariation.H5 }} color={Color.GREY_600}>
          {sectionScore.sectionText}
        </Text>
        <img src={levelImage} width="160" height="88" alt="" className={css.margin} />
        <Text className={css.margin} font={{ variation: FontVariation.H4 }}>
          {`${getString('assessments.levelString').toUpperCase()} ${level.at(-1)}`}
        </Text>
        <div className={css.margin}>
          {sectionScore.numRecommendations ? (
            <ResultTag
              content={
                <Text
                  font={{ variation: FontVariation.BODY2 }}
                  color={Color.PRIMARY_7}
                  padding={{ left: 'xsmall' }}
                >{`${sectionScore.numRecommendations} ${getString('assessments.recommendations')}`}</Text>
              }
            />
          ) : (
            <Tag>{getString('assessments.youAreBestInCategory')}</Tag>
          )}
        </div>
      </Layout.Vertical>
    </Card>
  )
}

export default SectionPerformanceCard
