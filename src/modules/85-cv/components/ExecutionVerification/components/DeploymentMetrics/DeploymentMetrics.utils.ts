/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import type { MultiSelectOption, SelectOption } from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import type { ExecutionNode } from 'services/pipeline-ng'
import type {
  AnalysedDeploymentNode,
  AnalysedDeploymentTestDataNode,
  HealthSourceDTO,
  HealthSourceV2,
  HostData,
  MetricValueV2,
  NodeRiskCountDTO,
  PageMetricsAnalysis,
  RestResponseSetHealthSourceDTO
} from 'services/cv'
import { RiskValues } from '@cv/utils/CommonUtils'
import { METRICS } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { VerificationType } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown.constants'
import type {
  HostControlTestData,
  HostTestData
} from './components/DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow.constants'
import type { DeploymentMetricsAnalysisRowProps } from './components/DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow'
import { DEFAULT_NODE_RISK_COUNTS, DEFAULT_PAGINATION_VALUEE } from './DeploymentMetrics.constants'

export function transformMetricData(
  selectedDataFormat: SelectOption,
  metricData?: PageMetricsAnalysis | null
): DeploymentMetricsAnalysisRowProps[] {
  if (!(Array.isArray(metricData?.content) && metricData?.content.length)) {
    return []
  }
  const metricInfo = { ...metricData }
  const graphData: DeploymentMetricsAnalysisRowProps[] = []
  for (const analysisData of metricInfo.content || []) {
    const {
      metricName,
      transactionGroup,
      analysisResult,
      testDataNodes = [],
      thresholds,
      healthSource,
      deeplinkURL
    } = analysisData || {}

    const controlPoints: HostControlTestData[] = []
    const testPoints: HostTestData[] = []
    const normalisedControlPoints: HostControlTestData[] = []
    const normalisedTestPoints: HostTestData[] = []

    let nodeRiskCountDTO = {
      totalNodeCount: testDataNodes.length,
      anomalousNodeCount: 0,
      nodeRiskCounts: DEFAULT_NODE_RISK_COUNTS
    } as NodeRiskCountDTO

    for (const hostInfo of testDataNodes) {
      const {
        controlData,
        testData,
        nodeIdentifier,
        analysisResult: testAnalysisResult,
        analysisReason,
        controlNodeIdentifier,
        controlDataType,
        normalisedControlData,
        normalisedTestData
      } = hostInfo || {}

      // Generating points for control host
      generatePointsForNodes(
        controlData,
        controlPoints,
        testAnalysisResult,
        analysisReason,
        controlNodeIdentifier,
        controlDataType
      )
      generatePointsForNodes(
        normalisedControlData,
        normalisedControlPoints,
        testAnalysisResult,
        analysisReason,
        controlNodeIdentifier,
        controlDataType
      )

      // generating points for testHost
      generatePointsForNodes(testData, testPoints, testAnalysisResult, analysisReason, nodeIdentifier)
      generatePointsForNodes(
        normalisedTestData,
        normalisedTestPoints,
        testAnalysisResult,
        analysisReason,
        nodeIdentifier
      )

      nodeRiskCountDTO = getNodeRiskCountDTO(testAnalysisResult, nodeRiskCountDTO)
    }

    graphData.push({
      controlData: selectedDataFormat?.value === 'normalised' ? [...normalisedControlPoints] : [...controlPoints],
      testData: selectedDataFormat?.value === 'normalised' ? [...normalisedTestPoints] : [...testPoints],
      transactionName: transactionGroup as string,
      metricName: metricName as string,
      risk: analysisResult,
      nodeRiskCount: nodeRiskCountDTO,
      thresholds,
      healthSource,
      deeplinkURL,
      selectedDataFormat
    })
  }

  return graphData
}

function generatePointsForNodes(
  inputTestData: MetricValueV2[] | undefined,
  points: HostTestData[] | HostControlTestData[],
  analysisResult: string | undefined,
  analysisReason: AnalysedDeploymentTestDataNode['analysisReason'],
  nodeIdentifier: string | undefined,
  controlDataType?: AnalysedDeploymentTestDataNode['controlDataType']
): void {
  const hostData: Highcharts.SeriesLineOptions['data'] = []
  const sortedTestData = inputTestData
    ?.slice()
    ?.sort((a, b) => (a?.timestampInMillis || 0) - (b?.timestampInMillis || 0))
  const testDataInitialXValue = sortedTestData?.[0]?.timestampInMillis || 0
  sortedTestData?.forEach(({ timestampInMillis, value }) => {
    hostData.push({ x: (timestampInMillis || 0) - testDataInitialXValue, y: value === -1 ? null : value })
  })

  points.push({
    points: [...hostData],
    risk: analysisResult as HostData['risk'],
    analysisReason,
    name: nodeIdentifier as string,
    initialXvalue: testDataInitialXValue,
    ...(controlDataType && { controlDataType })
  })
}

