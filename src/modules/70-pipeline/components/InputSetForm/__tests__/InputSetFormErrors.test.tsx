/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, inputSetFormPathProps } from '@common/utils/routeUtils'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { useUpdateInputSetForPipeline } from 'services/pipeline-ng'
import { StoreType } from '@common/constants/GitSyncTypes'
import { mockBranches } from '@pipeline/components/InputSetErrorHandling/__tests__/InputSetErrorHandlingMocks'
import { EnhancedInputSetForm } from '../InputSetForm'
import {
  TemplateResponse,
  PipelineResponse,
  ConnectorResponse,
  GetInputSetsResponse,
  GetInputSetEditInline,
  MergeInputSetResponse,
  GetOverlayInputSetEdit,
  MergedPipelineResponse,
  errorResponse,
  errorResponseWithoutErrorMap
} from './InputSetMocks'

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock(
  '@common/components/YAMLBuilder/YamlBuilder',
  () =>
    ({ children, bind }: { children: JSX.Element; bind: YamlBuilderProps['bind'] }) => {
      const handler = React.useMemo(
        () =>
          ({
            getLatestYaml: () => GetInputSetEditInline.data?.data?.inputSetYaml || '',
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

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
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

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),

  useMutateAsGet: jest.fn().mockImplementation(props => {
    if (props?.name === 'useGetYamlWithTemplateRefsResolved') {
      return MergedPipelineResponse
    } else {
      return TemplateResponse
    }
  })
}))

const useUpdateInputSetForPipelineMock = useUpdateInputSetForPipeline as jest.MockedFunction<any>

jest.mock('services/pipeline-ng', () => ({
  useGetInputSetForPipeline: jest.fn(() => GetInputSetEditInline),
  useCreateVariablesV2: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementation(() => {
        return {
          status: 'SUCCESS'
        }
      })
    }
  }),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => MergeInputSetResponse),
  useGetPipeline: jest.fn(() => PipelineResponse),
  useGetTemplateFromPipeline: jest.fn(() => TemplateResponse),
  useGetStagesExecutionList: jest.fn(() => ({})),
  useGetOverlayInputSetForPipeline: jest.fn(() => GetOverlayInputSetEdit),
  useCreateInputSetForPipeline: jest.fn().mockImplementation(() => ({ errorResponse })),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: errorResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: errorResponse })),
  useCreateOverlayInputSetForPipeline: jest.fn(() => ({})),
  useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsResponse),
  useGetYamlSchema: jest.fn(() => ({})),
  useSanitiseInputSet: jest.fn(() => PipelineResponse),
  useDeleteInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() }))
}))

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

const TEST_INPUT_SET_FORM_PATH = routes.toInputSetForm({
  ...accountPathProps,
  ...inputSetFormPathProps,
  ...pipelineModuleParams
})

describe('Input Set - error scenarios', () => {
  test('if API errors are displayed in yellow accordion', async () => {
    const { getAllByText, getByText, queryByText, container } = render(
      <TestWrapper
        path={TEST_INPUT_SET_FORM_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          inputSetIdentifier: 'asd',
          module: 'cd'
        }}
        queryParams={{
          storeType: StoreType.INLINE
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineContext.Provider
          value={
            {
              state: { pipeline: { name: '', identifier: '' } } as any,
              getStageFromPipeline: jest.fn((_stageId, pipeline) => ({ stage: pipeline.stages[0], parent: undefined }))
            } as any
          }
        >
          <EnhancedInputSetForm />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    await waitFor(() => getAllByText('tesa1'))
    fireEvent.click(getByText('save'))
    await waitFor(() => {
      expect(queryByText('common.errorCount')).toBeTruthy()
    })

    act(() => {
      fireEvent.mouseOver(getByText('common.seeDetails'))
    })
    expect(queryByText('field1: field1 error message (1)'))
    expect(queryByText('field2: field2 error message (3)'))
  })

  test('if API errors should not be displayed if uuidToErrorResponseMap is not present in response', async () => {
    useUpdateInputSetForPipelineMock.mockImplementation(() => {
      return {
        mutate: errorResponseWithoutErrorMap
      }
    })

    const { getAllByText, getByText, queryByText } = render(
      <TestWrapper
        path={TEST_INPUT_SET_FORM_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          inputSetIdentifier: 'asd',
          module: 'cd'
        }}
        queryParams={{
          storeType: StoreType.INLINE
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineContext.Provider
          value={
            {
              state: { pipeline: { name: '', identifier: '' } } as any,
              getStageFromPipeline: jest.fn((_stageId, pipeline) => ({ stage: pipeline.stages[0], parent: undefined }))
            } as any
          }
        >
          <EnhancedInputSetForm />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    await waitFor(() => getAllByText('tesa1'))
    fireEvent.click(getByText('save'))
    await waitFor(() => {
      expect(queryByText('common.errorCount')).toBeFalsy()
    })
  })
})
