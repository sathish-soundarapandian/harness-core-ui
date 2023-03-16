/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'

import { TestWrapper } from '@common/utils/testUtils'
import type { ResponsePipelineExecutionDetail } from 'services/pipeline-ng'

import running from './__mocks__/useExecutionData/chained-running.json'
import running2 from './__mocks__/useExecutionData/chained-running2.json'

import { useExecutionData } from '../useExecutionData'

describe('useExecutionData Chained Pipeline tests', () => {
  describe('user has selected stage and step', () => {
    const wrapper = (props: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper queryParams={{ stage: 'MyStage', step: 'MyStep', childStage: 'MyChildStage' }}>
        {props.children}
      </TestWrapper>
    )

    test('returns user selected stage and step from query params', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('MyStage')
      expect(result.current.selectedStepId).toBe('MyStep')
      expect(result.current.selectedChildStageId).toBe('MyChildStage')
    })

    test('auto selection stops if user has selected stage and step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('MyStage')
      expect(result.current.selectedStepId).toBe('MyStep')
      expect(result.current.selectedChildStageId).toBe('MyChildStage')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('MyStage')
      expect(result.current.selectedStepId).toBe('MyStep')
      expect(result.current.selectedChildStageId).toBe('MyChildStage')
    })
  })

  describe('user has selected only stage', () => {
    test('Pipeline is running, returns running step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper: (props: React.PropsWithChildren<unknown>) => (
          <TestWrapper queryParams={{ stage: 'C21' }}>{props.children}</TestWrapper>
        )
      })
      expect(result.current.selectedStageId).toBe('C21')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedChildStageId).toBe('S2')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('C21')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedChildStageId).toBe('S3')
    })
  })

  describe('user has selected neither stage nor step', () => {
    test('Pipeline is running, returns running stage and step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper: (props: React.PropsWithChildren<unknown>) => (
          <TestWrapper queryParams={{ stage: 'C2' }}>{props.children}</TestWrapper>
        )
      })
      expect(result.current.selectedStageId).toBe('C2')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedChildStageId).toBe('S2')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('C2')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedChildStageId).toBe('S3')
    })
  })
})
