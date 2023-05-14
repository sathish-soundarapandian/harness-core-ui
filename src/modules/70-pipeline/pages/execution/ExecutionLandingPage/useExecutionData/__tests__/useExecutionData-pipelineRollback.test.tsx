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

import running from './__mocks__/useExecutionData/pipeline-rollback-running.json'
import running2 from './__mocks__/useExecutionData/pipeline-rollback-running2.json'
import failed from './__mocks__/useExecutionData/pipeline-rollback-success.json'

import { useExecutionData } from '../useExecutionData'

describe('useExecutionData Pipeline Rollback tests', () => {
  describe('user has selected parent rollback stage, child stage and step', () => {
    const wrapper = (props: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper queryParams={{ stage: 'MyRollbackStage', step: 'MyStep', childStage: 'MyChildStage' }}>
        {props.children}
      </TestWrapper>
    )

    test('returns user selected rollback and child stage, and step from query params', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('MyRollbackStage')
      expect(result.current.selectedStepId).toBe('MyStep')
      expect(result.current.selectedChildStageId).toBe('MyChildStage')
    })

    test('auto selection stops if user has selected stage and step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('MyRollbackStage')
      expect(result.current.selectedStepId).toBe('MyStep')
      expect(result.current.selectedChildStageId).toBe('MyChildStage')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('MyRollbackStage')
      expect(result.current.selectedStepId).toBe('MyStep')
      expect(result.current.selectedChildStageId).toBe('MyChildStage')
    })
  })

  describe('user has selected only parent rollback stage', () => {
    test('Pipeline is running with non-rollback selected stage, returns running child stage and step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper: (props: React.PropsWithChildren<unknown>) => (
          <TestWrapper queryParams={{ stage: 'PRB21' }}>{props.children}</TestWrapper>
        )
      })

      // If rollback execution graph is available, and the user has chosen a non-rollback stage, then
      // pipelineExecutionSummary?.layoutNodeMap?.[stageId]?.nodeType === StageType.PIPELINE_ROLLBACK condition -> falsy
      // so, rollback status -> undefined and stepId -> ''

      expect(result.current.selectedStageId).toBe('PRB21')
      expect(result.current.selectedStepId).toBe('')
      expect(result.current.selectedChildStageId).toBe('')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('PRB21')
      expect(result.current.selectedStepId).toBe('')
      expect(result.current.selectedChildStageId).toBe('')
    })

    test('Pipeline is running with rollback selected stage, returns running child stage and step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper: (props: React.PropsWithChildren<unknown>) => (
          <TestWrapper queryParams={{ stage: 'PRB' }}>{props.children}</TestWrapper>
        )
      })

      expect(result.current.selectedStageId).toBe('PRB')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedChildStageId).toBe('D2')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('PRB')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedChildStageId).toBe('D1')
    })
  })

  describe('user has selected neither stage nor step', () => {
    const wrapper = (props: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{props.children}</TestWrapper>
    )
    test('Pipeline is running, returns running parent rollback stage, child stage and step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('PRB')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedChildStageId).toBe('D2')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('PRB')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedChildStageId).toBe('D1')
    })

    test('Pipeline has failed with success pipeline rollback, returns failed deployment stage and step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: failed as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('D2')
      expect(result.current.selectedStepId).toBe('S3')
      expect(result.current.selectedChildStageId).toBe('')
    })
  })
})
