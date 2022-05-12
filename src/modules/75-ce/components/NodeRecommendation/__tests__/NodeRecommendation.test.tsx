/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useReducer } from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'

import MockRecommendationData from '@ce/pages/node-recommendation-details/__test__/NodeRecommendationResponse.json'
import type {
  NodeRecommendationDto,
  RecommendationItemDto,
  RecommendationOverviewStats,
  RecommendNodePoolClusterRequest
} from 'services/ce/services'
import { NodepoolTimeRange, NodepoolTimeRangeType } from '@ce/types'
import NodeRecommendationDetails, {
  insertOrRemoveIntoArray,
  reducer,
  TuneRecommendationHelpText
} from '../NodeRecommendation'
import MockInstanceFamilyData from './MockInstanceFamilyData.json'
import { ACTIONS } from '../constants'

jest.mock('@ce/components/RecommendationDetailsSummaryCards/RecommendationDetailsSummaryCards', () => ({
  RecommendationDetailsSpendCard: () => 'recommendation-details-spend-card-mock',
  RecommendationDetailsSavingsCard: () => 'recommendation-details-savings-card-mock'
}))

jest.mock('@ce/components/InstanceFamiliesModalTab/InstanceFamiliesModalTab', () => ({
  InstanceFamiliesModalTab: () => 'Instance-Families-Modal-Tab'
}))

jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn()
  })
}))

jest.mock('services/ce/recommenderService', () => ({
  useRecommendCluster: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS'
      }
    })
  }))
}))

jest.mock('services/ce/publicPricingService', () => ({
  useGetSeries: jest.fn().mockImplementation(() => ({
    loading: false,
    data: MockInstanceFamilyData
  }))
}))

const mockNodeRecommendationRequestData = {
  recommendClusterRequest: { sumCpu: 4, sumMem: 7, minNodes: 3 },
  totalResourceUsage: { maxcpu: 4, maxmemory: 10 }
}

const initialState = {
  maxCpu: 10,
  maxMemory: 20,
  sumCpu: 40,
  sumMem: 70,
  minNodes: 6,
  includeTypes: ['type1', 'type2'],
  includeSeries: ['series1'],
  excludeTypes: ['type4'],
  excludeSeries: ['series8']
}

const { result } = renderHook(() => useReducer(reducer, initialState))

const [, dispatch] = result.current

