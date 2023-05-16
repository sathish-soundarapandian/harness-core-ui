import type {
  SelectOption} from '@harness/uicore';
import {
  Container,
  ExpandingSearchInput,
  Layout,
  PageSpinner,
  Select,
  TableV2,
  Text,
  useToaster
} from '@harness/uicore'
import React, { useCallback, useEffect, useState } from 'react'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useGetAssessmentResults, useGetBenchmarks } from 'services/assessments'
import { getErrorMessage } from '@auth-settings/utils'
import { useStrings } from 'framework/strings'
import SideNav from '../SideNav/SideNav'
import { mockDataForSectionsGroupedQuestions, LEVEL_FILTER_OPTIONS } from './AssessmentSurvey.constants'
import {
  getBenchMarkItems,
  getDefaultBenchMark,
  getFilteredResultsForLevel,
  getFilteredResultsForSearch
} from './AssessmentSurvey.utils'
import {
  RenderComparison,
  RenderRecommendations,
  ToggleAccordionCell,
  RenderCategory,
  RenderLevelForSection,
  RenderWeightage
} from './AssessmentSurveyTableRows.utils'
import QuestionsSection from './components/QuestionsSection/QuestionsSection'
import css from './AssessmentSurvey.module.scss'

export interface SectionsGroupedQuestions {
  sectionId: string
  sectionName: string
  weightage: number
  level: string
  userScore: number
  organizationScore: number
  benchmarkScore: number
  recommendations: number
  questions: Question[]
}

export interface Question {
  questionName: string
  capability: string
  level: string
  userScore: number
  organizationScore: number
  benchmarkScore?: number
  recommendations: string
}

