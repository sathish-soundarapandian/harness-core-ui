import React from 'react'
import { renderHook } from '@testing-library/react-hooks'

import { TestWrapper } from '@common/utils/testUtils'
import type { ResponsePipelineExecutionDetail } from 'services/pipeline-ng'

import running from './__mocks__/useExecutionData/simple-running.json'
import running2 from './__mocks__/useExecutionData/simple-running2.json'
import waiting from './__mocks__/useExecutionData/simple-waiting.json'
import failed from './__mocks__/useExecutionData/simple-failed.json'
import success from './__mocks__/useExecutionData/simple-success.json'
import stageExecInput from './__mocks__/useExecutionData/simple-stage-exec-input.json'

import { useExecutionData } from '../useExecutionData'

describe('useExecutionData Simple Pipeline tests', () => {
  describe('generic tests', () => {
    test('handles no data', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: {} } },
        wrapper: (props: React.PropsWithChildren<unknown>) => <TestWrapper>{props.children}</TestWrapper>
      })

      expect(result.current.selectedStageId).toBe('')
      expect(result.current.selectedStepId).toBe('')
      expect(result.current.selectedStageExecutionId).toBe('')
    })
  })

  describe('user has selected stage and step', () => {
    const wrapper = (props: React.PropsWithChildren<unknown>) => (
      <TestWrapper queryParams={{ stage: 'MyStage', step: 'MyStep' }}>{props.children}</TestWrapper>
    )

    test('returns user selected stage and step from query params', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('MyStage')
      expect(result.current.selectedStepId).toBe('MyStep')
      expect(result.current.selectedStageExecutionId).toBe('')
    })

    test('auto selection stops if user has selected stage and step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })

      expect(result.current.selectedStageId).toBe('MyStage')
      expect(result.current.selectedStepId).toBe('MyStep')
      expect(result.current.selectedStageExecutionId).toBe('')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('MyStage')
      expect(result.current.selectedStepId).toBe('MyStep')
      expect(result.current.selectedStageExecutionId).toBe('')
    })
  })

  describe('user has selected only stage', () => {
    const wrapper = (props: React.PropsWithChildren<unknown>) => (
      <TestWrapper queryParams={{ stage: 'S2' }}>{props.children}</TestWrapper>
    )
    test('Pipeline is running, returns running step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('S2')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('S2')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedStageExecutionId).toBe('')
    })

    test('Pipeline is waiting, returns waiting step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: waiting as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('S2')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('')
    })

    test('Pipeline has failed, returns failed step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: failed as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('S2')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedStageExecutionId).toBe('')
    })

    test('Pipeline is success, returns last success step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: success as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('S2')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('')
    })
  })

  describe('user has selected neither stage nor step', () => {
    const wrapper = (props: React.PropsWithChildren<unknown>) => <TestWrapper>{props.children}</TestWrapper>
    test('Pipeline is running, returns running stage and step', () => {
      const { result, rerender } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: running as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('S2')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('')
      expect(result.current.selectedChildStageId).toBe('')

      rerender({ mockData: { data: running2 as ResponsePipelineExecutionDetail } })

      expect(result.current.selectedStageId).toBe('S3')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedStageExecutionId).toBe('')
      expect(result.current.selectedChildStageId).toBe('')
    })

    test('Pipeline is waiting, returns waiting stage and step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: waiting as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('S2')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('')
      expect(result.current.selectedChildStageId).toBe('')
    })

    test('Pipeline has failed, returns failed stage and step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: failed as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('S2')
      expect(result.current.selectedStepId).toBe('S2')
      expect(result.current.selectedStageExecutionId).toBe('')
      expect(result.current.selectedChildStageId).toBe('')
    })

    test('Pipeline is success, returns last successful stage and relevent step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: success as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('S3')
      expect(result.current.selectedStepId).toBe('S1')
      expect(result.current.selectedStageExecutionId).toBe('')
      expect(result.current.selectedChildStageId).toBe('')
    })

    test('For stage level execution inputs, open the virtual step', () => {
      const { result } = renderHook(useExecutionData, {
        initialProps: { mockData: { data: stageExecInput as ResponsePipelineExecutionDetail } },
        wrapper
      })
      expect(result.current.selectedStageId).toBe('S3')
      expect(result.current.selectedStepId).toBe('N0')
      expect(result.current.selectedStageExecutionId).toBe('')
      expect(result.current.selectedChildStageId).toBe('')
    })
  })
})
