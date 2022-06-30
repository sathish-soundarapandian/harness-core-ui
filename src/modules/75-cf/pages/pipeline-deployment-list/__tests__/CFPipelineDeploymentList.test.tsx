/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act, getByText } from '@testing-library/react'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { CurrentLocation, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import data from '@pipeline/pages/pipeline-deployment-list/__tests__/execution-list.json'
import services from '@pipeline/pages/pipelines/__tests__/mocks/services.json'
import deploymentTypes from '@pipeline/pages/pipelines/__tests__/mocks/deploymentTypes.json'
import environments from '@pipeline/pages/pipelines/__tests__/mocks/environments.json'
import filters from '@pipeline/pages/pipeline-deployment-list/__tests__/filters.json'
import pipelines from '@pipeline/components/PipelineModalListView/__tests__/RunPipelineListViewMocks'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { getMockFor_useGetPipeline } from '@pipeline/components/RunPipelineModal/__tests__/mocks'
import CIPipelineDeploymentList from '../CFPipelineDeploymentList'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))
jest.mock('@common/utils/YamlUtils', () => ({}))

const mockGetCallFunction = jest.fn()

jest.mock('services/pipeline-ng', () => ({
  useGetExecutionData: jest.fn().mockReturnValue({}),
  useGetPipelineSummary: getMockFor_useGetPipeline,
  useGetListOfExecutions: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve(data)),
    loading: false,
    cancel: jest.fn()
  })),
  useGetTemplateFromPipeline: jest.fn(() => ({ data: {} })),
  useGetPipeline: jest.fn(() => ({ data: {} })),
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(pipelines)), cancel: jest.fn(), loading: false }
  }),
  useCreateInputSetForPipeline: jest.fn(() => ({ data: {} })),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => ({ data: {} })),
  useHandleInterrupt: jest.fn(() => ({})),
  useHandleStageInterrupt: jest.fn(() => ({})),
  usePostPipelineExecuteWithInputSetYaml: jest.fn(() => ({ data: {} })),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(() => Promise.resolve(filters)), loading: false }
  }),
  usePostFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useUpdateFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useDeleteFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useGetInputsetYaml: jest.fn(() => ({ data: null, loading: false }))
}))

const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))
const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))

jest.mock('services/cd-ng', () => ({
  useGetServiceListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  }),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  }),
  useGetServiceDefinitionTypes: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: deploymentTypes, refetch: jest.fn() })),
  useGetEnvironmentListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() }))
}))

function ComponentWrapper(): React.ReactElement {
  return (
    <React.Fragment>
      <CIPipelineDeploymentList />
      <CurrentLocation />
    </React.Fragment>
  )
}

const TEST_PATH = routes.toPipelineDeploymentList({
  ...accountPathProps,
  ...pipelinePathProps,
  ...pipelineModuleParams
})

describe('<CIPipelineDeploymentList /> tests', () => {
  beforeAll(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1603645966706)
  })
  afterAll(() => {
    jest.spyOn(global.Date, 'now').mockReset()
  })
  test('snapshot test', async () => {
    const { container, findAllByText } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'testPip',
          module: 'ci'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CIPipelineDeploymentList />
      </TestWrapper>
    )

    await waitFor(() => findAllByText('http_pipeline', { selector: '.pipelineName' }))

    expect(container).toMatchSnapshot()
  })

  test('call run pipeline', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'testPip',
          module: 'ci'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ComponentWrapper />
      </TestWrapper>
    )

    const runButton = getByText(container, 'pipeline.runAPipeline')
    act(() => {
      fireEvent.click(runButton)
    })

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/ci/orgs/testOrg/projects/test/pipelines/testPip/pipeline-studio/?runPipeline=true
      </div>
    `)
  })
})
