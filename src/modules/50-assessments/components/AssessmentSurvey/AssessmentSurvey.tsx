import {
  Button,
  Container,
  ExpandingSearchInput,
  Layout,
  PageSpinner,
  Select,
  SelectOption,
  TableV2,
  Text,
  useToaster
} from '@harness/uicore'
import React, { useCallback, useEffect, useState } from 'react'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import {
  AssessmentResultsResponse,
  useGetAssessmentResults,
  useGetBenchmarks,
  UserResponsesResponse
} from 'services/assessments'
import { getErrorMessage } from '@auth-settings/utils'
import { useStrings } from 'framework/strings'
import SideNav from '../SideNav/SideNav'
import { SCORE_FILTER_OPTIONS } from './AssessmentSurvey.constants'
import {
  getBenchMarkItems,
  getDefaultBenchMark,
  getFilteredResultsForScore,
  getFilteredResultsForSearch
} from './AssessmentSurvey.utils'
import { RenderQuestion, RenderScore, RenderComparison, RenderRecommendations } from './AssessmentSurveyTableRows.utils'
import SurveyDrawer from './components/SurveyDrawer/SurveyDrawer'
import css from './AssessmentSurvey.module.scss'

export default function AssessmentSurvey(): JSX.Element {
  const { showError } = useToaster()
  const { getString } = useStrings()
  const [selectedBenchmark, setSelectedBenchmark] = useState<SelectOption>()
  const [selectedScore, setSelectedScore] = useState<SelectOption | null>(null)
  const [isOpen, setDrawerOpen] = useState<boolean>(false)
  const [currentRowDetails, setCurrentRowDetails] = useState<UserResponsesResponse | null>(null)
  const [currentResponses, setCurrentResponses] = useState<AssessmentResultsResponse['responses']>([])
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
  const { assessmentId = '', majorVersion, responses = [], minorVersion } = resultsData || {}

  useEffect(() => {
    setCurrentResponses(resultsData?.responses)
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
    const filteredResults: AssessmentResultsResponse['responses'] = getFilteredResultsForScore(selectedScore, responses)
    setCurrentResponses(filteredResults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScore])

  useEffect(() => {
    const filteredResults: AssessmentResultsResponse['responses'] = getFilteredResultsForSearch(responses, search)
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
  const handleScoreChange = useCallback((option: SelectOption) => {
    setSelectedScore(option)
  }, [])

  const onHideCallback = (): void => setDrawerOpen(false)

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
                {getString('assessments.score')}
              </Text>
              <Select
                items={SCORE_FILTER_OPTIONS}
                value={selectedScore}
                inputProps={{
                  placeholder: '- Select -'
                }}
                onChange={handleScoreChange}
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
              throttle={100}
              defaultValue={search as string}
              key={search}
              onChange={setSearch}
              autoFocus={false}
              placeholder={getString('assessments.searchForQuestion')}
              className={css.searchInput}
            />
          </Layout.Vertical>
        </Layout.Horizontal>
        <TableV2
          sortable={true}
          onRowClick={rowDetails => {
            setCurrentRowDetails(rowDetails)
            setDrawerOpen(true)
          }}
          columns={[
            {
              Header: getString('assessments.question').toLocaleUpperCase(),
              width: '30%',
              Cell: RenderQuestion
            },
            {
              Header: getString('assessments.scoreOutOf10').toLocaleUpperCase(),
              width: '15%',
              Cell: RenderScore
            },
            {
              Header: getString('assessments.comparison').toLocaleUpperCase(),
              width: '35%',
              Cell: RenderComparison
            },
            {
              Header: getString('assessments.recommendations').toLocaleUpperCase(),
              width: '20%',
              Cell: RenderRecommendations
            }
          ]}
          data={currentResponses as UserResponsesResponse[]}
          className={css.surveyTable}
        />
        <>
          <SurveyDrawer isOpen={isOpen} onHideCallback={onHideCallback} currentRowDetails={currentRowDetails} />
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
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
