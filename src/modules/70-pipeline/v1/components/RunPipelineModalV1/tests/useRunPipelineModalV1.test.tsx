/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { TestWrapper } from '@common/utils/testUtils'
import { RunPipelineModalV1Params, useRunPipelineModalV1 } from '../useRunPipelineModalV1'
import { getMockFor_Generic_useMutate, getMockFor_useGetTemplateFromPipeline } from './mocks'

const props: RunPipelineModalV1Params & GitQueryParams = {
  pipelineIdentifier: 'pipelineIdentifier',
  branch: 'propsBranch',
  repoIdentifier: 'propsRepo'
}

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('services/cd-ng', () => ({
  useShouldDisableDeployment: jest.fn().mockReturnValue({
    loading: false,
    data: {}
  }),
  useGetYamlSchema: jest.fn(() => ({ data: null })),
  useCreatePR: () => ({ data: [], mutate: jest.fn() }),
  useCreatePRV2: () => ({
    data: [],
    mutate: jest.fn()
  }),
  useGetFileContent: () => ({
    data: [],
    mutate: jest.fn(),
    refetch: jest.fn()
  }),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() }))
}))
jest.mock('services/cd-ng-rq', () => ({
  useListGitSyncQuery: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn() }
  }),
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn() }
  })
}))
jest.mock('services/pipeline-ng', () => ({
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useGetTemplateFromPipeline: jest.fn(() => getMockFor_useGetTemplateFromPipeline()),
  // useGetStagesExecutionList: jest.fn(() => ({})),
  useGetPipeline: jest.fn(() => ({ data: null })),
  usePostPipelineExecuteWithInputSetYaml: jest.fn(() => getMockFor_Generic_useMutate()),
  useRePostPipelineExecuteWithInputSetYaml: jest.fn(() => getMockFor_Generic_useMutate()),
  // useRerunStagesWithRuntimeInputYaml: jest.fn(() => getMockFor_Generic_useMutate()),
  // useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => getMockFor_Generic_useMutate()),
  useGetInputSetsListForPipeline: jest.fn(() => ({ data: null, refetch: jest.fn() })),
  useCreateVariablesV2: jest.fn(() => ({})),
  useCreateInputSetForPipeline: jest.fn(() => getMockFor_Generic_useMutate()),
  // useGetInputsetYamlV2: jest.fn(() => ({ data: null })),
  useRunStagesWithRuntimeInputYaml: jest.fn(() => getMockFor_Generic_useMutate()),
  // getInputSetForPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve(GetInputSetsResponse.data)),
  // useValidateTemplateInputs: jest.fn(() => getMockFor_Generic_useMutate()),
  useDebugPipelineExecuteWithInputSetYaml: jest.fn(() => getMockFor_Generic_useMutate())
}))

jest.mock('@harnessio/react-pipeline-service-client', () => ({
  useGetPipelineInputsQuery: jest.fn(() => getMockFor_Generic_useMutate())
}))

function Wrapped(): React.ReactElement {
  const { openRunPipelineModalV1 } = useRunPipelineModalV1({ ...props })
  return (
    <>
      <button className="check" onClick={() => openRunPipelineModalV1()} />
    </>
  )
}

describe('useRunPipelineModalV1 tests', () => {
  test('without input sets', () => {
    const { container, getAllByText } = render(
      <TestWrapper>
        <Wrapped />
      </TestWrapper>
    )

    const mockedButton = container.querySelector('.check')
    fireEvent.click(mockedButton!)
    expect(getAllByText('runPipeline')).toBeDefined()
    const runPipelineHeader = container.querySelector('.runModalHeaderTitle')
    expect(runPipelineHeader).toBeDefined()
  })
})
