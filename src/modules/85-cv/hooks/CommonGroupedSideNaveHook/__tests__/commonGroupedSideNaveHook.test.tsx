/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { getGroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.utils'
import useCommonGroupedSideNaveHook from '../useCommonGroupedSideNaveHook'

describe('Validate useCommonGroupedSideNaveHook Hook', () => {
  test('useDrawer', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>
        <>{children}</>
      </TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useCommonGroupedSideNaveHook({
          defaultCustomMetricName: 'Default Custom Metric',
          initCustomMetricData: {},
          mappedServicesAndEnvs: new Map()
        }),
      { wrapper }
    )
    expect((result as any).current.createdMetrics).toEqual([])
    expect((result as any).current.groupedCreatedMetrics).toEqual({})
    expect((result as any).current.groupedCreatedMetricsList).toEqual([])
    expect((result as any).current.mappedMetrics).toEqual(new Map())
    expect((result as any).current.selectedMetric).toEqual('Default Custom Metric')
    expect((result as any).current.selectedMetricIndex).toEqual(-1)

    act(() => {
      result.current.setCreatedMetrics({ selectedMetricIndex: 0, createdMetrics: ['test metric'] })
    })
    expect((result as any).current.createdMetrics).toEqual(['test metric'])

    const updatedMap = new Map()
    updatedMap.set('test metric', { metricName: 'test metric', groupName: { label: 'group 1', value: 'group1' } })

    act(() => {
      result.current.setMappedMetrics({
        selectedMetric: 'test metric',
        mappedMetrics: updatedMap
      })
    })
    expect((result as any).current.selectedMetric).toEqual('test metric')
    expect((result as any).current.mappedMetrics).toEqual(updatedMap)

    const updatedGroupedCreatedMetrics = getGroupedCreatedMetrics(updatedMap, val => val)
    act(() => {
      result.current.setGroupedCreatedMetrics(updatedGroupedCreatedMetrics)
    })

    expect((result as any).current.groupedCreatedMetrics).toEqual({
      'group 1': [
        {
          groupName: {
            label: 'group 1',
            value: 'group1'
          },
          index: 0,
          metricName: 'test metric'
        }
      ]
    })
    expect((result as any).current.groupedCreatedMetricsList).toEqual(['test metric'])
  })
})