describe('test cases for node recommendations reducer', () => {
  test('should be able to dispatch actions', async () => {
    act(() => dispatch({ type: 'mock_action' as unknown as ACTIONS, data: null }))
    const [defaultState] = result.current
    expect(defaultState).toMatchObject(initialState)

    act(() => dispatch({ type: ACTIONS.MAX_CPUS, data: 40 }))
    const [updatedMaxCpuState] = result.current
    expect(updatedMaxCpuState).toHaveProperty('maxCpu', 40)

    act(() => dispatch({ type: ACTIONS.MAX_MEM, data: 70 }))
    const [updatedMaxMemoryState] = result.current
    expect(updatedMaxMemoryState).toHaveProperty('maxMemory', 70)

    act(() => dispatch({ type: ACTIONS.SUM_CPUS, data: 50 }))
    const [updatedSumCpuState] = result.current
    expect(updatedSumCpuState).toHaveProperty('sumCpu', 50)

    act(() => dispatch({ type: ACTIONS.SUM_MEM, data: 80 }))
    const [updatedSumMemState] = result.current
    expect(updatedSumMemState).toHaveProperty('sumMem', 80)

    act(() => dispatch({ type: ACTIONS.MIN_NODES, data: 7 }))
    const [updatedMinNodesState] = result.current
    expect(updatedMinNodesState).toHaveProperty('minNodes', 7)

    act(() => dispatch({ type: ACTIONS.MAX_NODES, data: 12 }))
    const [updatedMaxNodesState] = result.current
    expect(updatedMaxNodesState).toHaveProperty('maxNodes', 12)

    act(() => dispatch({ type: ACTIONS.INCLUDE_TYPES, data: 'type5' }))
    const [updateIncludeTypesState] = result.current
    expect(updateIncludeTypesState).toHaveProperty('includeTypes', ['type1', 'type2', 'type5'])

    act(() => dispatch({ type: ACTIONS.INCLUDE_SERIES, data: 'series4' }))
    const [updateIncludeSeriesState] = result.current
    expect(updateIncludeSeriesState).toHaveProperty('includeSeries', ['series1', 'series4'])

    act(() => dispatch({ type: ACTIONS.EXCLUDE_TYPES, data: 'type4' }))
    const [updatedExcludeTypesState] = result.current
    expect(updatedExcludeTypesState).toHaveProperty('excludeTypes', [])

    act(() => dispatch({ type: ACTIONS.EXCLUDE_SERIES, data: 'series8' }))
    const [updatedExcludeSeriesState] = result.current
    expect(updatedExcludeSeriesState).toHaveProperty('excludeSeries', [])

    act(() =>
      dispatch({
        type: ACTIONS.UPDATE_TIME_RANGE,
        data: { sumCpu: 30, sumMem: 30, minNodes: 12, maxCpu: 60, maxMemory: 60 }
      })
    )
    const [updatedTimeRangeState] = result.current
    expect(updatedTimeRangeState).toHaveProperty('sumCpu', 30)
    expect(updatedTimeRangeState).toHaveProperty('sumMem', 30)
    expect(updatedTimeRangeState).toHaveProperty('minNodes', 12)
    expect(updatedTimeRangeState).toHaveProperty('maxCpu', 60)
    expect(updatedTimeRangeState).toHaveProperty('maxMemory', 60)

    act(() =>
      dispatch({
        type: ACTIONS.CLEAR_INSTACE_FAMILY,
        data: { includeTypes: [], includeSeries: [], excludeTypes: [], excludeSeries: [] }
      })
    )
    const [updatedClearInstaceFamilyState] = result.current
    expect(updatedClearInstaceFamilyState).toHaveProperty('includeTypes', [])
    expect(updatedClearInstaceFamilyState).toHaveProperty('includeSeries', [])
    expect(updatedClearInstaceFamilyState).toHaveProperty('excludeTypes', [])
    expect(updatedClearInstaceFamilyState).toHaveProperty('excludeSeries', [])

    act(() =>
      dispatch({
        type: ACTIONS.RESET_TO_DEFAULT,
        data: initialState
      })
    )
    const [updatedResetDefaultState] = result.current
    expect(updatedResetDefaultState).toMatchObject(initialState)
  })
})

describe('test cases for node recommendations utils', () => {
  expect(insertOrRemoveIntoArray(['string1', 'string2'], 'string1')).toEqual(['string2'])
  expect(insertOrRemoveIntoArray(['string1', 'string2'], 'string3')).toEqual(['string1', 'string2', 'string3'])
})

