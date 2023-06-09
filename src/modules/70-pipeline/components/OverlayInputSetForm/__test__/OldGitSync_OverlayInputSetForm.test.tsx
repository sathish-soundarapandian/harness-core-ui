/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, queryByText, findByTestId } from '@testing-library/react'
import { noop } from 'lodash-es'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import gitSyncListResponse from '@common/utils/__tests__/mocks/gitSyncRepoListMock.json'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  pipelineModuleParams,
  pipelinePathProps,
  inputSetFormPathProps
} from '@common/utils/routeUtils'
import * as pipelineng from 'services/pipeline-ng'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { branchStatusMock } from '@connectors/mocks/mock'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import { OverlayInputSetForm } from '@pipeline/components/OverlayInputSetForm/OverlayInputSetForm'
import { GetInputSetYamlDiffInline } from '@pipeline/components/InputSetErrorHandling/__tests__/InputSetErrorHandlingMocks'
import {
  TemplateResponse,
  PipelineResponse,
  ConnectorResponse,
  GetInputSetsResponse,
  GetInputSetEdit,
  MergeInputSetResponse,
  GetOverlayInputSetEdit_oldGitSync,
  MergedPipelineResponse,
  sourceCodeManage,
  errorResponse
} from '../../InputSetForm/__tests__/InputSetMocks'

const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS' })
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock(
  '@common/components/YAMLBuilder/YamlBuilder',
  () =>
    ({ children, bind }: { children: JSX.Element; bind: YamlBuilderProps['bind'] }) => {
      const handler = React.useMemo(
        () =>
          ({
            getLatestYaml: () => GetOverlayInputSetEdit_oldGitSync.data?.data?.overlayInputSetYaml || '',
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
)
jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.useFakeTimers()

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitSyncListResponse))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetFileContent: jest.fn(() => noop),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  getListOfBranchesWithStatusPromise: jest.fn().mockImplementation(() => Promise.resolve(branchStatusMock)),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitSyncListResponse, refetch: getListGitSync }
  }),
  useGetSettingValue: jest.fn().mockImplementation(() => {
    return { data: { allowDifferentRepoSettings: { data: { value: 'false' } }, loading: false } }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManage, refetch: jest.fn() }
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
  useGetInputSetForPipeline: jest.fn(() => GetInputSetEdit),
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
  useGetOverlayInputSetForPipeline: jest.fn(() => GetOverlayInputSetEdit_oldGitSync),
  useCreateInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useCreateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: errorResponse })),
  useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsResponse),
  useGetSchemaYaml: jest.fn().mockImplementation(() => ({ data: {} })),
  useYamlDiffForInputSet: jest.fn(() => GetInputSetYamlDiffInline)
}))

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

const TEST_INPUT_SET_PATH = routes.toInputSetList({
  ...accountPathProps,
  ...pipelinePathProps,
  ...pipelineModuleParams
})
const TEST_INPUT_SET_FORM_PATH = routes.toInputSetForm({
  ...accountPathProps,
  ...inputSetFormPathProps,
  ...pipelineModuleParams
})

