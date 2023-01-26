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
  HealthSourceDTO,
  HealthSourceV2,
  HostData,
  NodeRiskCountDTO,
  PageMetricsAnalysis,
  RestResponseSetHealthSourceDTO
} from 'services/cv'
import { RiskValues } from '@cv/utils/CommonUtils'
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
  const graphData: DeploymentMetricsAnalysisRowProps[] = []
  for (const analysisData of metricData.content || []) {
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
        normalisedControlData,
        normalisedTestData
      } = hostInfo || {}
      const hostControlData: Highcharts.SeriesLineOptions['data'] = []
      const hostTestData: Highcharts.SeriesLineOptions['data'] = []
      const hostNormalisedControlData: Highcharts.SeriesLineOptions['data'] = []
      const hostNormalisedTestData: Highcharts.SeriesLineOptions['data'] = []

      const sortedControlData = controlData
        ?.slice()
        ?.sort((a, b) => (a?.timestampInMillis || 0) - (b?.timestampInMillis || 0))
      const sortedTestData = testData
        ?.slice()
        ?.sort((a, b) => (a?.timestampInMillis || 0) - (b?.timestampInMillis || 0))
      const sortedNormalisedControlData = normalisedControlData
        ?.slice()
        ?.sort((a, b) => (a?.timestampInMillis || 0) - (b?.timestampInMillis || 0))
      const sortedNormalisedTestData = normalisedTestData
        ?.slice()
        ?.sort((a, b) => (a?.timestampInMillis || 0) - (b?.timestampInMillis || 0))

      const controlDataInitialXValue = sortedControlData?.[0]?.timestampInMillis || 0
      const testDataInitialXValue = sortedTestData?.[0]?.timestampInMillis || 0
      const normalisedControlDataInitialXValue = sortedNormalisedControlData?.[0]?.timestampInMillis || 0
      const normalisedTestDataInitialXValue = sortedNormalisedTestData?.[0]?.timestampInMillis || 0

      sortedControlData?.forEach(({ timestampInMillis, value }) => {
        hostControlData.push({ x: (timestampInMillis || 0) - controlDataInitialXValue, y: value === -1 ? null : value })
      })

      sortedTestData?.forEach(({ timestampInMillis, value }) => {
        hostTestData.push({ x: (timestampInMillis || 0) - testDataInitialXValue, y: value === -1 ? null : value })
      })

      sortedNormalisedControlData?.forEach(({ timestampInMillis, value }) => {
        hostNormalisedControlData.push({
          x: (timestampInMillis || 0) - normalisedControlDataInitialXValue,
          y: value === -1 ? null : value
        })
      })

      sortedNormalisedTestData?.forEach(({ timestampInMillis, value }) => {
        hostNormalisedTestData.push({
          x: (timestampInMillis || 0) - normalisedTestDataInitialXValue,
          y: value === -1 ? null : value
        })
      })

      controlPoints.push({
        points: [...hostControlData],
        name: nodeIdentifier,
        initialXvalue: controlDataInitialXValue
      })
      testPoints.push({
        points: [...hostTestData],
        risk: analysisResult as HostData['risk'],
        analysisReason,
        name: controlNodeIdentifier as string,
        initialXvalue: testDataInitialXValue
      })
      normalisedControlPoints.push({
        points: [...hostNormalisedControlData],
        name: nodeIdentifier,
        initialXvalue: normalisedControlDataInitialXValue
      })
      normalisedTestPoints.push({
        points: [...hostNormalisedTestData],
        risk: analysisResult as HostData['risk'],
        name: controlNodeIdentifier as string,
        analysisReason,
        initialXvalue: normalisedTestDataInitialXValue
      })

      nodeRiskCountDTO = getNodeRiskCountDTO(testAnalysisResult, nodeRiskCountDTO)
    }

    graphData.push({
      controlData: [...controlPoints],
      testData: [...testPoints],
      normalisedControlData: [...normalisedControlPoints],
      normalisedTestData: [...normalisedTestPoints],
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
      verificationType: providerType === 'METRICS' ? 'TIME_SERIES' : 'LOG'
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