describe('test cases for node recommendations details', () => {
  test('should be able to render node recommendations details', async () => {
    const { container, getByTestId, getByText, queryByText } = render(
      <TestWrapper>
        <NodeRecommendationDetails
          nodePoolData={MockRecommendationData.data.recommendationsV2.items[0] as RecommendationItemDto}
          recommendationDetails={MockRecommendationData.data.recommendationDetails as NodeRecommendationDto}
          recommendationName="MOCK_RECOMMENDATION"
          recommendationStats={MockRecommendationData.data.recommendationStatsV2 as RecommendationOverviewStats}
          timeRange={{ value: NodepoolTimeRangeType.LAST_7, label: NodepoolTimeRange.LAST_7 }}
          nodeRecommendationRequestData={mockNodeRecommendationRequestData as RecommendNodePoolClusterRequest}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.change(getByTestId('sumCpu-input'), { target: { value: 40 } })
    })

    act(() => {
      fireEvent.change(getByTestId('sumMem-input'), { target: { value: 40 } })
    })

    act(() => {
      fireEvent.change(getByTestId('maxCpu-input'), { target: { value: 100 } })
    })
    act(() => {
      fireEvent.change(getByTestId('maxMemory-input'), { target: { value: 200 } })
    })

    act(() => {
      fireEvent.click(getByText('ce.nodeRecommendation.applyPreferences'))
    })

    act(() => {
      fireEvent.click(getByTestId('increment-minnode-btn'))
    })
    act(() => {
      fireEvent.change(getByTestId('minnodes-input'), { target: { value: 8 } })
    })
    act(() => {
      fireEvent.click(getByTestId('decrement-minnode-btn'))
    })

    act(() => {
      fireEvent.change(getByTestId('sumCpu-input'), { target: { value: 40 } })
    })
    act(() => {
      fireEvent.click(getByText('ce.recommendation.detailsPage.resetRecommendationText'))
    })

    act(() => {
      fireEvent.click(getByText('ce.nodeRecommendation.addPreferredInstanceFamilies'))
    })
    act(() => {
      fireEvent.click(getByText('caret-up'))
    })
    expect(queryByText('ce.nodeRecommendation.prefResourceNeeds')).toBeNull()

    act(() => {
      fireEvent.click(getByText('ce.recommendation.detailspage.tunerecommendations'))
    })
  })

  test('should be able to render tune recommendation help text', async () => {
    const { container } = render(
      <TestWrapper>
        <TuneRecommendationHelpText toggleCardVisible={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should be able to show inconsistent resource requirements error', async () => {
    const { getByTestId, queryByText } = render(
      <TestWrapper>
        <NodeRecommendationDetails
          nodePoolData={MockRecommendationData.data.recommendationsV2.items[0] as RecommendationItemDto}
          recommendationDetails={MockRecommendationData.data.recommendationDetails as NodeRecommendationDto}
          recommendationName="MOCK_RECOMMENDATION"
          recommendationStats={MockRecommendationData.data.recommendationStatsV2 as RecommendationOverviewStats}
          timeRange={{ value: NodepoolTimeRangeType.LAST_7, label: NodepoolTimeRange.LAST_7 }}
          nodeRecommendationRequestData={mockNodeRecommendationRequestData as RecommendNodePoolClusterRequest}
        />
      </TestWrapper>
    )

    act(() => {
      fireEvent.change(getByTestId('sumCpu-input'), { target: { value: 0 } })
    })

    act(() => {
      fireEvent.click(queryByText('ce.nodeRecommendation.applyPreferences')!)
    })

    await waitFor(() => {
      expect(queryByText('Inconsistent resource requirements')).toBeDefined()
    })
  })

  test('should be able to render node recommendations details when time is last 7 days', async () => {
    const { container } = render(
      <TestWrapper>
        <NodeRecommendationDetails
          nodePoolData={MockRecommendationData.data.recommendationsV2.items[0] as RecommendationItemDto}
          recommendationDetails={MockRecommendationData.data.recommendationDetails as NodeRecommendationDto}
          recommendationName="MOCK_RECOMMENDATION"
          recommendationStats={MockRecommendationData.data.recommendationStatsV2 as RecommendationOverviewStats}
          timeRange={{ value: NodepoolTimeRangeType.LAST_DAY, label: NodepoolTimeRange.LAST_DAY }}
          nodeRecommendationRequestData={mockNodeRecommendationRequestData as RecommendNodePoolClusterRequest}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should be able to render node recommendations details when time is last 30 days', async () => {
    const { container } = render(
      <TestWrapper>
        <NodeRecommendationDetails
          nodePoolData={MockRecommendationData.data.recommendationsV2.items[0] as RecommendationItemDto}
          recommendationDetails={MockRecommendationData.data.recommendationDetails as NodeRecommendationDto}
          recommendationName="MOCK_RECOMMENDATION"
          recommendationStats={MockRecommendationData.data.recommendationStatsV2 as RecommendationOverviewStats}
          timeRange={{ value: NodepoolTimeRangeType.LAST_30, label: NodepoolTimeRange.LAST_30 }}
          nodeRecommendationRequestData={mockNodeRecommendationRequestData as RecommendNodePoolClusterRequest}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should be able to render node recommendations details when props are empty', async () => {
    const { container } = render(
      <TestWrapper>
        <NodeRecommendationDetails
          nodePoolData={MockRecommendationData.data.recommendationsV2.items[0] as RecommendationItemDto}
          recommendationDetails={{} as NodeRecommendationDto}
          recommendationName="MOCK_RECOMMENDATION"
          recommendationStats={{} as RecommendationOverviewStats}
          timeRange={{ value: NodepoolTimeRangeType.LAST_30, label: NodepoolTimeRange.LAST_30 }}
          nodeRecommendationRequestData={{} as RecommendNodePoolClusterRequest}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
