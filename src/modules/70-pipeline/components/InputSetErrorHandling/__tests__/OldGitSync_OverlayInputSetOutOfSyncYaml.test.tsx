/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor, findByText as findByTextBody } from '@testing-library/react'
import { noop } from 'lodash-es'
import userEvent from '@testing-library/user-event'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, inputSetFormPathProps } from '@common/utils/routeUtils'
import * as pipelineng from 'services/pipeline-ng'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import { OverlayInputSetForm } from '@pipeline/components/OverlayInputSetForm/OverlayInputSetForm'
import { gitHubMock } from '@gitsync/components/gitSyncRepoForm/__tests__/mockData'
import {
  TemplateResponse,
  PipelineResponse,
  ConnectorResponse,
  MergeInputSetResponse,
  MergedPipelineResponse,
  errorResponse
} from '../../InputSetForm/__tests__/InputSetMocks'
import {
  GetInputSetsInlineResponse,
  GetInputSetsOldGitSyncResponse,
  GetInvalidInputSetInline,
  GetInvalidOverlayISOldGitSync,
  GetInvalidOverlayOldGitSync,
  GetOverlayISYamlDiffInline,
  GetOverlayISYamlDiffOldGitSync,
  GetYamlDiffDelResponse,
  mockBranches,
  mockRepos
} from './InputSetErrorHandlingMocks'

const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS', data: {} })
jest.mock('@common/utils/YamlUtils', () => ({}))

function YamlMock({ children, bind }: { children: JSX.Element; bind: YamlBuilderProps['bind'] }): React.ReactElement {
  const handler = React.useMemo(
    () =>
      ({
        getLatestYaml: () => GetInvalidOverlayOldGitSync.data?.data?.overlayInputSetYaml || '',
        getYAMLValidationErrorMap: () => new Map()
      } as YamlBuilderHandlerBinding),
    []
  )

  React.useEffect(() => {
    bind?.(handler)
  }, [bind, handler])
  return (
    <div>
      <span>Yaml View</span>
      {children}
    </div>
  )
}

YamlMock.YamlBuilderMemo = YamlMock

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => YamlMock)

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.useFakeTimers()

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const fetchRepos = jest.fn(() => Promise.resolve(mockRepos))
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  useCreatePR: jest.fn(() => noop),
  useCreatePRV2: jest.fn(() => noop),
  useGetSettingValue: jest.fn(() => noop),
  useGetFileContent: jest.fn(() => noop),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(gitHubMock)),
  useGetListOfReposByRefConnector: jest.fn().mockImplementation(() => {
    return { data: mockRepos, refetch: fetchRepos, loading: false }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  }),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(props => {
    if (props.name === 'useGetYamlWithTemplateRefsResolved') {
      return MergedPipelineResponse
    } else {
      return TemplateResponse
    }
  })
}))

jest.mock('services/pipeline-ng', () => ({
  useGetInputSetForPipeline: jest.fn(() => GetInvalidInputSetInline),
  useCreateVariablesV2: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve({ data: { yaml: '' } })),
    loading: false,
    cancel: jest.fn()
  })),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => MergeInputSetResponse),
  useGetPipeline: jest.fn(() => PipelineResponse),
  useSanitiseInputSet: jest.fn(() => PipelineResponse),
  useDeleteInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useGetTemplateFromPipeline: jest.fn(() => TemplateResponse),
  useGetStagesExecutionList: jest.fn(() => ({})),
  useGetOverlayInputSetForPipeline: jest.fn(() => GetInvalidOverlayOldGitSync),
  useCreateInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useCreateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: errorResponse })),
  useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsInlineResponse),
  useGetSchemaYaml: jest.fn().mockImplementation(() => ({ data: {} })),
  useYamlDiffForInputSet: jest.fn(() => GetOverlayISYamlDiffInline)
}))

const mockSuccessHandler = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: mockSuccessHandler,
    showError: jest.fn()
  })
}))

const intersectionObserverMock = (): any => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

const TEST_INPUT_SET_FORM_PATH = routes.toInputSetForm({
  ...accountPathProps,
  ...inputSetFormPathProps,
  ...pipelineModuleParams
})

const renderGitSyncComponent = (): RenderResult => {
  return render(
    <GitSyncTestWrapper
      path={TEST_INPUT_SET_FORM_PATH}
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        pipelineIdentifier: 'testpip',
        inputSetIdentifier: 'test_input_set',
        module: 'cd'
      }}
      queryParams={{
        repoIdentifier: 'oldgitsyncharness',
        branch: 'master'
      }}
      defaultAppStoreValues={{ ...defaultAppStoreValues, isGitSyncEnabled: true }}
    >
      <OverlayInputSetForm
        hideForm={jest.fn()}
        identifier="overlayInpG1"
        overlayInputSetBranch="master"
        overlayInputSetRepoIdentifier="oldgitsyncharness"
      />
    </GitSyncTestWrapper>
  )
}

