/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { useGetPreflightCheckResponse, startPreflightCheckPromise } from 'services/pipeline-ng'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { TestWrapper } from '@common/utils/testUtils'
import { RunPipelineFormV1 } from '../RunPipelineFormV1'
import { getMockFor_Generic_useMutate, getMockFor_useGetPipeline, getMockFor_useGetTemplateFromPipeline } from './mocks'

const commonProps: PipelineType<PipelinePathProps & GitQueryParams> = {
  pipelineIdentifier: 'pid',
  projectIdentifier: 'prjid',
  accountId: 'acid',
  orgIdentifier: 'orgId',
  branch: 'br',
  repoIdentifier: 'repoid',
  module: 'ci'
}
const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS', data: {} })

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

jest.mock('services/cd-ng', () => ({
  useShouldDisableDeployment: jest.fn().mockReturnValue({
    loading: false,
    data: {}
  })
}))

const mockRePostPipelineExecuteYaml = jest.fn()

jest.mock('services/pipeline-ng', () => ({
  // used in RunPipelineForm
  useGetPipeline: jest.fn(() => getMockFor_useGetPipeline()),
  usePostPipelineExecuteWithInputSetYaml: jest.fn(() => getMockFor_Generic_useMutate()),
  useRePostPipelineExecuteWithInputSetYaml: jest.fn(() => getMockFor_Generic_useMutate(mockRePostPipelineExecuteYaml)),

  // used within PipelineVaribalesContext
  useCreateVariablesV2: jest.fn(() => ({})),

  // used within PreFlightCheckModal
  useGetPreflightCheckResponse: jest.fn(() => ({ data: { data: { status: 'SUCCESS' } } })),
  startPreflightCheckPromise: jest.fn().mockResolvedValue({}),
  useDebugPipelineExecuteWithInputSetYaml: jest.fn().mockImplementation(() => ({ mutate: successResponse }))
}))

jest.mock('@harnessio/react-pipeline-service-client', () => ({
  useGetPipelineInputsQuery: jest.fn(() => getMockFor_useGetTemplateFromPipeline())
}))

describe('<RunPipelineForm', () => {
  test('should should have the values prefilled', async () => {
    const { container } = render(
      <TestWrapper>
        <RunPipelineFormV1 {...commonProps} executionView={true} source="executions" />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should close the modal on cancel click', async () => {
    const onCloseMocked = jest.fn()
    const { findByText } = render(
      <TestWrapper>
        <RunPipelineFormV1 {...commonProps} onClose={onCloseMocked} source="executions" />
      </TestWrapper>
    )
    const cancel = await findByText('cancel')

    fireEvent.click(cancel)

    await waitFor(() => expect(onCloseMocked).toBeCalled())
  })

  test('preflight api getting called if skipPreflight is unchecked', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <RunPipelineFormV1 {...commonProps} source="executions" />
      </TestWrapper>
    )

    // Preflight check is not skipped
    const skipPreflightButton = getByText('pre-flight-check.skipCheckBtn').querySelector(
      '[type=checkbox]'
    ) as HTMLInputElement
    expect(skipPreflightButton.checked).toBeFalsy()

    // Submit button click
    const runButton = container.querySelector('button[type="submit"]')
    await act(() => {
      fireEvent.click(runButton!)
    })

    // Check preflight functions called
    await waitFor(() => expect(useGetPreflightCheckResponse).toBeCalled())
    await waitFor(() => expect(startPreflightCheckPromise).toBeCalled())
  })
})
