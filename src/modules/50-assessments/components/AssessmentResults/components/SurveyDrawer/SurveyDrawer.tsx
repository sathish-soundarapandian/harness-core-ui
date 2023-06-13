import { Card, Container, Layout, PageError, PageSpinner, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import { Drawer } from '@blueprintjs/core'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { QuestionOption, Recommendation, ScoreOverviewDTO, useGetQuestionLevelOptions } from 'services/assessments'
import { getSectionImage } from '../../../utils'
import { DrawerProps } from './SurveryDrawer.constants'
import LevelContent from './components/LevelContent/LevelContent'
import { renderComparizionGraph } from './SurveryDrawer.utils'
import css from './SurveryDrawer.module.scss'

interface SurveyDrawerProps {
  isOpen: boolean
  onHideCallback: () => void
  questionId: string
  resultsCode: string
  scores: ScoreOverviewDTO
}

export default function SurveyDrawer(props: SurveyDrawerProps): JSX.Element {
  const { isOpen, onHideCallback, questionId, resultsCode, scores } = props
  const { getString } = useStrings()

  const { data, loading, error } = useGetQuestionLevelOptions({
    resultCode: resultsCode,
    queryParams: {
      questionId
    }
  })
  const { questionText, capability, sectionName, possibleResponses } = data || {}
  const { maturityLevel } = scores
  const sectionImage = getSectionImage(sectionName)

  return (
    <Drawer
      {...DrawerProps}
      isOpen={isOpen}
      onClose={onHideCallback}
      data-testid={'surveyDrawer'}
      className={css.surveryDrawer}
    >
      <>
        {loading && <PageSpinner />}
        {!loading && error && <PageError message={get(error.data as Error, 'message') || error.message} />}
        {data && (
          <>
            <Container className={css.drawerHeader}>
              <Layout.Vertical width={340}>
                <Text padding={'medium'} font={{ variation: FontVariation.H5 }}>
                  {capability}
                </Text>
                <Text padding={{ left: 'medium' }} font={{ variation: FontVariation.SMALL }}>
                  {questionText}
                </Text>
              </Layout.Vertical>
              <Container flex>
                <img src={sectionImage} width="18" height="18" alt="" />
                <Text
                  padding={{ left: 'small', right: 'medium', top: 'medium', bottom: 'medium' }}
                  font={{ variation: FontVariation.SMALL_SEMI }}
                  color={Color.GREY_600}
                >
                  {sectionName?.trim()}
                </Text>
              </Container>
            </Container>
            <Layout.Vertical>
              <Card className={css.charts}>
                {possibleResponses?.reverse().map((answer: QuestionOption) => (
                  <div key={answer.optionId}>
                    <LevelContent
                      level={answer.maturityLevel || 'LEVEL_3'}
                      answer={answer}
                      maturityLevel={maturityLevel || 'LEVEL_3'}
                    />
                  </div>
                ))}
              </Card>
              <Card className={css.charts}>
                <Layout.Vertical>
                  <Text className={css.sideDrawerTitle}>{'Comparison'}</Text>
                  {renderComparizionGraph(scores)}
                </Layout.Vertical>
              </Card>
              {data.recommendations && (
                <Card className={css.charts}>
                  <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
                    {getString('assessments.recommendation')}
                  </Text>
                  {data.recommendations.map((recommendation: Recommendation) => (
                    <Text key={recommendation.recommendationId} margin={{ bottom: 'small' }}>
                      {recommendation.recommendationText}
                    </Text>
                  ))}
                </Card>
              )}
            </Layout.Vertical>
          </>
        )}
      </>
    </Drawer>
  )
}