describe('Old Git Sync Input Set Error Exp', () => {
  beforeAll(() => {
    jest.mock('services/pipeline-ng', () => ({
      useGetInputSetForPipeline: jest.fn(() => GetInvalidOverlayISOldGitSync),
      useYamlDiffForInputSet: jest.fn(() => GetOverlayISYamlDiffOldGitSync),
      useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsOldGitSyncResponse)
    }))
  })

  test('should open yaml view and render out of sync error strip ', async () => {
    renderGitSyncComponent()
    expect(screen.getByRole('button', { name: 'pipeline.outOfSyncErrorStrip.reconcile' })).toBeDefined()
  })

  test('should open reconcile dialog on clicking reconcile button, when loading state is false & input set is not empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetOverlayISYamlDiffOldGitSync)
    renderGitSyncComponent()
    jest.runOnlyPendingTimers()

    const reconcileBtn = await screen.findByRole('button', { name: 'pipeline.outOfSyncErrorStrip.reconcile' })
    userEvent.click(reconcileBtn)
    expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()

    const reconcileDialog = document.getElementsByClassName('bp3-portal')[1] as HTMLElement
    await findByTextBody(reconcileDialog, 'pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = await screen.findByRole('button', { name: 'pipeline.inputSets.removeInvalidFields' })
    expect(reconcileDialog).toMatchSnapshot('Reconcile Dialog - Old Git Sync')

    userEvent.click(removeInvalidFieldBtn)
    let gitSaveBtn: HTMLElement
    await waitFor(async () => {
      const portalDiv = document.getElementsByClassName('bp3-portal')[1] as HTMLElement
      const savePipelinesToGitHeader = await screen.findByText('common.git.saveResourceLabel')
      expect(savePipelinesToGitHeader).toBeInTheDocument()
      const gitSave = await findByTextBody(portalDiv, 'save')
      gitSaveBtn = gitSave.parentElement as HTMLElement
      expect(gitSaveBtn).toBeInTheDocument()
    })
    userEvent.click(gitSaveBtn!)
    await waitFor(() => expect(pipelineng.useUpdateOverlayInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(mockSuccessHandler).toHaveBeenCalled())
  })

  test('should not update overlay input set as status is ERROR', async () => {
    jest.spyOn(pipelineng, 'useUpdateOverlayInputSetForPipeline').mockImplementation((): any => {
      return {
        mutate: () =>
          Promise.reject({
            status: 'ERROR'
          })
      }
    })
    renderGitSyncComponent()
    jest.runOnlyPendingTimers()

    const reconcileBtn = await screen.findByRole('button', { name: 'pipeline.outOfSyncErrorStrip.reconcile' })
    userEvent.click(reconcileBtn)
    expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()

    const reconcileDialog = document.getElementsByClassName('bp3-portal')[1] as HTMLElement
    await findByTextBody(reconcileDialog, 'pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = screen.getByRole('button', { name: 'pipeline.inputSets.removeInvalidFields' })
    userEvent.click(removeInvalidFieldBtn)
    await waitFor(() => expect(pipelineng.useUpdateOverlayInputSetForPipeline).toHaveBeenCalled())
  })

  test('should open delete input set modal on clicking reconcile button, if input set is empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetYamlDiffDelResponse)
    jest.spyOn(pipelineng, 'useDeleteInputSetForPipeline').mockImplementation((): any => {
      return {
        mutate: () =>
          Promise.resolve({
            status: 'SUCCESS'
          })
      }
    })
    renderGitSyncComponent()
    jest.runOnlyPendingTimers()

    const reconcileBtn = await screen.findByRole('button', { name: 'pipeline.outOfSyncErrorStrip.reconcile' })
    userEvent.click(reconcileBtn)
    expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()

    const deleteInputSetModal = document.getElementsByClassName('bp3-portal')[1] as HTMLElement
    await findByTextBody(deleteInputSetModal, 'pipeline.inputSets.invalidOverlayISDesc1')
    const deleteOverlayISBtn = await screen.findByRole('button', { name: 'pipeline.inputSets.deleteOverlayIS' })
    expect(deleteInputSetModal).toMatchSnapshot('Delete Overlay Input Set Modal - OLd Git Sync')

    userEvent.click(deleteOverlayISBtn)
    await waitFor(() => expect(pipelineng.useDeleteInputSetForPipeline).toHaveBeenCalled())
    await waitFor(() => expect(mockSuccessHandler).toHaveBeenCalled())
  })
})
