/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, createEvent, act, findByRole } from '@testing-library/react'
import { noop } from 'lodash-es'

import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import gitSyncListResponse from '@common/utils/__tests__/mocks/gitSyncRepoListMock.json'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import * as pipelineng from 'services/pipeline-ng'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { branchStatusMock } from '@connectors/mocks/mock'
import { OverlayInputSetForm } from '@pipeline/components/OverlayInputSetForm/OverlayInputSetForm'
import {
  GetInputSetYamlDiffInline,
  mockBranches
} from '@pipeline/components/InputSetErrorHandling/__tests__/InputSetErrorHandlingMocks'
import { StoreType } from '@common/constants/GitSyncTypes'
import {
  TemplateResponse,
  PipelineResponse,
  ConnectorResponse,
  GetInputSetsResponse,
  GetInputSetEdit,
  MergeInputSetResponse,
  GetOverlayInputSetEdit,
  MergedPipelineResponse,
  sourceCodeManage,
  errorResponse
} from '../../InputSetForm/__tests__/InputSetMocks'

const eventData = { dataTransfer: { setData: jest.fn(), dropEffect: '', getData: () => '1' } }

const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS' })
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock(
  '@common/components/YAMLBuilder/YamlBuilder',
  () =>
    ({ children, bind }: { children: JSX.Element; bind: YamlBuilderProps['bind'] }) => {
      const handler = React.useMemo(
        () =>
          ({
            getLatestYaml: () => GetOverlayInputSetEdit.data?.data?.overlayInputSetYaml || '',
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
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitSyncListResponse, refetch: getListGitSync }
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
  useGetOverlayInputSetForPipeline: jest.fn(() => GetOverlayInputSetEdit),
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

describe('OverlayInputSetForm Tests', () => {
  describe('Edit OverlayInputSet - ', () => {
    test('render Overlay Input Set Form view', async () => {
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
          queryParams={{
            repoName: 'gitSyncRepo',
            branch: 'feature',
            connectorRef: 'ValidGithubRepo',
            storeType: StoreType.REMOTE
          }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <OverlayInputSetForm hideForm={jest.fn()} />
        </TestWrapper>
      )
      jest.runOnlyPendingTimers()
      const container = findDialogContainer()

      await waitFor(() => getByText('pipeline.inputSets.selectPlaceholder'))
      // Add two
      act(() => {
        fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
        fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
      })
      // Remove the last
      const remove = container?.querySelectorAll('[data-icon="cross"]')[1]
      fireEvent.click(remove!)
      expect(container).toMatchSnapshot()
    })

    test('render Edit Overlay Input Set Form view', async () => {
      const { getAllByText, getByText } = render(
        <TestWrapper
          path={TEST_INPUT_SET_PATH}
          pathParams={{
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            module: 'cd'
          }}
          queryParams={{
            repoName: 'gitSyncRepo',
            branch: 'feature',
            connectorRef: 'ValidGithubRepo',
            storeType: StoreType.REMOTE
          }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <OverlayInputSetForm hideForm={jest.fn()} identifier="OverLayInput" />
        </TestWrapper>
      )
      jest.runOnlyPendingTimers()
      const container = findDialogContainer()
      await waitFor(() => getByText('test'))
      expect(container).toMatchSnapshot()
      fireEvent.click(getByText('save'))
      // Switch Mode
      fireEvent.click(getByText('YAML'))
      await waitFor(() => getAllByText('Yaml View'))

      // back to Visual View
      fireEvent.click(getByText('VISUAL'))

      // click save
      act(async () => {
        const saveBtn = await findByRole(container!, 'button', { name: 'save' })
        fireEvent.click(saveBtn)
      })
    })

    test('render Edit Overlay Input Set Form and test drag drop', async () => {
      const { getByTestId, getByText } = render(
        <TestWrapper
          path={TEST_INPUT_SET_PATH}
          pathParams={{
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            module: 'cd'
          }}
          queryParams={{
            repoName: 'gitSyncRepo',
            branch: 'feature',
            connectorRef: 'ValidGithubRepo',
            storeType: StoreType.REMOTE
          }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <OverlayInputSetForm hideForm={jest.fn()} identifier="OverLayInput" />
        </TestWrapper>
      )
      jest.runOnlyPendingTimers()
      await waitFor(() => getByText('asd'))

      act(() => {
        fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
      })

      const container = getByTestId('asd')
      const container2 = getByTestId('test')
      act(() => {
        const dragStartEvent = Object.assign(createEvent.dragStart(container), eventData)

        fireEvent(container, dragStartEvent)
        expect(container).toMatchSnapshot()

        fireEvent.dragEnd(container)
        expect(container).toMatchSnapshot()

        fireEvent.dragLeave(container)

        const dropEffectEvent = Object.assign(createEvent.dragOver(container), eventData)
        fireEvent(container2, dropEffectEvent)

        const dropEvent = Object.assign(createEvent.drop(container), eventData)
        fireEvent(container2, dropEvent)
      })
    })
  })
  describe('Create OverlayInputSet - ', () => {
    test('render create Overlay Input Set Yaml view save with error', async () => {
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
          queryParams={{
            repoName: 'gitSyncRepo',
            branch: 'feature',
            connectorRef: 'ValidGithubRepo',
            storeType: StoreType.REMOTE
          }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <OverlayInputSetForm hideForm={jest.fn()} identifier="" />
        </TestWrapper>
      )
      jest.runOnlyPendingTimers()
      const container = findDialogContainer()
      expect(container).toMatchSnapshot()
      // Switch Mode
      fireEvent.click(getByText('YAML'))

      // click save
      act(() => {
        fireEvent.click(getByText('save'))
      })
    })

    test('no data', () => {
      jest.spyOn(pipelineng, 'useGetInputSetsListForPipeline').mockImplementation((): any => {
        return { data: {}, error: null, loading: false, refetch: jest.fn() }
      })
      const { container } = render(
        <TestWrapper
          path={TEST_INPUT_SET_PATH}
          pathParams={{
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            module: 'cd'
          }}
          queryParams={{
            repoName: 'gitSyncRepo',
            branch: 'feature',
            connectorRef: 'ValidGithubRepo',
            storeType: StoreType.REMOTE
          }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <OverlayInputSetForm hideForm={jest.fn()} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
  test('render with no data and anyAPIloading and api call failed', async () => {
    jest.spyOn(pipelineng, 'useGetOverlayInputSetForPipeline').mockImplementation((): any => {
      return {
        data: {},
        error: {
          message: 'api call failed'
        },
        loading: true,
        refetch: jest.fn()
      }
    })
    jest.spyOn(pipelineng, 'useGetSchemaYaml').mockImplementation((): any => {
      return { data: {}, loading: true }
    })
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
        queryParams={{
          repoName: 'gitSyncRepo',
          branch: 'feature',
          connectorRef: 'ValidGithubRepo',
          storeType: StoreType.REMOTE
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <OverlayInputSetForm hideForm={jest.fn()} identifier="OverLayInput" />
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()
    const container = findDialogContainer()
    expect(getByText('Loading, please wait...')).toBeDefined()
    fireEvent.click(getByText('YAML'))
    act(() => {
      fireEvent.click(getByText('cancel'))
    })

    const crossIcon = container?.querySelector('[data-icon="small-cross"]')
    fireEvent.click(crossIcon!)
  })
})
