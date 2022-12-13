/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as commonHooks from '@common/hooks'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { useGetPipelineSummaryQuery } from 'services/pipeline-rq'
import { StoreType } from '@common/constants/GitSyncTypes'
import PipelineDetails from '../PipelineDetails'
import { PipelineResponse } from './PipelineDetailsMocks'

jest.mock('services/pipeline-rq', () => ({
  useGetPipelineSummaryQuery: jest.fn(() => PipelineResponse)
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const mockBranches = {
  status: 'SUCCESS',
  data: {
    branches: [{ name: 'main' }, { name: 'main-demo' }, { name: 'main-patch' }, { name: 'main-patch2' }],
    defaultBranch: { name: 'main' }
  },
  metaData: null,
  correlationId: 'correlationId'
}

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches, error: null, loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

const NOT_PIPELINE_STUDIO_PATH = routes.toPipelineDetail({
  ...accountPathProps,
  ...pipelinePathProps,
  ...pipelineModuleParams
})
const PIPELINE_STUDIO_PATH = routes.toPipelineStudio({
  ...accountPathProps,
  ...pipelinePathProps,
  ...pipelineModuleParams
})

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useQueryParams: jest.fn().mockImplementation(() => ({}))
}))

describe('Pipeline Details tests', () => {
  test('render snapshot view for non pipeline studio route', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        path={NOT_PIPELINE_STUDIO_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineDetails />
      </TestWrapper>
    )
    const notPipelineStudio = getByTestId('not-pipeline-studio')
    expect(notPipelineStudio).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('Trigger tab disabled for git sync defaultBranch not the same as in url', async () => {
    jest
      .spyOn(commonHooks, 'useQueryParams')
      .mockImplementation(() => ({ branch: 'notDefaultBranch', repoIdentifier: 'gitExpRepo' }))

    const { getByTestId } = render(
      <TestWrapper
        path={NOT_PIPELINE_STUDIO_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineDetails />
      </TestWrapper>
    )
    const notPipelineStudio = getByTestId('not-pipeline-studio')
    expect(notPipelineStudio).toBeTruthy()
    const triggerTab = document.querySelectorAll('a[class*="TabNavigation"]')?.[2]
    if (!triggerTab) {
      throw Error('Cannot find Triggers tab')
    }
    const className = triggerTab.getAttribute('class')
    expect(className).toContain('disabled')
  })

  test('Trigger tab enabled for git sync defaultBranch the same as in url', async () => {
    jest
      .spyOn(commonHooks, 'useQueryParams')
      .mockImplementation(() => ({ branch: 'master', repoIdentifier: 'gitExpRepo' }))

    const { getByTestId } = render(
      <TestWrapper
        path={NOT_PIPELINE_STUDIO_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineDetails />
      </TestWrapper>
    )
    const notPipelineStudio = getByTestId('not-pipeline-studio')
    expect(notPipelineStudio).toBeTruthy()
    const triggerTab = document.querySelectorAll('a[class*="TabNavigation"]')?.[2]
    if (!triggerTab) {
      throw Error('Cannot find Triggers tab')
    }
    const className = triggerTab.getAttribute('class')
    expect(className).not.toContain('disabled')
  })

  test('pipelineStudio should be rendered pipeline studio is visited', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper
        path={PIPELINE_STUDIO_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineDetails />
      </TestWrapper>
    )
    const pipelineStudio = getByTestId('pipeline-studio')
    expect(pipelineStudio).toBeTruthy()
    expect(getByText('inputSetsText')).toBeInTheDocument()
  })

  test('should render correct view when api errors out and renders error handler component', () => {
    ;(useGetPipelineSummaryQuery as jest.Mock).mockImplementation(() => ({
      data: [],
      refetch: jest.fn(),
      error: {
        message: 'Error occured'
      },
      loading: false
    }))

    const updatedDefaultAppStoreValues = { ...defaultAppStoreValues, supportingGitSimplification: false }

    const { getByText, queryByText } = render(
      <TestWrapper
        path={PIPELINE_STUDIO_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={updatedDefaultAppStoreValues}
      >
        <PipelineDetails />
      </TestWrapper>
    )

    expect(getByText('Error occured')).toBeInTheDocument()
    expect(queryByText('pipeline.gitExperience.selectDiffBranch')).not.toBeInTheDocument()
  })

  test('should render correct view when api errors out and supportingGitSimplification is enabled', () => {
    ;(useGetPipelineSummaryQuery as jest.Mock).mockImplementation(() => ({
      data: [],
      refetch: jest.fn(),
      error: {
        message: 'Error occured'
      },
      loading: false
    }))

    jest.spyOn(commonHooks, 'useQueryParams').mockImplementation(() => ({ storeType: StoreType.REMOTE }))

    const updatedDefaultAppStoreValues = { ...defaultAppStoreValues, supportingGitSimplification: true }

    const { getByText } = render(
      <TestWrapper
        path={PIPELINE_STUDIO_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={updatedDefaultAppStoreValues}
      >
        <PipelineDetails />
      </TestWrapper>
    )

    expect(getByText('pipeline.gitExperience.selectDiffBranch')).toBeInTheDocument()
  })

  test('should render correct view when api errors out and isGitSyncEnabled is enabled', () => {
    ;(useGetPipelineSummaryQuery as jest.Mock).mockImplementation(() => ({
      data: [],
      refetch: jest.fn(),
      error: {
        data: {
          message: 'Error occured'
        }
      },
      loading: false
    }))

    const updatedDefaultAppStoreValues = { ...defaultAppStoreValues, isGitSyncEnabled: true }

    const { getByText } = render(
      <TestWrapper
        path={PIPELINE_STUDIO_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={updatedDefaultAppStoreValues}
      >
        <PipelineDetails />
      </TestWrapper>
    )

    expect(getByText('pipeline.gitExperience.selectDiffBranch')).toBeInTheDocument()
  })

  test('should render correct view when api errors out when supportingGitSimplification is enabled and storetype is inline', () => {
    ;(useGetPipelineSummaryQuery as jest.Mock).mockImplementation(() => ({
      data: [],
      refetch: jest.fn(),
      error: {
        message: 'Error occured'
      },
      loading: false
    }))

    jest.spyOn(commonHooks, 'useQueryParams').mockImplementation(() => ({ storeType: StoreType.INLINE }))

    const updatedDefaultAppStoreValues = { ...defaultAppStoreValues, supportingGitSimplification: true }

    const { queryByText } = render(
      <TestWrapper
        path={PIPELINE_STUDIO_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={updatedDefaultAppStoreValues}
      >
        <PipelineDetails />
      </TestWrapper>
    )

    expect(queryByText('pipeline.gitExperience.selectDiffBranch')).not.toBeInTheDocument()
    expect(queryByText('Error occured')).toBeInTheDocument()
  })
})
