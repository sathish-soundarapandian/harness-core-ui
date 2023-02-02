/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { noop } from 'lodash-es'
import pipelineList from '@pipeline/pages/execution-list/__tests__/mocks/pipeline-list.json'
import executionList from '@pipeline/pages/execution-list/__tests__/mocks/execution-list.json'
import filters from '@pipeline/pages/execution-list/__tests__/mocks/filters.json'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import deploymentTypes from '@pipeline/pages/pipeline-list/__tests__/mocks/deploymentTypes.json'
import services from '@pipeline/pages/pipeline-list/__tests__/mocks/services.json'
import environments from '@pipeline/pages/pipeline-list/__tests__/mocks/environments.json'
import { PipelineResponse as PipelineDetailsMockResponse } from '@pipeline/pages/pipeline-details/__tests__/PipelineDetailsMocks'
import { useGetListOfExecutions } from 'services/pipeline-ng'
import IACMPipelineDeploymentList from '../IACMPipelineDeploymentList'
const mockGetCallFunction = jest.fn()

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))
const mockRepositories = {
  status: 'SUCCESS',
  data: {
    repositories: ['main', 'main-patch', 'main-patch1', 'main-patch2']
  },
  metaData: null,
  correlationId: 'cc779876-d3af-44e5-8991-916dfecb4548'
}

const fetchRepositories = jest.fn(() => {
  return Object.create(mockRepositories)
})

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('@pipeline/components/Dashboards/PipelineSummaryCards/PipelineSummaryCards', () => () => <div />)
jest.mock('@pipeline/components/Dashboards/BuildExecutionsChart/PipelineBuildExecutionsChart', () => () => <div />)

jest.mock('services/pipeline-ng', () => ({
  useGetExecutionData: jest.fn().mockReturnValue({}),
  useGetListOfExecutions: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve(executionList)),
    loading: false,
    cancel: jest.fn()
  })),
  useGetExecutionRepositoriesList: jest.fn().mockImplementation(() => {
    return { data: mockRepositories, refetch: fetchRepositories, error: null, loading: false }
  }),
  useGetExecutionBranchesList: jest.fn().mockImplementation(() => {
    return { data: jest.fn(), refetch: jest.fn() }
  }),
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(pipelineList)), cancel: jest.fn(), loading: false }
  }),
  useGetTemplateFromPipeline: jest.fn(() => ({ data: {} })),
  useGetPipeline: jest.fn(() => ({ data: {} })),
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
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useGetStagesExecutionList: jest.fn(() => ({})),
  useRunStagesWithRuntimeInputYaml: jest.fn(() => ({ data: null })),
  useRePostPipelineExecuteWithInputSetYaml: jest.fn(() => ({ data: null })),
  useRerunStagesWithRuntimeInputYaml: jest.fn(() => ({ data: null })),
  useGetInputSetsListForPipeline: jest.fn(() => ({ data: null, refetch: jest.fn() })),
  useCreateVariablesV2: jest.fn(() => ({})),
  useValidateTemplateInputs: jest.fn(() => ({ data: null })),
  useDebugPipelineExecuteWithInputSetYaml: jest.fn(() => ({
    loading: false,
    refetch: jest.fn(),
    mutate: jest.fn().mockResolvedValue({
      data: {
        correlationId: '',
        status: 'SUCCESS',
        metaData: null,
        data: {}
      }
    })
  }))
}))

jest.mock('services/pipeline-rq', () => ({
  useGetPipelineSummaryQuery: jest.fn(() => PipelineDetailsMockResponse)
}))

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.mock('services/cd-ng', () => ({
  useGetServiceDefinitionTypes: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: deploymentTypes, refetch: jest.fn() })),
  useGetServiceList: jest.fn().mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  useGetEnvironmentListV2: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useCreatePR: jest.fn(() => noop),
  useCreatePRV2: jest.fn(() => noop),
  useGetFileContent: jest.fn(() => noop),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetGlobalFreezeWithBannerDetails: jest.fn().mockReturnValue({ data: null, loading: false }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

jest.mock('services/template-ng', () => ({
  useGetYamlWithTemplateRefsResolved: jest.fn(() => ({}))
}))

const renderExecutionPage = (): RenderResult =>
  render(
    <TestWrapper
      path={routes.toPipelineDeploymentList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
      pathParams={{
        accountId: 'accountId',
        orgIdentifier: 'orgIdentifier',
        projectIdentifier: 'projectIdentifier',
        pipelineIdentifier: 'pipelineIdentifier',
        module: 'iacm'
      }}
      defaultAppStoreValues={defaultAppStoreValues}
      queryParams={{ listview: true }}
    >
      <IACMPipelineDeploymentList />
    </TestWrapper>
  )

describe('IACMPipelineDeploymentList', () => {
  beforeAll(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1603645966706)
  })
  afterAll(() => {
    jest.spyOn(global.Date, 'now').mockReset()
  })

  test('should render pipelines', async () => {
    renderExecutionPage()
    const pipeline = await screen.findByRole('link', {
      name: 'PR Harness Env - CD Selective Stage'
    })
    expect(pipeline).toHaveAttribute(
      'href',
      '/account/accountId/iacm/orgs/orgIdentifier/projects/projectIdentifier/pipelines/pipelineIdentifier/executions/PO4Dd7pnSiOmyCjHkoNeMQ/pipeline?connectorRef=account.PRenvHarnessYamlGithub&repoName=ng-pr-manifests&branch=feat%2FCDS-41594-gitops&storeType=REMOTE'
    )
  })

  test('should be able to show any pipelines executions', async () => {
    renderExecutionPage()
    expect(useGetListOfExecutions).toHaveBeenCalled()
    // In pipeline execution history avoid module filter since we show all pipelines in any module and execution history also should be shown for any pipeline
    expect(useGetListOfExecutions).not.toHaveBeenLastCalledWith(
      expect.objectContaining({ queryParams: expect.objectContaining({ module: 'iacm' }) })
    )
  })
})