describe('OverlayInputSetForm Tests', () => {
  describe('Edit OverlayInputSet - ', () => {
    test('render Edit Overlay Input Set Form with GitSync', async () => {
      const { getByText } = render(
        <GitSyncTestWrapper
          path={TEST_INPUT_SET_FORM_PATH}
          pathParams={{
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            inputSetIdentifier: '-1',
            module: 'cd'
          }}
          queryParams={{
            repoIdentifier: 'identifier',
            branch: 'feature'
          }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <OverlayInputSetForm hideForm={jest.fn()} identifier="OverLayInput" />
        </GitSyncTestWrapper>
      )

      // Click on Save button in the form and check if Save to Git dialog opens properly
      const saveBtn = getByText('save').parentElement
      expect(saveBtn).toBeInTheDocument()
      fireEvent.click(saveBtn!)
      await waitFor(() => expect(document.getElementsByClassName('bp3-portal')[1] as HTMLElement).toBeTruthy())
      const portalDiv = document.getElementsByClassName('bp3-portal')[1] as HTMLElement
      const overlayDialog = findDialogContainer() as HTMLElement
      expect(portalDiv).toMatchSnapshot()
      const savePipelinesToGitHeader = queryByText(portalDiv, 'common.git.saveResourceLabel')
      expect(savePipelinesToGitHeader).toBeInTheDocument()
      const inputSetId = await findByTestId(overlayDialog, '0-asd')
      expect(inputSetId).toBeInTheDocument()

      // Click on Save button in the Save to Git dialog to save
      const saveToGitSaveBtn = queryByText(portalDiv, 'save')?.parentElement as HTMLElement
      expect(saveToGitSaveBtn).toBeInTheDocument()
      userEvent.click(saveToGitSaveBtn!)
    })
  })
  describe('Create OverlayInputSet - ', () => {
    test('render create Overlay Input Set Form with GitSync with error', async () => {
      const { getByText } = render(
        <GitSyncTestWrapper
          path={TEST_INPUT_SET_FORM_PATH}
          pathParams={{
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            inputSetIdentifier: '-1',
            module: 'cd'
          }}
          queryParams={{
            repoIdentifier: 'identifier',
            branch: 'feature'
          }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <OverlayInputSetForm hideForm={jest.fn()} identifier="" />
        </GitSyncTestWrapper>
      )

      // Click on Save button in the form and check if Save to Git dialog opens properly
      const saveBtn = getByText('save').parentElement
      expect(saveBtn).toBeInTheDocument()
      fireEvent.click(saveBtn!)
      await waitFor(() => expect(document.getElementsByClassName('bp3-portal')[1] as HTMLElement).toBeTruthy())
      const portalDiv = document.getElementsByClassName('bp3-portal')[1] as HTMLElement
      const overlayDialog = findDialogContainer() as HTMLElement
      expect(portalDiv).toMatchSnapshot()
      const savePipelinesToGitHeader = queryByText(portalDiv, 'common.git.saveResourceLabel')
      expect(savePipelinesToGitHeader).toBeInTheDocument()
      const inputSetId = await findByTestId(overlayDialog, '0-asd')
      expect(inputSetId).toBeInTheDocument()

      // Click on Save button in the Save to Git dialog to save
      const saveToGitSaveBtn = queryByText(portalDiv, 'save')?.parentElement as HTMLElement
      expect(saveToGitSaveBtn).toBeInTheDocument()
      userEvent.click(saveToGitSaveBtn!)
    })

    test('entityValidity false', () => {
      const data = {
        status: 'SUCCESS',
        data: {
          accountId: 'kmpySmUISimoRrJL6NL73w',
          orgIdentifier: 'Harness11',
          projectIdentifier: 'Uhat_Project',
          entityValidityDetails: {
            valid: false
          },
          pipelineIdentifier: 'testqqq',
          identifier: 'OverLayInput',
          name: 'OverLayInput',
          description: 'OverLayInput',
          inputSetReferences: ['asd', 'test'],
          overlayInputSetYaml:
            'overlayInputSet:\n  name: OverLayInput\n  identifier: OverLayInput\n  description: OverLayInput\n  inputSetReferences:\n    - asd\n    - test\n',
          errorResponse: false,
          gitDetails: {
            branch: 'feature',
            filePath: 'asd.yaml',
            objectId: '4471ec3aa40c26377353974c29a6670d998db06g',
            repoIdentifier: 'gitSyncRepo',
            rootFolder: '/rootFolderTest/.harness/'
          }
        }
      }

      const { getByText } = render(
        <TestWrapper
          path={TEST_INPUT_SET_PATH}
          pathParams={{
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            module: 'cd'
          }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <OverlayInputSetForm hideForm={jest.fn()} />
        </TestWrapper>
      )
      jest.runOnlyPendingTimers()
      const container = findDialogContainer()
      expect(container).toMatchSnapshot()
      // Switch Mode
      fireEvent.click(getByText('YAML'))
      jest.spyOn(pipelineng, 'useGetOverlayInputSetForPipeline').mockImplementation((): any => {
        return { data: data, error: null, loading: false, refetch: jest.fn() }
      })
    })
  })
})
