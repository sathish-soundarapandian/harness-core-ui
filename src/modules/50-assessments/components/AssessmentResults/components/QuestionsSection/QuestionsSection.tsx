import { Button, PageError, PageSpinner, TableV2 } from '@harness/uicore'
import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { QuestionScore, useGetAssessmentDetailedResults } from 'services/assessments'
import SurveyDrawer from '../SurveyDrawer/SurveyDrawer'
import {
  RenderQuestion,
  RenderLevelForQuestion,
  RenderComparison,
  RenderQuestionsRecommendations
} from './QuestionSection.utils'
import css from './QuestionsSection.module.scss'

export interface QuestionsSectionProps {
  currentSection: string
  benchmarkId: string
}

export default function QuestionsSection(props: QuestionsSectionProps): JSX.Element {
  const { currentSection, benchmarkId } = props
  const [currentRowDetails, setCurrentRowDetails] = useState<QuestionScore | null>(null)
  const [isOpen, setDrawerOpen] = useState<boolean>(false)
  const { getString } = useStrings()
  const { resultsCode } = useParams<{ resultsCode: string }>()
  const { data, error, loading, refetch } = useGetAssessmentDetailedResults({
    resultCode: resultsCode,
    queryParams: {
      benchmarkId
    }
  })

  const questions = useMemo(() => {
    if (data && data.detailedScores) {
      return data.detailedScores.filter((qn: QuestionScore) => qn.sectionId === currentSection)
    }
    return []
  }, [currentSection, data])

  const onHideCallback = (): void => setDrawerOpen(false)

  if (loading) return <PageSpinner />
  if (error)
    return <PageError message={get(error?.data as Error, 'message') || error?.message} onClick={() => refetch()} />
  if (questions.length) {
    return (
      <>
        <TableV2
          sortable={true}
          onRowClick={rowDetails => {
            setCurrentRowDetails(rowDetails)
            setDrawerOpen(true)
          }}
          columns={[
            {
              Header: getString('common.category').toLocaleUpperCase(),
              id: 'categoryName',
              width: '30%',
              Cell: RenderQuestion
            },

            {
              Header: getString('assessments.levelString').toLocaleUpperCase(),
              width: '10%',
              Cell: RenderLevelForQuestion
            },
            {
              Header: getString('assessments.comparison').toLocaleUpperCase(),
              width: '30%',
              Cell: RenderComparison
            },
            {
              Header: getString('assessments.recommendations').toLocaleUpperCase(),
              width: '30%',
              Cell: RenderQuestionsRecommendations
            }
          ]}
          data={questions}
          className={css.questionSectionTable}
          autoResetExpanded={false}
        />
        <>
          <SurveyDrawer
            isOpen={isOpen}
            onHideCallback={onHideCallback}
            currentSection={currentSection}
            currentRowDetails={currentRowDetails}
          />
          {isOpen ? (
            <Button
              minimal
              className={css.almostFullScreenCloseBtn}
              icon="cross"
              withoutBoxShadow
              onClick={onHideCallback}
            />
          ) : null}
        </>
      </>
    )
  } else {
    return <></>
  }
}
