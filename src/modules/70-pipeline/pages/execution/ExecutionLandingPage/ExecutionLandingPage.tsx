/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useEffect, useCallback, useState } from 'react'
import { Intent } from '@blueprintjs/core'
import type { GetDataError } from 'restful-react'
import { useParams, useLocation, useHistory } from 'react-router-dom'
import { get, isEmpty, pickBy } from 'lodash-es'
import { Text, Icon, PageError, PageSpinner, Layout, Container } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { CIExecutionImages, getCustomerConfigPromise, ResponseCIExecutionImages } from 'services/ci'
import {
  Failure,
  GovernanceMetadata,
  GraphLayoutNode,
  ResponsePipelineExecutionDetail,
  useGetExecutionDetailV2
} from 'services/pipeline-ng'
import type { ExecutionNode } from 'services/pipeline-ng'
import { ExecutionStatus, isExecutionComplete } from '@pipeline/utils/statusHelpers'
import {
  getPipelineStagesMap,
  getActiveStageForPipeline,
  getActiveStep,
  isNodeTypeMatrixOrFor,
  processForCIData
} from '@pipeline/utils/executionUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useQueryParams, useDeepCompareEffect } from '@common/hooks'
import { joinAsASentence } from '@common/utils/StringUtils'
import { useStrings } from 'framework/strings'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import type { ExecutionPathProps, GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { PipelineExecutionWarning } from '@pipeline/components/PipelineExecutionWarning/PipelineExecutionWarning'
import { logsCache } from '@pipeline/components/LogsContent/LogsState/utils'
import { EvaluationModal } from '@governance/EvaluationModal'
import ExecutionContext from '@pipeline/context/ExecutionContext'
import { ModuleName } from 'framework/types/ModuleName'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { usePolling } from '@common/hooks/usePolling'
import { useReportSummary, useGetToken } from 'services/ti-service'
import { hasCIStage, hasOverviewDetail, hasServiceDetail } from '@pipeline/utils/stageHelpers'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import ExecutionTabs from './ExecutionTabs/ExecutionTabs'
import ExecutionMetadata from './ExecutionMetadata/ExecutionMetadata'
import { ExecutionPipelineVariables } from './ExecutionPipelineVariables'
import { ExecutionHeader } from './ExecutionHeader/ExecutionHeader'
import { CIBuildInfrastructureType } from '../../../utils/constants'

import css from './ExecutionLandingPage.module.scss'

export const POLL_INTERVAL = 2 /* sec */ * 1000 /* ms */
const PageTabs = { PIPELINE: 'pipeline' }

const setStageIds = ({
  queryParams,
  setAutoSelectedStageId,
  setAutoSelectedChildStageId,
  setAutoSelectedStepId,
  setAutoStageNodeExecutionId,
  setSelectedStepId,
  setSelectedStageId,
  setSelectedChildStageId,
  setSelectedStageExecutionId,
  data,
  error
}: {
  queryParams: ExecutionPageQueryParams
  setAutoSelectedStageId: Dispatch<SetStateAction<string>>
  setAutoSelectedChildStageId: Dispatch<SetStateAction<string>>
  setAutoSelectedStepId: Dispatch<SetStateAction<string>>
  setAutoStageNodeExecutionId: Dispatch<SetStateAction<string>>
  setSelectedStepId: Dispatch<SetStateAction<string>>
  setSelectedStageId: Dispatch<SetStateAction<string>>
  setSelectedChildStageId: Dispatch<SetStateAction<string>>
  setSelectedStageExecutionId: Dispatch<SetStateAction<string>>
  data?: ResponsePipelineExecutionDetail | null
  error?: GetDataError<Failure | Error> | null
}): void => {
  if (error) {
    return
  }

  // if user has selected a stage/step/collapsedNode do not auto-update
  if (queryParams.stage || queryParams.step || queryParams.collapsedNode) {
    setAutoSelectedStageId('')
    setAutoSelectedChildStageId('')
    setAutoSelectedStepId('')
    return
  }

  // if no data is found, reset the stage and step
  if (!data || !data?.data) {
    setAutoSelectedStageId('')
    setAutoSelectedChildStageId('')
    setAutoSelectedStepId('')
    return
  }

  const runningStage = getActiveStageForPipeline(
    data.data.pipelineExecutionSummary,
    data.data?.pipelineExecutionSummary?.status as ExecutionStatus
  )

  const runningChildStage = getActiveStageForPipeline(
    data.data?.childGraph?.pipelineExecutionSummary,
    data.data?.childGraph?.pipelineExecutionSummary?.status as ExecutionStatus
  )

  let runningStep = null
  if (data.data?.executionGraph)
    runningStep = getActiveStep(data.data?.executionGraph, data.data.pipelineExecutionSummary)
  else if (data.data?.childGraph?.executionGraph)
    runningStep = getActiveStep(data.data?.childGraph?.executionGraph, data.data?.childGraph?.pipelineExecutionSummary)

  if (runningStage) {
    if (isNodeTypeMatrixOrFor(data.data?.pipelineExecutionSummary?.layoutNodeMap?.[runningStage]?.nodeType)) {
      const nodeExecid = get(
        data,
        ['data', 'pipelineExecutionSummary', 'layoutNodeMap', runningStage, 'edgeLayoutList', 'currentNodeChildren', 0],
        runningStage
      ) as string // UNIQUE ID--> stageNodeExecutionID
      const nodeId = get(
        data,
        ['data', 'pipelineExecutionSummary', 'layoutNodeMap', nodeExecid, 'nodeUuid'],
        ''
      ) as string // COMMMON--> stageNodeID
      setAutoSelectedStageId(nodeId)
      setSelectedStageId(nodeId)
      setAutoStageNodeExecutionId(nodeExecid)
      setSelectedStageExecutionId(nodeExecid)
    } else {
      setAutoSelectedStageId(runningStage)
      setSelectedStageId(runningStage)
      if (runningChildStage) {
        if (
          isNodeTypeMatrixOrFor(
            data.data?.childGraph?.pipelineExecutionSummary?.layoutNodeMap?.[runningChildStage]?.nodeType
          )
        ) {
          const childNodeExecid = get(
            data,
            [
              'data',
              'childGraph',
              'pipelineExecutionSummary',
              'layoutNodeMap',
              runningChildStage,
              'edgeLayoutList',
              'currentNodeChildren',
              0
            ],
            runningChildStage
          ) as string // UNIQUE ID--> stageNodeExecutionID
          const childNodeId = get(
            data,
            ['data', 'childGraph', 'pipelineExecutionSummary', 'layoutNodeMap', childNodeExecid, 'nodeUuid'],
            ''
          ) as string // COMMMON--> stageNodeID
          setAutoSelectedChildStageId(childNodeId)
          setSelectedChildStageId(childNodeId)
          setAutoStageNodeExecutionId(childNodeExecid)
          setSelectedStageExecutionId(childNodeExecid)
        } else {
          setAutoSelectedChildStageId(runningChildStage)
          setSelectedChildStageId(runningChildStage)
          setAutoStageNodeExecutionId('')
          setSelectedStageExecutionId('')
        }
      } else {
        setAutoSelectedChildStageId('')
        setSelectedChildStageId('')
        setAutoStageNodeExecutionId('')
        setSelectedStageExecutionId('')
      }
    }
  }

  if (runningStep) {
    setAutoSelectedStepId(runningStep.node)
    setSelectedStepId(runningStep.node)
  }
}

export default function ExecutionLandingPage(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, module, pipelineIdentifier } =
    useParams<PipelineType<ExecutionPathProps>>()
  const [allNodeMap, setAllNodeMap] = React.useState<Record<string, ExecutionNode>>({})

  /* cache token required for retrieving logs */
  const [logsToken, setLogsToken] = React.useState('')
  const { getRBACErrorMessage } = useRBACError()

  /* These are used when auto updating selected stage/step when a pipeline is running */
  const [autoSelectedStageId, setAutoSelectedStageId] = React.useState<string>('')
  const [autoSelectedChildStageId, setAutoSelectedChildStageId] = React.useState<string>('')
  const [autoSelectedStepId, setAutoSelectedStepId] = React.useState<string>('')
  const [autoStageNodeExecutionId, setAutoStageNodeExecutionId] = React.useState<string>('')
  const [isPipelineInvalid, setIsPipelineInvalid] = React.useState(false)

  /* These are updated only when new data is fetched successfully */
  const [selectedStageId, setSelectedStageId] = React.useState<string>('')
  const [selectedStageExecutionId, setSelectedStageExecutionId] = React.useState<string>('')
  const [selectedChildStageId, setSelectedChildStageId] = React.useState<string>('')
  const [selectedStepId, setSelectedStepId] = React.useState<string>('')
  const [selectedCollapsedNodeId, setSelectedCollapsedNodeId] = React.useState<string>('')
  const { preference: savedExecutionView, setPreference: setSavedExecutionView } = usePreferenceStore<
    string | undefined
  >(PreferenceScope.USER, 'executionViewType')
  const queryParams = useQueryParams<ExecutionPageQueryParams & GitQueryParams>()
  const initialSelectedView = savedExecutionView || 'graph'
  const { view } = queryParams
  const isLogView = view === 'log' || (!view && initialSelectedView === 'log')
  const location = useLocation<{ shouldShowGovernanceEvaluations: boolean; governanceMetadata: GovernanceMetadata }>()
  const locationPathNameArr = location?.pathname?.split('/') || []
  const selectedPageTab = locationPathNameArr[locationPathNameArr.length - 1]
  const [deprecatedImageUsageMap, setDeprecatedImageUsageMap] =
    useState<Map<CIBuildInfrastructureType, CIExecutionImages>>()

  const { data, refetch, loading, error } = useGetExecutionDetailV2({
    planExecutionId: executionIdentifier,
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId,
      stageNodeId: isEmpty(queryParams.stage || autoSelectedStageId)
        ? undefined
        : queryParams.stage || autoSelectedStageId,
      ...(selectedStageId !== selectedStageExecutionId &&
        !isEmpty(selectedStageExecutionId) && {
          stageNodeExecutionId: selectedStageExecutionId
        }),
      ...(!isEmpty(queryParams.childStage || autoSelectedChildStageId) && {
        childStageNodeId: queryParams.childStage || autoSelectedChildStageId
      })
    },
    debounce: 500
  })

  const HAS_CI = hasCIStage(data?.data?.pipelineExecutionSummary)
  const IS_SERVICEDETAIL = hasServiceDetail(data?.data?.pipelineExecutionSummary)
  const IS_OVERVIEWPAGE = hasOverviewDetail(data?.data?.pipelineExecutionSummary)
  const history = useHistory()
  const CI_TESTTAB_NAVIGATION = useFeatureFlag(FeatureFlag.CI_TESTTAB_NAVIGATION)
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'
  const { data: serviceToken } = useGetToken({
    queryParams: { accountId }
  })

  const { data: reportSummary, loading: reportSummaryLoading } = useReportSummary({
    queryParams: {
      accountId,
      orgId: orgIdentifier,
      projectId: projectIdentifier,
      pipelineId: pipelineIdentifier,
      buildId: data?.data?.pipelineExecutionSummary?.runSequence?.toString() || '',
      stageId: '',
      report: 'junit' as const
    },
    lazy: !HAS_CI,
    requestOptions: {
      headers: {
        'X-Harness-Token': serviceToken || ''
      }
    }
  })

  useEffect(() => {
    if (data?.data?.pipelineExecutionSummary?.modules?.includes(ModuleName.CI.toLowerCase())) {
      Promise.all([
        getCustomerConfigPromise({
          queryParams: { accountIdentifier: accountId, infra: CIBuildInfrastructureType.K8, overridesOnly: true }
        }),
        getCustomerConfigPromise({
          queryParams: { accountIdentifier: accountId, infra: CIBuildInfrastructureType.VM, overridesOnly: true }
        })
      ]).then((executionConfigs: [ResponseCIExecutionImages, ResponseCIExecutionImages]) => {
        const deprecatedImageMap = new Map<CIBuildInfrastructureType, CIExecutionImages>()
        const deprecatedImagesForK8sInfra = executionConfigs[0].data
        const deprecatedImagesForVMInfra = executionConfigs[1].data
        if (deprecatedImagesForK8sInfra && !isEmpty(deprecatedImagesForK8sInfra)) {
          deprecatedImageMap.set(CIBuildInfrastructureType.K8, deprecatedImagesForK8sInfra)
        }
        if (deprecatedImagesForVMInfra && !isEmpty(deprecatedImagesForVMInfra)) {
          deprecatedImageMap.set(CIBuildInfrastructureType.VM, deprecatedImagesForVMInfra)
        }
        setDeprecatedImageUsageMap(deprecatedImageMap)
      })
    }
  }, [data?.data?.pipelineExecutionSummary?.modules?.length])

  const getDeprecatedImageUsageSummaryForInfraType = useCallback(
    (buildInfraType: CIBuildInfrastructureType): React.ReactElement => {
      if (!deprecatedImageUsageMap) {
        return <></>
      }
      if (isEmpty(deprecatedImageUsageMap.get(buildInfraType))) {
        return <></>
      }
      let buildInraTypeLabel = ''
      switch (buildInfraType) {
        case CIBuildInfrastructureType.K8:
          buildInraTypeLabel = getString('kubernetesText')
          break
        case CIBuildInfrastructureType.VM:
          buildInraTypeLabel = getString('pipeline.vmLabel')
          break
      }
      const el = (
        <>
          {`${getString('infrastructureTypeText')} ${buildInraTypeLabel}`}:&nbsp;
          {joinAsASentence(
            Object.entries(deprecatedImageUsageMap.get(buildInfraType) || {})
              .filter(item => !!item[0] && !!item[1])
              .map((item: [string, string]) => `${item[0]}(${item[1]})`)
          )}
        </>
      )
      return (
        <Text
          font={{ variation: FontVariation.SMALL_SEMI }}
          lineClamp={1}
          tooltip={
            <Text
              font={{ variation: FontVariation.SMALL_SEMI }}
              padding={{ left: 'medium', right: 'medium', top: 'small', bottom: 'small' }}
            >
              {el}
            </Text>
          }
        >
          {el}
        </Text>
      )
    },
    [deprecatedImageUsageMap]
  )

  const getDeprecatedImageUsageSummary = useCallback((): React.ReactElement => {
    return (
      <Layout.Vertical padding={{ top: 'xsmall', bottom: 'xsmall', right: 'large' }}>
        {getDeprecatedImageUsageSummaryForInfraType(CIBuildInfrastructureType.K8)}
        {getDeprecatedImageUsageSummaryForInfraType(CIBuildInfrastructureType.VM)}
      </Layout.Vertical>
    )
  }, [deprecatedImageUsageMap])

  const graphNodeMap = data?.data?.executionGraph?.nodeMap || {}
  const childGraphNodeMap = data?.data?.childGraph?.executionGraph?.nodeMap || {}

  let isDataLoadedForSelectedStage = Object.keys(graphNodeMap).some(
    key => graphNodeMap?.[key]?.setupId === selectedStageId
  )

  const isDataLoadedForChildSelectedStage = Object.keys(childGraphNodeMap).some(
    key => childGraphNodeMap?.[key]?.setupId === selectedChildStageId
  )
  isDataLoadedForSelectedStage ||= isDataLoadedForChildSelectedStage

  const allStagesMap = React.useMemo(() => {
    return getPipelineStagesMap(
      data?.data?.pipelineExecutionSummary?.layoutNodeMap,
      data?.data?.pipelineExecutionSummary?.startingNodeId
    )
  }, [data?.data?.pipelineExecutionSummary?.layoutNodeMap, data?.data?.pipelineExecutionSummary?.startingNodeId])

  const childPipelineStagesMap = React.useMemo(() => {
    return getPipelineStagesMap(
      data?.data?.childGraph?.pipelineExecutionSummary?.layoutNodeMap,
      data?.data?.childGraph?.pipelineExecutionSummary?.startingNodeId
    )
  }, [
    data?.data?.childGraph?.pipelineExecutionSummary?.layoutNodeMap,
    data?.data?.childGraph?.pipelineExecutionSummary?.startingNodeId
  ])

  let pipelineStagesMap = allStagesMap
  if (childPipelineStagesMap.size)
    pipelineStagesMap = new Map<string, GraphLayoutNode>([...pipelineStagesMap, ...childPipelineStagesMap])

  // combine steps and dependencies(ci stage)
  useDeepCompareEffect(() => {
    let nodeMap = { ...data?.data?.executionGraph?.nodeMap }
    if (data?.data?.childGraph?.executionGraph) nodeMap = { ...data?.data?.childGraph?.executionGraph?.nodeMap }

    nodeMap = processForCIData({ nodeMap, data })

    setAllNodeMap(oldNodeMap => {
      const interruptHistories = pickBy(oldNodeMap, val => get(val, '__isInterruptNode'))

      return { ...interruptHistories, ...nodeMap }
    })
  }, [
    data?.data?.executionGraph?.nodeMap,
    data?.data?.executionGraph?.nodeAdjacencyListMap,
    data?.data?.childGraph?.executionGraph?.nodeMap,
    data?.data?.childGraph?.executionGraph?.nodeAdjacencyListMap
  ])

  // Do polling after initial default loading and has some data, stop if execution is in complete status
  usePolling(refetch, {
    pollingInterval: POLL_INTERVAL,
    startPolling: !loading && !!data && !isExecutionComplete(data.data?.pipelineExecutionSummary?.status),
    pollOnInactiveTab: !isExecutionComplete(data?.data?.pipelineExecutionSummary?.status)
  })

  // show the current running stage and steps automatically
  React.useEffect(() => {
    setStageIds({
      queryParams,
      setAutoSelectedStageId,
      setAutoSelectedChildStageId,
      setAutoSelectedStepId,
      setAutoStageNodeExecutionId,
      setSelectedStepId,
      setSelectedStageId,
      setSelectedChildStageId,
      setSelectedStageExecutionId,
      data,
      error
    })
  }, [queryParams, data, error])

  React.useEffect(() => {
    return () => {
      logsCache.clear()
    }
  }, [])

  // update stage/step selection
  React.useEffect(() => {
    if (loading) {
      setSelectedStageId((queryParams.stage as string) || autoSelectedStageId)
      setSelectedChildStageId((queryParams.childStage as string) || autoSelectedChildStageId)
    }
    setSelectedStageExecutionId((queryParams?.stageExecId as string) || autoStageNodeExecutionId)
    setSelectedStepId((queryParams.step as string) || autoSelectedStepId)
    setSelectedCollapsedNodeId(queryParams?.collapsedNode ?? '')
    queryParams?.stage && !queryParams?.stageExecId && setAutoStageNodeExecutionId(queryParams?.stageExecId || '')
  }, [
    loading,
    queryParams,
    autoSelectedStageId,
    autoSelectedChildStageId,
    autoSelectedStepId,
    autoStageNodeExecutionId
  ])

  useEffect(() => {
    if (HAS_CI && CI_TESTTAB_NAVIGATION && reportSummary?.failed_tests) {
      const route = routes.toExecutionTestsView({
        orgIdentifier,
        pipelineIdentifier: pipelineIdentifier,
        executionIdentifier: executionIdentifier,
        projectIdentifier,
        accountId,
        module,
        source
      })
      //opening in new tab is required for cards present in dashboards
      if (IS_SERVICEDETAIL || IS_OVERVIEWPAGE) {
        window.open(`#${route}`)
      } else {
        history.push(route)
      }
    }
  }, [reportSummary])

  return (
    <ExecutionContext.Provider
      value={{
        pipelineExecutionDetail: data?.data || null,
        allNodeMap,
        pipelineStagesMap,
        childPipelineStagesMap,
        allStagesMap,
        isPipelineInvalid,
        selectedStageId,
        selectedChildStageId,
        selectedStepId,
        selectedStageExecutionId,
        selectedCollapsedNodeId,
        loading,
        isDataLoadedForSelectedStage,
        queryParams,
        logsToken,
        setLogsToken,
        refetch,
        setSelectedStageId,
        setSelectedStepId,
        setIsPipelineInvalid,
        setSelectedStageExecutionId,
        setSelectedCollapsedNodeId,
        addNewNodeToMap(id, node) {
          setAllNodeMap(nodeMap => ({ ...nodeMap, [id]: node }))
        }
      }}
    >
      <ExecutionPipelineVariables
        shouldFetch={data?.data?.pipelineExecutionSummary?.executionInputConfigured}
        accountIdentifier={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        planExecutionId={executionIdentifier}
      >
        {(!data && loading) || reportSummaryLoading ? <PageSpinner /> : null}
        {error ? (
          <PageError message={getRBACErrorMessage(error) as string} />
        ) : (
          <main className={css.main}>
            <div className={css.lhs}>
              <header className={css.header}>
                <ExecutionHeader />
                <ExecutionMetadata />
              </header>
              <ExecutionTabs savedExecutionView={savedExecutionView} setSavedExecutionView={setSavedExecutionView} />
              {module === 'ci' && (
                <>
                  {deprecatedImageUsageMap && deprecatedImageUsageMap.size > 0 ? (
                    <PipelineExecutionWarning
                      warning={
                        <Layout.Horizontal padding={{ left: 'xxlarge', right: 'xxlarge' }} flex>
                          <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
                            <Icon name="warning-sign" intent={Intent.DANGER} />
                            <Text color={Color.ORANGE_900} font={{ variation: FontVariation.SMALL_BOLD }}>
                              {getString('pipeline.imageVersionDeprecated')}
                            </Text>
                          </Layout.Horizontal>
                          <Layout.Vertical padding={{ left: 'large', right: 'large', top: 'xsmall', bottom: 'xsmall' }}>
                            <Text font={{ weight: 'semi-bold', size: 'small' }} color={Color.PRIMARY_10} lineClamp={2}>
                              {getString('pipeline.unsupportedImagesWarning')}
                            </Text>
                            <Container width="90%">{getDeprecatedImageUsageSummary()}</Container>
                          </Layout.Vertical>
                          {/* <Link to={'/'}>{getString('learnMore')}</Link> */}
                        </Layout.Horizontal>
                      }
                    />
                  ) : null}
                </>
              )}
              <div
                className={css.childContainer}
                data-view={selectedPageTab === PageTabs.PIPELINE && isLogView ? 'log' : 'graph'}
                id="pipeline-execution-container"
              >
                {props.children}
              </div>
              {!!location?.state?.shouldShowGovernanceEvaluations && (
                <EvaluationModal accountId={accountId} metadata={location?.state?.governanceMetadata} />
              )}
            </div>
          </main>
        )}
      </ExecutionPipelineVariables>
    </ExecutionContext.Provider>
  )
}
