import { PageError, PageSpinner, SelectOption } from '@harness/uicore'
import React, { useEffect, useMemo, useState } from 'react'
import { get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { ScoreOverviewDTO, SectionScore, useGetAssessmentSectionOverviewResults } from 'services/assessments'
import { useStrings } from 'framework/strings'
import ContentContainer from '../ContentContainer/ContentContainer'
import ResultTable from './components/ResultTable/ResultTable'
import ScoreDistribution from './components/ScoreDistribution/ScoreDistribution'
import SubHeader from './components/SubHeader/SubHeader'
import { LEVEL_FILTER_OPTIONS } from './components/SubHeader/SubHeader.constants'
import { getFilteredResultsForLevel, getFilteredResultsForSearch } from './AssessmentResults.utils'

export default function AssessmentResults(): JSX.Element {
  const { getString } = useStrings()
  const [selectedBenchmark, setSelectedBenchmark] = useState<SelectOption>()
  const [selectedLevel, setSelectedLevel] = useState<SelectOption[]>(LEVEL_FILTER_OPTIONS)
  const [currentResponses, setCurrentResponses] = useState<SectionScore[]>()

  const [search, setSearch] = useState<string>('')
  const { resultsCode } = useParams<{ resultsCode: string }>()

  const restultsPayload = useMemo(() => {
    if (selectedBenchmark?.value) {
      return {
        resultCode: resultsCode,
        queryParams: {
          benchmarkId: selectedBenchmark.value?.toString() || ''
        }
      }
    }
    return {
      resultCode: resultsCode
    }
  }, [resultsCode, selectedBenchmark?.value])

  const {
    data: sectionResultsData,
    error: sectionResultsError,
    loading: sectionResultsLoading,
    refetch
  } = useGetAssessmentSectionOverviewResults(restultsPayload)

  useEffect(() => {
    if (sectionResultsData?.sectionScores) {
      setCurrentResponses(sectionResultsData?.sectionScores)
    }
  }, [sectionResultsData])

  useEffect(() => {
    const filteredResults: SectionScore[] = getFilteredResultsForLevel(selectedLevel, sectionResultsData?.sectionScores)
    setCurrentResponses(filteredResults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel])

  useEffect(() => {
    const filteredResults: SectionScore[] = getFilteredResultsForSearch(sectionResultsData?.sectionScores, search)
    setCurrentResponses(filteredResults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <ContentContainer assessmentId={sectionResultsData?.assessmentId || ''} title={getString('assessments.result')}>
      <SubHeader
        resultCode={resultsCode}
        level={selectedLevel}
        benchmark={selectedBenchmark}
        setLevel={setSelectedLevel}
        setBenchMark={setSelectedBenchmark}
        search={search}
        setSearch={setSearch}
      />
      {sectionResultsLoading && <PageSpinner />}
      {!sectionResultsLoading && sectionResultsError && (
        <PageError
          message={get(sectionResultsError.data as Error, 'message') || sectionResultsError.message}
          onClick={() => refetch()}
        />
      )}
      {sectionResultsData && (
        <ScoreDistribution
          sectionScores={currentResponses || []}
          overallScoreOverview={sectionResultsData.overallScoreOverview as ScoreOverviewDTO}
        />
      )}
      <ResultTable sectionScores={currentResponses || []} benchmarkId={selectedBenchmark?.value?.toString() || ''} />
    </ContentContainer>
  )
}