export default function AssessmentSurvey(): JSX.Element {
  const { showError } = useToaster()
  const { getString } = useStrings()
  const [selectedBenchmark, setSelectedBenchmark] = useState<SelectOption>()
  const [selectedLevel, setSelectedLevel] = useState<SelectOption | null>(null)

  const [currentResponses, setCurrentResponses] = useState<SectionsGroupedQuestions[]>([])
  const [search, setSearch] = useState<string | null>(null)
  const { resultsCode } = useParams<{ resultsCode: string }>()

  const {
    data: resultsData,
    error: resultsError,
    loading: resultsLoading
  } = useGetAssessmentResults({
    resultCode: resultsCode,
    queryParams: {
      benchmarkId: selectedBenchmark?.value as string
    }
  })
  const {
    assessmentId = '',
    majorVersion,
    minorVersion
    // responses = [],
  } = resultsData || {}

  // TODO - this will be replaced by commented code when actual backend api is available
  const responses = mockDataForSectionsGroupedQuestions

  useEffect(() => {
    // TODO - this will be replaced by commented code when actual backend api is available
    // setCurrentResponses(resultsData?.responses)
    setCurrentResponses(mockDataForSectionsGroupedQuestions)
  }, [resultsData])

  const {
    data: benchmarksData,
    error: benchmarksError,
    loading: benchmarksLoading,
    refetch: fetchBenchMarks
  } = useGetBenchmarks({
    assessmentId,
    majorVersion: majorVersion as number,
    lazy: true
  })

  useEffect(() => {
    if (majorVersion && assessmentId) {
      fetchBenchMarks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [majorVersion, assessmentId])

  useEffect(() => {
    if (Array.isArray(benchmarksData) && benchmarksData.length) {
      const defaultBenchMark = getDefaultBenchMark(benchmarksData)
      setSelectedBenchmark(defaultBenchMark)
    }
  }, [benchmarksData])

  useEffect(() => {
    const filteredResults: SectionsGroupedQuestions[] = getFilteredResultsForLevel(
      selectedLevel,
      responses as SectionsGroupedQuestions[]
    )
    setCurrentResponses(filteredResults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel])

  useEffect(() => {
    const filteredResults: SectionsGroupedQuestions[] = getFilteredResultsForSearch(
      responses as SectionsGroupedQuestions[],
      search
    )
    setCurrentResponses(filteredResults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    const error = benchmarksError || resultsError
    if (error) {
      showError(getErrorMessage(error))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [benchmarksError, resultsError])

  const benchmarkItems = getBenchMarkItems(benchmarksData)

  const handleBenchmarkChange = useCallback((option: SelectOption) => {
    setSelectedBenchmark(option)
  }, [])

  const handleLevelChange = useCallback((option: SelectOption) => {
    setSelectedLevel(option)
  }, [])

  const renderRowSubComponent = useCallback(({ row }) => {
    const { questions, sectionName } = row?.original || {}
    return <QuestionsSection questions={questions} currentSection={sectionName} />
  }, [])

  return (
    <Layout.Horizontal>
      {resultsLoading && <PageSpinner />}
      <Container className={css.leftNavigation}>
        <SideNav resultCode={resultsCode} majorVersion={majorVersion} minorVersion={minorVersion} />
      </Container>
      <Layout.Vertical className={css.rightNavigation}>
        <Layout.Vertical className={css.topHeader}>
          <Text className={css.heading}>{getString('assessments.survey')}</Text>
        </Layout.Vertical>
        <Layout.Horizontal className={css.subHeader}>
          <Layout.Horizontal>
            <Layout.Vertical>
              <Text
                font={{ weight: 'semi-bold', size: 'small' }}
                color={Color.GREY_800}
                padding={{ left: 'large', top: 'small' }}
              >
                {getString('assessments.level')}
              </Text>
              <Select
                items={LEVEL_FILTER_OPTIONS}
                value={selectedLevel}
                inputProps={{
                  placeholder: '- Select -'
                }}
                onChange={handleLevelChange}
                className={css.scoreDropdown}
              />
            </Layout.Vertical>
            <Layout.Vertical>
              <Text
                font={{ weight: 'semi-bold', size: 'small' }}
                color={Color.GREY_800}
                padding={{ left: 'large', top: 'small' }}
              >
                {getString('assessments.benchmarkComparison')}
              </Text>
              <Select
                items={benchmarkItems}
                value={selectedBenchmark}
                disabled={benchmarksLoading}
                inputProps={{
                  placeholder: benchmarksLoading ? getString('loading') : '- Select -'
                }}
                onChange={handleBenchmarkChange}
                className={css.benchmarkDropdown}
              />
            </Layout.Vertical>
          </Layout.Horizontal>
          <Layout.Vertical>
            <ExpandingSearchInput
              width={250}
              defaultValue={search as string}
              key={search}
              onChange={setSearch}
              autoFocus={false}
              placeholder={getString('assessments.searchForCategory')}
              className={css.searchInput}
            />
          </Layout.Vertical>
        </Layout.Horizontal>
        <TableV2
          sortable={true}
          columns={[
            {
              Header: '',
              id: 'rowSelectOrExpander',
              Cell: ToggleAccordionCell,
              disableSortBy: true,
              width: '2%'
            },
            {
              Header: 'CATEGORY',
              id: 'categoryName',
              width: '30%',
              Cell: RenderCategory
            },
            {
              Header: 'WEIGHTAGE',
              width: '15%',
              Cell: RenderWeightage
            },
            {
              Header: 'LEVEL',
              width: '15%',
              Cell: RenderLevelForSection
            },
            {
              Header: getString('assessments.comparison').toLocaleUpperCase(),
              width: '35%',
              Cell: RenderComparison
            },
            {
              Header: getString('assessments.recommendations').toLocaleUpperCase(),
              width: '18%',
              Cell: RenderRecommendations
            }
          ]}
          data={currentResponses as SectionsGroupedQuestions[]}
          className={css.surveyTable}
          renderRowSubComponent={renderRowSubComponent}
          autoResetExpanded={false}
        />
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
