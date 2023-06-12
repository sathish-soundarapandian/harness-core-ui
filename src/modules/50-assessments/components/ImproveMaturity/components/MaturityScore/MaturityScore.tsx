import React, { useMemo } from 'react'
import { Card, PageError, PageSpinner, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { SectionResultDTO, useGetAssessmentSectionOverviewResults } from 'services/assessments'
import RadialChart from '../RadialChart/RadialChart'
import StackChart from '../StackChart/StackChart'
import css from './MaturityScore.module.scss'

interface MaturityScoreProps {
  improvementScore: number
  benchmarkId?: string
}

const MaturityScore = ({ improvementScore, benchmarkId }: MaturityScoreProps): JSX.Element => {
  const { getString } = useStrings()
  const { resultsCode } = useParams<{ resultsCode: string }>()

  const payload = useMemo(() => {
    if (benchmarkId) {
      return {
        resultCode: resultsCode,
        queryParams: {
          benchmarkId
        }
      }
    }
    return {
      resultCode: resultsCode
    }
  }, [benchmarkId, resultsCode])
  const {
    data: resultsData,
    error: resultsError,
    loading: resultsLoading,
    refetch
  } = useGetAssessmentSectionOverviewResults(payload)

  if (resultsLoading) return <PageSpinner data-testid={'page-spinner'} />
  if (!resultsLoading && resultsError)
    return (
      <PageError
        message={get(resultsError.data as Error, 'message') || resultsError.message}
        onClick={() => refetch()}
      />
    )

  const { overallScoreOverview } = resultsData as SectionResultDTO
  const score = overallScoreOverview?.selfScore?.score || 0
  const maxScore = overallScoreOverview?.selfScore?.maxScore || 1
  const companyScore = overallScoreOverview?.organizationScore?.score || 0
  const benchmarkScore = overallScoreOverview?.benchmarkScore?.score || 0
  return (
    <Card className={css.maturityScoreCard}>
      <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_1000} margin={{ bottom: 'small' }}>
        {getString('assessments.maturityScore')}
      </Text>
      <Text margin={{ bottom: 'xxlarge' }}>{getString('assessments.maturityScoreDesc')}</Text>
      <RadialChart score={score} improvementScore={improvementScore} maxScore={maxScore} />
      <StackChart
        score={score}
        maxScore={maxScore}
        improvementScore={improvementScore}
        companyScore={companyScore}
        benchmarkScore={benchmarkScore}
      />
    </Card>
  )
}

export default MaturityScore
