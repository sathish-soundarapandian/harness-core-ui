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

import running from './__mocks__/useExecutionData/matrix-running.json'
import running2 from './__mocks__/useExecutionData/matrix-running2.json'
import waiting from './__mocks__/useExecutionData/matrix-waiting.json'
import failed from './__mocks__/useExecutionData/matrix-failed.json'
import success from './__mocks__/useExecutionData/matrix-success.json'

import { useExecutionData } from '../useExecutionData'

describe('useExecutionData Matrix Pipeline tests', () => {
  describe('user has selected stage and step', () => {
    const wrapper = (props: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper queryParams={{ stage: 'M1', step: 'S1', stageExecId: 'S1' }}>{props.children}</TestWrapper>
    )

    test('returns user selected stage, execution and step from query params, only if data is correct', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('S1')
    })

    test('auto selection stops if user has selected stage and step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('S1')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('S1')
    })

    test('returns user selected stage step from query params and not execution if data is incorrect', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper: (props: React.PropsWithChildren<unknown>): React.ReactElement => (
          <TestWrapper queryParams={{ stage: 'M1_Test', step: 'S1_Test', stageExecId: 'S1' }}>
            {props.children}
          </TestWrapper>
        )
      })
      expect(result.current.selectedStageId).toBe('M1_Test')
      expect(result.current.selectedStepId).toBe('S1_Test')
      expect(result.current.selectedStageExecutionId).toBe('')
    })
  })

  describe('user has selected only stage', () => {
    const wrapper = (props: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper queryParams={{ stage: 'M1' }}>{props.children}</TestWrapper>
    )

    test('Stage is running, returns running step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('S2')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedStageExecutionId).toBe('S3')
    })

    test('Stage is waiting, returns waiting step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: waiting as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('S2')
    })

    test('Stage has failed, returns failed step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: failed as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedStageExecutionId).toBe('S2')
    })

    test('Stage is success, returns last success step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: success as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('S1')
    })
  })

  describe('user has selected neither stage nor step', () => {
    const wrapper = (props: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{props.children}</TestWrapper>
    )

    test('Pipeline is running, returns running stage and step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('S2')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedStageExecutionId).toBe('S3')
    })

    test('Pipeline is waiting, returns waiting stage and step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: waiting as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('S2')
    })

    test('Pipeline has failed, returns failed stage and step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: failed as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedStageExecutionId).toBe('S2')
    })

    test('Pipeline is success, returns last successful stage and last step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: success as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('S1')
    })
  })

  describe('user has selected stage and clicked on show all in matrix steps', () => {
    test('returns user selected stage and collapsed node from query params', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper: (props: React.PropsWithChildren<unknown>) => (
          <TestWrapper queryParams={{ stage: 'M1', collapsedNode: 'S3' }}>{props.children}</TestWrapper>
        )
      })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('')
      expect(result.current.selectedStageExecutionId).toBe('')
      expect(result.current.selectedCollapsedNodeId).toBe('S3')
    })

    test('auto selection stops if user has selected stage and collapsed node', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper: (props: React.PropsWithChildren<unknown>) => (
          <TestWrapper queryParams={{ stage: 'M1', collapsedNode: 'S3' }}>{props.children}</TestWrapper>
        )
      })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('')
      expect(result.current.selectedStageExecutionId).toBe('')
      expect(result.current.selectedCollapsedNodeId).toBe('S3')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('M1')
      expect(result.current.selectedStepId).toBe('')
      expect(result.current.selectedStageExecutionId).toBe('')
      expect(result.current.selectedCollapsedNodeId).toBe('S3')
    })
  })
})
