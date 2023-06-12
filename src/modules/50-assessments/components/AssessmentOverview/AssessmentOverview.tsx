import { Container, Layout, PageError, PageSpinner, Select, SelectOption, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import React, { useEffect, useMemo, useState } from 'react'
import { useStrings } from 'framework/strings'
import { useGetAssessmentSectionOverviewResults } from 'services/assessments'
import useBenchmarks from '@assessments/hooks/useBenchmarks'
import ContentContainer from '../ContentContainer/ContentContainer'
import HomeScoreGlance from './components/HomeScoreGlance/HomeScoreGlance'
import PerformanceOverview from './components/PerformanceOverview/PerformanceOverview'
import css from './AssessmentOverview.module.scss'

export default function AssessmentOverview(): JSX.Element {
  const [benchmark, setBenchmark] = useState<SelectOption>()
  const { getString } = useStrings()
  const { resultsCode } = useParams<{ resultsCode: string }>()

  const restultsPayload = useMemo(() => {
    if (benchmark?.value) {
      return {
        resultCode: resultsCode,
        queryParams: {
          benchmarkId: benchmark.value?.toString() || ''
        }
      }
    }
    return {
      resultCode: resultsCode
    }
  }, [resultsCode, benchmark?.value])
  const {
    data: resultsData,
    error: resultsError,
    loading: resultsLoading,
    refetch
  } = useGetAssessmentSectionOverviewResults(restultsPayload)
  const { assessmentId, companyName, sectionScores } = resultsData || {}
  const { data: benchmarkData, loading, benchmarkItems } = useBenchmarks(resultsCode)

  useEffect(() => {
    if (Array.isArray(benchmarkData) && benchmarkData.length) {
      const selectedBenchmark = benchmarkData.find(item => item.isDefault)
      if (selectedBenchmark) {
        setBenchmark({
          value: selectedBenchmark.benchmarkId,
          label: selectedBenchmark.benchmarkName
        })
      }
    }
  }, [benchmarkData, setBenchmark])

  const sortedSectionScores = useMemo(
    () =>
      (sectionScores || []).sort(
        (a, b) => (a.sectionScore?.selfScore?.score || 0) - (b.sectionScore?.selfScore?.score || 0)
      ),
    [sectionScores]
  )

  const worst = useMemo(() => sortedSectionScores.slice(0, 3), [sortedSectionScores])
  const best = useMemo(
    () => sortedSectionScores.slice(sortedSectionScores.length - 3, sortedSectionScores.length),
    [sortedSectionScores]
  )

  return (
    <>
      {resultsLoading && <PageSpinner data-testid={'page-spinner'} />}
      {!resultsLoading && resultsError && (
        <PageError
          message={get(resultsError?.data as Error, 'message') || resultsError?.message}
          onClick={() => refetch()}
        />
      )}
      {!resultsError && resultsData && assessmentId ? (
        <ContentContainer assessmentId={assessmentId} title={getString('assessments.softwareDeliveryMaturityModel')}>
          <Layout.Vertical padding={'xxlarge'}>
            <Container flex={{ justifyContent: 'space-between' }}>
              <Container>
                <Text font={{ weight: 'bold', size: 'medium' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                  {getString('common.atAGlance')}
                </Text>
                <Layout.Horizontal>
                  <Text font={{ size: 'small' }} margin={{ right: 'small' }}>
                    Organization:{' '}
                  </Text>
                  <Container flex>
                    <img src={`https://logo.clearbit.com/${companyName}?size=14`} alt="" width={16} height={16} />
                    <Text font={{ size: 'small' }} margin={{ left: 'small' }}>
                      {companyName}
                    </Text>
                  </Container>
                </Layout.Horizontal>
              </Container>
              <Select
                items={benchmarkItems}
                className={css.benchmarkSelector}
                value={benchmark}
                loadingItems={loading}
                inputProps={{
                  placeholder: loading ? getString('loading') : getString('assessments.benchmark')
                }}
                onChange={setBenchmark}
              />
            </Container>
            <HomeScoreGlance sectionResult={resultsData} />
            <PerformanceOverview sectionList={best} isBest />
            <PerformanceOverview sectionList={worst} />
          </Layout.Vertical>
        </ContentContainer>
      ) : null}
    </>
  )
}
