/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import type { IState } from '@ce/components/NodeRecommendation/constants'
import type { RecommendClusterRequest } from 'services/ce/recommenderService'

export const getProviderIcon = (provider: string): IconName => {
  const iconMapping: Record<string, IconName> = {
    google: 'gcp',
    azure: 'service-azure',
    amazon: 'service-aws'
  }

  return iconMapping[provider] || 'app-kubernetes'
}

export const addBufferToValue = (value: number, bufferPercentage: number, precision?: number): number =>
  +(((100 + bufferPercentage) / 100) * value).toFixed(precision || 2)

export const calculateSavingsPercentage = (savings: number, totalCost: number): string =>
  `(${Math.floor((savings / totalCost) * 100)}%)`

export const isResourceConsistent = (
  sumCpu: number,
  sumMemory: number,
  maxCpu: number,
  maxMemory: number,
  buffer: number
): boolean => {
  const sumCpuWithBuffer = addBufferToValue(sumCpu, buffer)
  const sumMemWithBuffer = addBufferToValue(sumMemory, buffer)

  const isInconsistent =
    Math.round(sumCpuWithBuffer) < Math.round(maxCpu) || Math.round(sumMemWithBuffer) < Math.round(maxMemory)

  const anyZero =
    Math.round(sumCpuWithBuffer) === 0 ||
    Math.round(sumMemWithBuffer) === 0 ||
    Math.round(maxCpu) === 0 ||
    Math.round(maxMemory) === 0

  return !isInconsistent && !anyZero
}

export const calculateNodes = (
  sumCpu: number,
  sumMemory: number,
  maxCpu: number,
  maxMemory: number,
  minNodes: number
): { maximumNodes: number; minimumNodes: number } => {
  let minimumNodes = minNodes || 3

  let maximumNodes = Math.min(Math.floor(sumCpu / maxCpu), Math.floor(sumMemory / maxMemory))
  maximumNodes = Math.max(maximumNodes, 1)

  if (maximumNodes < minNodes) {
    minimumNodes = maximumNodes
  }

  return { maximumNodes, minimumNodes }
}

export const convertStateToRecommendClusterPayload = (
  state: IState,
  resourceRequirement: RecommendClusterRequest,
  buffer: number
): RecommendClusterRequest => {
  const sumCpuWithBuffer = addBufferToValue(state.sumCpu, buffer)
  const sumMemWithBuffer = addBufferToValue(state.sumMem, buffer)

  const { maximumNodes, minimumNodes } = calculateNodes(
    sumCpuWithBuffer,
    sumMemWithBuffer,
    state.maxCpu,
    +state.maxMemory,
    +state.minNodes
  )

  return {
    ...resourceRequirement,
    sumCpu: +sumCpuWithBuffer,
    sumMem: +sumMemWithBuffer,
    minCpu: +state.maxCpu,
    minMem: +state.maxMemory,
    maxNodes: maximumNodes,
    minNodes: minimumNodes,
    includeSeries: state.includeSeries,
    includeTypes: state.includeTypes,
    excludeSeries: state.excludeSeries,
    excludeTypes: state.excludeTypes
  }
}

export const addBufferToState = (state: IState, buffer: number): IState => ({
  ...state,
  sumCpu: addBufferToValue(state.sumCpu, buffer),
  sumMem: addBufferToValue(state.sumMem, buffer)
})

interface InstanceFamilies {
  includeSeries: string[]
  includeTypes: string[]
  excludeSeries: string[]
  excludeTypes: string[]
}

export const getInstanceFamiliesFromState = (state: IState): InstanceFamilies => ({
  includeSeries: state.includeSeries,
  includeTypes: state.includeTypes,
  excludeSeries: state.excludeSeries,
  excludeTypes: state.excludeTypes
})