export function getNodeRiskCountDTO(
  testAnalysisResult: string | undefined,
  nodeRiskCountDTO: NodeRiskCountDTO
): NodeRiskCountDTO {
  switch (testAnalysisResult) {
    case RiskValues.HEALTHY:
      nodeRiskCountDTO = getUpdatedNodeRiskCountDTO(nodeRiskCountDTO, RiskValues.HEALTHY)
      break
    case RiskValues.WARNING:
      nodeRiskCountDTO = getUpdatedNodeRiskCountDTO(nodeRiskCountDTO, RiskValues.WARNING)
      break
    case RiskValues.UNHEALTHY:
      nodeRiskCountDTO = getUpdatedNodeRiskCountDTO(nodeRiskCountDTO, RiskValues.UNHEALTHY)
      nodeRiskCountDTO = {
        ...nodeRiskCountDTO,
        anomalousNodeCount: (nodeRiskCountDTO?.anomalousNodeCount || 0) + 1
      }
  }
  return nodeRiskCountDTO
}

export function getUpdatedNodeRiskCountDTO(nodeRiskCountDTO: NodeRiskCountDTO, status: RiskValues): NodeRiskCountDTO {
  nodeRiskCountDTO = {
    ...nodeRiskCountDTO,
    nodeRiskCounts: nodeRiskCountDTO?.nodeRiskCounts?.map(el => {
      if (el.risk === status) {
        return {
          ...el,
          count: (el?.count || 0) + 1
        }
      } else {
        return el
      }
    })
  }
  return nodeRiskCountDTO
}

export function getErrorMessage(errorObj?: any): string | undefined {
  return get(errorObj, 'data.detailedMessage') || get(errorObj, 'data.message')
}

export const getAccordionIds = (data: DeploymentMetricsAnalysisRowProps[]): string[] => {
  if (data.length) {
    return data?.map(
      analysisRow => `${analysisRow?.transactionName}-${analysisRow?.metricName}-${analysisRow?.healthSource?.type}`
    )
  }
  return []
}

export const getDropdownItems = (
  filterData?: string[] | null,
  isLoading?: boolean,
  error?: GetDataError<unknown> | null
): MultiSelectOption[] => {
  if (!filterData?.length || isLoading || error) {
    return []
  }

  return filterData.map(item => ({
    label: item,
    value: item
  }))
}

export function getInitialNodeName(selectedNode: AnalysedDeploymentNode | undefined): MultiSelectOption[] {
  if (!selectedNode) {
    return []
  }

  return [
    {
      label: selectedNode?.nodeIdentifier as string,
      value: selectedNode?.nodeIdentifier as string
    }
  ]
}

export function getQueryParamForHostname(value: string | undefined): string[] | undefined {
  return value ? [value] : undefined
}

export function getQueryParamFromFilters(value: string[]): string[] | undefined {
  return value.length ? value : undefined
}

export function getFilterDisplayText(selectedOptions: MultiSelectOption[], baseText: string, allText: string): string {
  return selectedOptions?.length > 0 ? baseText : baseText + `: ${allText}`
}

export function getShouldShowSpinner(loading: boolean, showSpinner: boolean): boolean {
  return loading && showSpinner
}

export function getShouldShowError(error: GetDataError<unknown> | null, shouldUpdateView: boolean): boolean | null {
  return error && shouldUpdateView
}

export function isErrorOrLoading(
  error: GetDataError<unknown> | null,
  loading: boolean
): boolean | GetDataError<unknown> {
  return error || loading
}

export function isStepRunningOrWaiting(status: ExecutionNode['status']): boolean {
  return status === 'Running' || status === 'AsyncWaiting'
}

export function generateHealthSourcesOptionsData(
  healthSourcesData: HealthSourceV2[] | null
): RestResponseSetHealthSourceDTO | null {
  const healthSourcesOptionsData: { resource: HealthSourceDTO[] } = {
    resource: []
  }

  healthSourcesData?.forEach((el: HealthSourceV2) => {
    const { identifier, name, type, providerType } = el
    healthSourcesOptionsData.resource.push({
      identifier,
      name,
      type: type as HealthSourceDTO['type'],
      verificationType: providerType === METRICS ? VerificationType.TIME_SERIES : VerificationType.LOG
    })
  })

  return healthSourcesOptionsData
}

export function getPaginationInfo(data: PageMetricsAnalysis | null): {
  pageIndex?: number
  pageItemCount?: number
  limit?: number
  totalPages?: number
  totalItems?: number
} {
  const { pageIndex, pageItemCount, pageSize, totalItems, totalPages } = data || {}
  const paginationInfo =
    {
      pageIndex,
      pageItemCount,
      limit: pageSize,
      totalPages,
      totalItems
    } || DEFAULT_PAGINATION_VALUEE
  return paginationInfo
}
