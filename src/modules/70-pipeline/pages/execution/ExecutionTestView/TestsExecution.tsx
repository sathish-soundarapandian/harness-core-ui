/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import {
  Text,
  Container,
  Layout,
  Heading,
  Select,
  Switch,
  Pagination,
  useIsMounted,
  Icon,
  Button,
  FlexExpander,
  TextInput,
  PageError,
  HarnessDocTooltip,
  ExpandingSearchInput
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { get, noop, omit, debounce } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import {
  TestSuiteSummaryQueryParams,
  useTestSuiteSummary,
  useVgSearch,
  TestSuite,
  TestSuites,
  TestReportSummary
} from 'services/ti-service'
import { CallGraphAPIResponse, TestsCallgraph } from './TestsCallgraph'
import { TestsExecutionItem } from './TestsExecutionItem'
import {
  SortByKey,
  CALL_GRAPH_WIDTH,
  CALL_GRAPH_HEIGHT,
  CALL_GRAPH_API_LIMIT,
  getOptionalQueryParamKeys
} from './TestsUtils'
import testsCallgraphErrorIllustration from './TestsCallgraphErrorIllustration.svg'
import css from './BuildTests.module.scss'

const PAGE_SIZE = 20

interface TestsExecutionProps {
  stageId: string
  stepId: string
  serviceToken: string
  showCallGraph?: boolean
  isAggregatedReports?: boolean
  reportSummaryData?: TestReportSummary | null
}

const getEntireExecutionSummary = (executionSummaryContent: TestSuite[]): any =>
  executionSummaryContent.reduce((a: any, b: any) => ({
    duration_ms: a?.duration_ms + b?.duration_ms,
    total_tests: a?.total_tests + b?.total_tests,
    failed_tests: a?.failed_tests + b?.failed_tests,
    skipped_tests: a?.skipped_tests + b?.skipped_tests
  }))

const getUngroupedExecutionSummary = ({
  showAllTests,
  reportSummaryData,
  testCaseSearchTerm,
  executionSummary
}: {
  showAllTests?: boolean
  reportSummaryData?: TestReportSummary | null
  testCaseSearchTerm?: string
  executionSummary?: TestSuites
}) => {
  if (!showAllTests && !testCaseSearchTerm && reportSummaryData) {
    return reportSummaryData
  } else if (executionSummary?.content) {
    return getEntireExecutionSummary(executionSummary?.content)
  }
  return []
}

export function TestsExecution({
  stageId,
  stepId,
  serviceToken,
  showCallGraph,
  isAggregatedReports,
  reportSummaryData
}: TestsExecutionProps): React.ReactElement | null {
  const context = useExecutionContext()
  const { getString } = useStrings()
  const status = (context?.pipelineExecutionDetail?.pipelineExecutionSummary?.status || '').toUpperCase()
  const [showAllTests, setShowAllTests] = useState(true) //!change before merge
  const [showGroupedView, setShowGroupedView] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState<number | undefined>(0)
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    buildIdentifier: string
  }>()
  const [sortBy, setSortBy] = useState<SortByKey>(SortByKey.FAILURE_RATE)
  const [testCaseSearchTerm, setTestCaseSearchTerm] = useState<string>('')
  const [pageIndex, setPageIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const queryParams = useMemo(() => {
    const optionalKeys = getOptionalQueryParamKeys({ stageId, stepId })

    return {
      accountId,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      pipelineId: context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier || '',
      buildId: String(context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence || ''),
      report: 'junit' as const,
      pageIndex,
      testCaseSearchTerm,
      sort: sortBy,
      pageSize: PAGE_SIZE,
      status: showAllTests ? undefined : ('failed' as const),
      order: 'DESC' as const,
      ...optionalKeys
    }
  }, [
    stageId,
    stepId,
    accountId,
    orgIdentifier,
    projectIdentifier,
    context?.pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier,
    context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence,
    pageIndex,
    sortBy,
    testCaseSearchTerm,
    showAllTests
  ])
  const {
    data: executionSummary,
    error,
    loading,
    refetch: fetchExecutionSummary
  } = useTestSuiteSummary({
    queryParams,
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken
      }
    },
    debounce: 500
  })
  const sortByItems = useMemo(
    () => [
      { label: getString('common.failureRate'), value: SortByKey.FAILURE_RATE },
      { label: getString('failed'), value: SortByKey.FAILED_TESTS },
      { label: getString('pipeline.duration'), value: SortByKey.DURATION_MS },
      { label: getString('total'), value: SortByKey.TOTAL_TESTS }
    ],
    [getString]
  )
  const [sortBySelectedItem, setSortBySelectedItem] = useState({
    label: getString('common.failureRate'),
    value: SortByKey.FAILURE_RATE
  })
  const isMounted = useIsMounted()
  const refetchData = useCallback(
    (params: TestSuiteSummaryQueryParams) => {
      setTimeout(() => {
        if (isMounted.current) {
          fetchExecutionSummary({ queryParams: params })
        }
      }, 250)
    },
    [isMounted, fetchExecutionSummary]
  )

  const searchTestNames = () => {
    const searchTerm = searchRef.current?.querySelector('[type="search"]')?.getAttribute('value') || ''
    if (searchTerm) {
      setTestCaseSearchTerm(searchTerm)
    } else {
      setTestCaseSearchTerm('')
    }
    refetchData({
      ...queryParams,
      sort: sortBy,
      pageIndex,
      testCaseSearchTerm: searchTerm,
      status: showAllTests ? undefined : 'failed'
    })
  }

  const [selectedCallGraphClass, setSelectedCallGraphClass] = useState<string>()
  const {
    data: callGraphData,
    loading: callGraphLoading,
    error: callGraphError,
    refetch: fetchCallGraph
  } = useVgSearch({
    lazy: true,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken
      }
    }
  })
  const callGraphStats = useMemo(() => {
    return callGraphData?.nodes?.reduce(
      (obj, node) => {
        if (node.important) {
          obj.changedCount++
        } else {
          obj.unchangedCount++
        }
        return obj
      },
      {
        changedCount: 0,
        unchangedCount: 0
      }
    )
  }, [callGraphData])
  const onClassSelected = useCallback(
    (selectedClassName: string) => {
      if (selectedClassName !== selectedCallGraphClass && !isAggregatedReports) {
        setSelectedCallGraphClass(selectedClassName)
        fetchCallGraph({
          queryParams: Object.assign({}, omit(queryParams, ['report', 'pageIndex', 'sort', 'pageSize', 'order']), {
            limit: CALL_GRAPH_API_LIMIT,
            class: selectedClassName
          })
        })
      }
    },
    [selectedCallGraphClass, queryParams, fetchCallGraph]
  )
  const [callgraphSearchTerm, setCallgraphSearchTerm] = useState('')
  const onCallgraphModalSearch = (event: React.FormEvent<HTMLInputElement>): void => {
    const value = (event.target as HTMLInputElement).value
    setCallgraphSearchTerm(value)
  }

  const debouncedOnCallgraphModalSearch = useCallback(debounce(onCallgraphModalSearch, 300), [onCallgraphModalSearch])

  const renderCallGraphFooter = useCallback(
    (preview?: boolean) => {
      const directCall = (
        <Text className={cx(css.graphLabel, css.direct)}>{getString('pipeline.testsReports.directCall')}</Text>
      )
      const indirectCall = (
        <Text className={cx(css.graphLabel, css.indirect)}>{getString('pipeline.testsReports.indirectCall')}</Text>
      )
      const changedMethods = (
        <Text className={cx(css.graphLabel, css.changed)}>
          {getString('pipeline.testsReports.codeChanges', {
            count: new Intl.NumberFormat().format(callGraphStats?.changedCount || 0)
          })}
        </Text>
      )
      const unchangedMethods = (
        <Text className={cx(css.graphLabel, css.unchanged)}>
          {getString('pipeline.testsReports.unchangedMethods', {
            count: new Intl.NumberFormat().format(callGraphStats?.unchangedCount || 0)
          })}
        </Text>
      )

      if (callGraphError) return null

      return (
        <Container padding={{ top: 'xsmall', right: 'medium', bottom: 'medium', left: preview ? 'medium' : 'large' }}>
          {(preview && (
            <Layout.Vertical spacing="small">
              <Container>
                <Layout.Horizontal spacing="small">
                  {directCall}
                  {indirectCall}
                </Layout.Horizontal>
              </Container>
              <Container>
                <Layout.Horizontal spacing="small">
                  {changedMethods}
                  {unchangedMethods}
                </Layout.Horizontal>
              </Container>
            </Layout.Vertical>
          )) || (
            <Layout.Horizontal spacing="small">
              {changedMethods}
              {unchangedMethods}
              {directCall}
              {indirectCall}
            </Layout.Horizontal>
          )}
        </Container>
      )
    },
    [callGraphStats, getString]
  )
  const [showCallGraphModal, hideCallGraphModal] = useModalHook(
    () => (
      <Dialog
        enforceFocus={false}
        className={css.callgraphModal}
        title={
          <Layout.Horizontal padding={{ top: 'xsmall' }}>
            <Text className={css.modalTitle}>
              {getString('pipeline.testsReports.callgraphTitle')}: <span>{selectedCallGraphClass}</span>
            </Text>
            <FlexExpander />
            <TextInput
              className={css.searchInput}
              placeholder={getString('search')}
              autoFocus
              leftIcon="search"
              leftIconProps={{
                name: 'search',
                size: 16
              }}
              onChange={debouncedOnCallgraphModalSearch}
            />
          </Layout.Horizontal>
        }
        isCloseButtonShown
        isOpen
        onClose={() => {
          hideCallGraphModal()
          setCallgraphSearchTerm('')
        }}
        style={{ width: window.innerWidth - 200, height: window.innerHeight - 200 }}
      >
        <Layout.Vertical spacing="small">
          {!callGraphLoading && selectedCallGraphClass && callGraphData && (
            <TestsCallgraph
              selectedClass={selectedCallGraphClass}
              graph={callGraphData as CallGraphAPIResponse}
              onNodeClick={noop}
              searchTerm={callgraphSearchTerm}
            />
          )}
          {renderCallGraphFooter()}
        </Layout.Vertical>
      </Dialog>
    ),
    [selectedCallGraphClass, callGraphLoading, callGraphData, callgraphSearchTerm]
  )

  useEffect(() => {
    if (!executionSummary && !error && !loading) {
      fetchExecutionSummary({ queryParams })
    }
  }, [executionSummary, error, loading, fetchExecutionSummary, queryParams])

  // When build/execution is not resolved from context, render nothing
  if (!status) {
    return null
  }

  return (
    <div className={cx(css.widgetWrapper, css.rightContainer)}>
      <Container flex={{ justifyContent: 'flex-start' }} margin={{ bottom: 'xsmall' }}>
        <Heading
          data-name="test-executions"
          level={6}
          style={{ fontWeight: 600, marginBottom: 'var(--spacing-3)' }}
          color={Color.GREY_600}
        >
          {getString('pipeline.testsReports.testExecutions')}
          <HarnessDocTooltip tooltipId="testExecutions" useStandAlone={true} />
        </Heading>
        {loading && <Icon name="steps-spinner" size={16} color="blue500" margin={{ left: 'xsmall' }} />}
      </Container>
      <Layout.Horizontal spacing="medium" className={css.widget} padding="xlarge">
        <Container width={`calc(100% - ${showCallGraph ? CALL_GRAPH_WIDTH : 0}px)`}>
          <Container flex>
            <Switch
              label={getString('pipeline.testsReports.showAllTests')}
              style={{ alignSelf: 'center' }}
              checked={showAllTests}
              onChange={e => {
                setShowAllTests(e.currentTarget.checked)
                setPageIndex(0)
                refetchData({
                  ...queryParams,
                  sort: sortBy,
                  pageIndex: 0,
                  status: e.currentTarget.checked ? undefined : 'failed'
                })
              }}
            />
            <Layout.Horizontal>
              <Container ref={searchRef} flex className={css.expandSearchContainer}>
                <ExpandingSearchInput
                  alwaysExpanded
                  width={200}
                  placeholder={getString('pipeline.testsReports.searchByTestName')}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      searchTestNames()
                    }
                  }}
                />
                <Button
                  data-testid="search-btn"
                  text={getString('search')}
                  minimal
                  disabled={loading}
                  onClick={searchTestNames}
                />
              </Container>
              {showGroupedView ? (
                <Layout.Horizontal spacing="small">
                  <Text style={{ alignSelf: 'center' }}>{getString('pipeline.testsReports.sortBy')}</Text>
                  <Select
                    data-testid="sortBySelect"
                    className={css.sortBySelect}
                    items={sortByItems}
                    value={sortBySelectedItem}
                    onChange={item => {
                      setSortBySelectedItem(item as { label: string; value: SortByKey })
                      setSortBy(item.value as SortByKey)
                      setPageIndex(0)
                      refetchData({
                        ...queryParams,
                        sort: item.value as SortByKey,
                        pageIndex: 0,
                        status: showAllTests ? undefined : 'failed'
                      })
                    }}
                  />
                </Layout.Horizontal>
              ) : (
                <Container height={32} />
              )}
              <Button
                color={showGroupedView ? Color.PRIMARY_7 : Color.GREY_500}
                data-testid="activeGroupedIcon"
                className={cx(css.listIcons, showGroupedView && css.activeGroupedIcon)}
                icon="th-list"
                minimal
                iconProps={{ size: 20 }}
                onClick={() => {
                  if (!showGroupedView) {
                    setShowGroupedView(true)
                  }
                }}
              />
              <Button
                color={!showGroupedView ? Color.PRIMARY_7 : Color.GREY_500}
                className={cx(css.listIcons, !showGroupedView && css.activeGroupedIcon)}
                icon="list-view"
                minimal
                iconProps={{ size: 20 }}
                onClick={() => {
                  if (showGroupedView) {
                    setShowGroupedView(false)
                  }
                }}
              />
            </Layout.Horizontal>
          </Container>

          {error && (
            <Container height={200}>
              <PageError
                message={get(error, 'data.error_msg', error?.message)}
                onClick={() => {
                  fetchExecutionSummary()
                }}
              />
            </Container>
          )}

          {!error && executionSummary?.content && (
            <>
              {executionSummary.content.length > 0 && (
                <Layout.Vertical spacing="small" margin={{ top: 'medium' }}>
                  {showGroupedView ? (
                    executionSummary?.content?.map((summary, index) => (
                      <TestsExecutionItem
                        key={(summary.name || '') + showAllTests + testCaseSearchTerm}
                        buildIdentifier={String(
                          context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence || ''
                        )}
                        executionSummary={summary}
                        serviceToken={serviceToken}
                        status={showAllTests ? undefined : 'failed'}
                        expanded={index === expandedIndex ? true : undefined}
                        stageId={stageId}
                        stepId={stepId}
                        onExpand={() => {
                          setExpandedIndex(expandedIndex !== index ? index : undefined)
                        }}
                        onShowCallGraphForClass={showCallGraph ? onClassSelected : undefined}
                        isUngroupedList={false}
                        testCaseSearchTerm={testCaseSearchTerm}
                        refetchCallgraph={className => {
                          fetchCallGraph({
                            queryParams: Object.assign(
                              {},
                              omit(queryParams, ['report', 'pageIndex', 'sort', 'pageSize', 'order']),
                              {
                                limit: CALL_GRAPH_API_LIMIT,
                                class: className
                              }
                            )
                          })
                        }}
                      />
                    ))
                  ) : (
                    <TestsExecutionItem
                      key={`${showAllTests}${testCaseSearchTerm}`}
                      buildIdentifier={String(
                        context?.pipelineExecutionDetail?.pipelineExecutionSummary?.runSequence || ''
                      )}
                      executionSummary={getUngroupedExecutionSummary({
                        showAllTests,
                        reportSummaryData,
                        testCaseSearchTerm,
                        executionSummary
                      })}
                      serviceToken={serviceToken}
                      status={showAllTests ? undefined : 'failed'}
                      stageId={stageId}
                      stepId={stepId}
                      expanded={true}
                      onShowCallGraphForClass={showCallGraph ? onClassSelected : undefined}
                      isUngroupedList={true}
                      testCaseSearchTerm={testCaseSearchTerm}
                    />
                  )}
                </Layout.Vertical>
              )}
              {executionSummary.content.length === 0 && !showAllTests && (
                <Text font={{ align: 'center' }} margin={{ top: 'medium' }}>
                  {getString('pipeline.testsReports.noFailedTestsFound')}
                </Text>
              )}
            </>
          )}

          {showGroupedView && (executionSummary?.data?.totalItems || 0) > PAGE_SIZE && (
            <Pagination
              pageSize={executionSummary?.data?.pageSize || 0}
              pageIndex={pageIndex}
              pageCount={executionSummary?.data?.totalPages || 0}
              itemCount={executionSummary?.data?.totalItems || 0}
              gotoPage={pageIdx => {
                setPageIndex(pageIdx)
                refetchData({
                  ...queryParams,
                  sort: sortBy,
                  pageIndex: pageIdx
                })
              }}
            />
          )}
        </Container>

        {/* Callgraph container */}
        {showCallGraph && (
          <Container width={CALL_GRAPH_WIDTH} className={css.callgraphContainer}>
            <Layout.Horizontal className={css.callgraphHeader}>
              <Text color={Color.GREY_800} style={{ fontWeight: 500, fontSize: '14px', lineHeight: '32px' }}>
                {getString('pipeline.testsReports.callgraphTitle')}
                <HarnessDocTooltip tooltipId="callGraphTitle" useStandAlone={true} />
              </Text>
              <FlexExpander />
              <Button
                minimal
                intent="primary"
                icon="canvas-position"
                className={css.expandButton}
                onClick={showCallGraphModal}
                disabled={callGraphLoading || !!callGraphError}
              >
                <span style={{ paddingLeft: 'var(--spacing-small)' }}>
                  {getString('pipeline.testsReports.expandGraph')}
                </span>
              </Button>
            </Layout.Horizontal>
            <Layout.Vertical spacing="small" className={css.callgraphBody}>
              <Text
                color={Color.GREY_400}
                padding="medium"
                font={{ size: 'small' }}
                className={css.graphTitle}
                width={CALL_GRAPH_WIDTH}
                style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
              >
                {selectedCallGraphClass || ''}
              </Text>
              <Container height={CALL_GRAPH_HEIGHT}>
                {(callGraphLoading || callGraphError) && (
                  <Container className={css.callgraphLoadingStatus}>
                    {callGraphLoading && <Icon name="spinner" />}
                    {callGraphError && (
                      <>
                        <img src={testsCallgraphErrorIllustration} alt="" />
                        <Text color="black" margin={{ top: 'xlarge' }}>
                          {get(callGraphError, 'data.error_msg', error?.message)}
                        </Text>
                      </>
                    )}
                  </Container>
                )}
                {!callGraphLoading && selectedCallGraphClass && callGraphData && (
                  <TestsCallgraph
                    preview
                    selectedClass={selectedCallGraphClass}
                    graph={callGraphData as CallGraphAPIResponse}
                    onNodeClick={showCallGraphModal}
                  />
                )}
              </Container>
              {renderCallGraphFooter(true)}
            </Layout.Vertical>
          </Container>
        )}
      </Layout.Horizontal>
    </div>
  )
}
