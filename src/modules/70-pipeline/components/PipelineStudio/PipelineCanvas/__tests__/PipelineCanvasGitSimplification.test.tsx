/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import * as useModal from '@harness/use-modal'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { StoreType } from '@common/constants/GitSyncTypes'
import { PipelineCanvas, PipelineCanvasProps } from '../PipelineCanvas'
import { PipelineContext } from '../../PipelineContext/PipelineContext'
import { getGitContext } from './PipelineCanvasTestHelper'

const getProps = (): PipelineCanvasProps => ({
  toPipelineStudio: jest.fn(),
  toPipelineDetail: jest.fn(),
  toPipelineList: jest.fn(),
  toPipelineProject: jest.fn()
})

const gitTestPath = routes.toPipelineStudio({
  projectIdentifier: 'harness',
  orgIdentifier: 'default',
  pipelineIdentifier: 'Pipeline',
  accountId: 'px7xd_BFRCi-pfWPYXVjvw',
  module: 'cd'
})

const gitAppStore = { supportingGitSimplification: true }

const gitPathParams = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'Pipeline',
  module: 'cd'
}

const gitQueryParams = {
  branch: 'mainBranchName',
  repoName: 'harnessRepoName',
  connectorRef: 'harness',
  storeType: StoreType.REMOTE
}

const gitSimplificationTestProps = {
  path: gitTestPath,
  pathParams: gitPathParams,
  queryParams: gitQueryParams,
  defaultAppStoreValues: gitAppStore
}

/* Mocks */
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({
  validateJSONWithSchema: jest.fn().mockReturnValue({ error: { size: 2 } })
}))
jest.mock('framework/GitRepoStore/GitSyncStoreContext', () => ({
  useGitSyncStore: jest.fn().mockReturnValue({ gitSyncRepos: [{ identifier: 'repoIdentifier', name: 'repoName' }] })
}))

jest.mock('services/pipeline-ng', () => ({
  putPipelinePromise: jest.fn(),
  createPipelinePromise: jest.fn(),
  useGetInputsetYaml: () => jest.fn(),
  useGetTemplateFromPipeline: jest.fn(),
  useCreateVariablesV2: jest.fn(() => ({ refetch: jest.fn().mockResolvedValue({ data: null }) })),
  useGetYamlWithTemplateRefsResolved: jest.fn(() => ({ refetch: jest.fn().mockResolvedValue({ data: null }) }))
}))

jest.mock('services/pipeline-rq', () => ({
  useValidateTemplateInputsQuery: jest.fn(() => ({ data: null }))
}))

const showError = jest.fn()
const showSuccess = jest.fn()
const toasterClear = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError, showSuccess, clear: toasterClear }))
}))

const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

describe('Git simplication', () => {
  test('Git repo and branch are shown for remote pipelines', async () => {
    const props = getProps()
    const contextValue = getGitContext()
    const { container, findByText } = render(
      <TestWrapper {...gitSimplificationTestProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await findByText(gitQueryParams.repoName)
    // await findByText(gitQueryParams.branch)

    expect(container.querySelector('.gitRemoteDetailsWrapper')).toBeInTheDocument()
    expect(container.querySelector('[data-icon="repository"]')).toBeInTheDocument()
    expect(container.querySelector('[data-icon="git-new-branch"]')).toBeInTheDocument()
  })

  test('If pipeline not found in remote, we show branch selector', () => {
    const props = getProps()
    const contextValue = getGitContext(true)
    const { getByText, container } = render(
      <TestWrapper {...gitSimplificationTestProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container.querySelector('.normalInputStyle')).toBeInTheDocument()
    expect(container.querySelector('[data-icon="git-new-branch"]')).toBeInTheDocument()
    expect(getByText('pipeline.gitExperience.noEntityFound')).toBeInTheDocument()
    expect(getByText('pipeline.gitExperience.selectDiffBranch')).toBeInTheDocument()
    const remoteBranchInput = container.querySelector('input[name="remoteBranch"]') as HTMLInputElement
    expect(remoteBranchInput).toBeInTheDocument()
    expect(remoteBranchInput.value).toBe(gitQueryParams.branch)
  })

  test('Edit button opens modal', () => {
    const openModal = jest.fn()
    jest.spyOn(useModal, 'useModalHook').mockReturnValue([openModal, jest.fn()])

    const props = getProps()
    const contextValue = getGitContext()
    const { container } = render(
      <TestWrapper {...gitSimplificationTestProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(openModal).not.toHaveBeenCalled()
    const editButton = container.querySelector('[data-icon="Edit"]')?.parentElement as HTMLButtonElement
    act(() => {
      fireEvent.click(editButton)
    })
    expect(openModal).toBeCalledTimes(1)
  })
})
