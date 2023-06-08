/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { noop } from 'lodash-es'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { accountPathProps, pipelineModuleParams, inputSetFormPathProps } from '@common/utils/routeUtils'
import * as pipelineng from 'services/pipeline-ng'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StoreType } from '@common/constants/GitSyncTypes'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { GetInputSetYamlDiffInline } from '@pipeline/components/InputSetErrorHandling/__tests__/InputSetErrorHandlingMocks'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'

import { EnhancedInputSetForm } from '../InputSetForm'
import {
  TemplateResponse,
  PipelineResponse,
  ConnectorResponse,
  GetInputSetsResponse,
  GetInputSetEdit,
  MergeInputSetResponse,
  GetOverlayInputSetEdit,
  MergedPipelineResponse
} from './InputSetMocks'

const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS' })
function YamlMock({ children, bind }: { children: JSX.Element; bind: YamlBuilderProps['bind'] }): React.ReactElement {
  const handler = React.useMemo(
    () =>
      ({
        getLatestYaml: () => GetInputSetEdit.data?.data?.inputSetYaml || '',
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

const TEST_INPUT_SET_FORM_PATH = routes.toInputSetForm({
  ...accountPathProps,
  ...inputSetFormPathProps,
  ...pipelineModuleParams
})

YamlMock.YamlBuilderMemo = YamlMock

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => YamlMock)

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor')

jest.useFakeTimers()
const branches = { data: ['master', 'devBranch', 'feature'], status: 'SUCCESS' }

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))
const fetchBranches = jest.fn(() => Promise.resolve(branches))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  useCreatePR: jest.fn(() => noop),
  useCreatePRV2: jest.fn(() => noop),
  useGetFileContent: jest.fn(() => noop),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: branches, refetch: fetchBranches, error: null, loading: false }
  }),
  useGetSettingValue: jest.fn().mockImplementation(() => {
    return { data: { allowDifferentRepoSettings: { data: { value: 'false' } }, loading: false } }
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
  useGetInputSetForPipeline: jest.fn(() => GetInputSetEdit),
  useCreateVariablesV2: () => jest.fn(() => ({})),
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
  useCreateOverlayInputSetForPipeline: jest.fn(() => ({})),
  useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsResponse),
  useGetSchemaYaml: jest.fn(() => ({})),
  useYamlDiffForInputSet: jest.fn(() => GetInputSetYamlDiffInline)
}))
const mockCallBack = jest.fn()
jest.mock('@common/hooks/useDiffDialog', () => {
  return jest.fn(() => ({
    open: mockCallBack
  }))
})

describe('Render Forms - Snapshot Testing', () => {
  test('when clicked on view diff button, should show the difference in yaml', async () => {
    jest.spyOn(pipelineng, 'useGetInputSetForPipeline').mockImplementation((): any => {
      return { data: {}, error: null, loading: false, refetch: jest.fn() }
    })

    const { getByText, container } = render(
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
          repoName: 'gitSyncRepo',
          branch: 'feature',
          connectorRef: 'ValidGithubRepo',
          storeType: StoreType.REMOTE
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineContext.Provider
          value={
            {
              state: { pipeline: { name: '', identifier: '' } } as any,
              getStageFromPipeline: jest.fn((_stageId, pipeline) => ({
                stage: pipeline.stages[0],
                parent: undefined
              }))
            } as any
          }
        >
          <EnhancedInputSetForm />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()
    fireEvent.click(getByText('pipeline.viewDiff'))
    expect(mockCallBack).toBeCalled()
    expect(container).toMatchSnapshot()
  })
})
