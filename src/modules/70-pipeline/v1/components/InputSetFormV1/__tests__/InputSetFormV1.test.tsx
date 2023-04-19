/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, findByRole } from '@testing-library/react'
import { noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import { useGetPipelineInputsQuery } from '@harnessio/react-pipeline-service-client'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import * as usePermission from '@rbac/hooks/usePermission'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  pipelineModuleParams,
  inputSetFormPathProps,
  pipelinePathProps
} from '@common/utils/routeUtils'
import * as pipelineng from 'services/pipeline-ng'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { InputSetDTO } from '@pipeline/utils/types'
import type { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { StoreType } from '@common/constants/GitSyncTypes'
import InputSetFormV1 from '../InputSetFormV1'
import { PipelineResponse, ConnectorResponse, GetInputSetsResponse, GetInputSetEdit } from './InputSetV1Mocks'
import FormikInputSetFormV1 from '../FormikInputSetFormV1'

const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS' })

jest.useFakeTimers()
const branches = { data: ['master', 'devBranch', 'feature'], status: 'SUCCESS' }

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))
const fetchBranches = jest.fn(() => Promise.resolve(branches))

jest.mock('@harnessio/react-pipeline-service-client', () => ({
  useGetPipelineInputsQuery: jest.fn(() => ({}))
}))

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
  ...(jest.requireActual('@common/hooks') as any)
}))

jest.mock('services/pipeline-ng', () => ({
  useGetInputSetForPipeline: jest.fn(() => GetInputSetEdit),
  useCreateVariablesV2: () => jest.fn(() => ({})),
  useGetPipeline: jest.fn(() => PipelineResponse),
  useSanitiseInputSet: jest.fn(() => PipelineResponse),
  useDeleteInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useGetStagesExecutionList: jest.fn(() => ({})),
  useCreateInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useCreateOverlayInputSetForPipeline: jest.fn(() => ({})),
  useGetInputSetsListForPipeline: jest.fn(() => GetInputSetsResponse)
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

const TEST_INPUT_SET_FORM_PATH = routes.toInputSetFormV1({
  ...accountPathProps,
  ...inputSetFormPathProps,
  ...pipelineModuleParams
})

const renderSetup = (form = <InputSetFormV1 />) =>
  render(
    <TestWrapper
      path={TEST_INPUT_SET_FORM_PATH}
      pathParams={{
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'pipeline',
        inputSetIdentifier: '-1',
        module: 'cd'
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
        {form}
      </PipelineContext.Provider>
    </TestWrapper>
  )

const renderRemoteSetup = (form = <InputSetFormV1 />) =>
  render(
    <TestWrapper
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
        {form}
      </PipelineContext.Provider>
    </TestWrapper>
  )

describe('Input Sets V1', () => {
  test('render Input Set Form view', async () => {
    const { getByText, container } = renderRemoteSetup()
    jest.runOnlyPendingTimers()
    fireEvent.click(getByText('cancel'))
    expect(container).toMatchSnapshot()
  })

  test('when executionView is true', async () => {
    const { getByText } = render(
      <TestWrapper
        path={TEST_INPUT_SET_FORM_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          inputSetIdentifier: '-1',
          module: 'cd'
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
          <InputSetFormV1 isExecutionView={true} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()
    expect(getByText('save')).toBeInTheDocument()
    expect(getByText('cancel')).toBeInTheDocument()
    fireEvent.click(getByText('cancel'))
  })

  test('render Edit Input Set Form view', async () => {
    const { getByText, container } = render(
      <TestWrapper
        path={TEST_INPUT_SET_FORM_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'pipeline',
          inputSetIdentifier: 'asd',
          module: 'ci'
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
          <InputSetFormV1 />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    jest.runOnlyPendingTimers()
    expect(container).toMatchSnapshot('expanded')
    fireEvent.click(getByText('save'))
    const saveBtn = await findByRole(container, 'button', { name: 'save' })
    fireEvent.click(saveBtn)
    expect(container).toMatchSnapshot()
  })

  test('FormikInputSetFormV1', async () => {
    jest.spyOn(usePermission, 'usePermission').mockReturnValue([true])
    const ref = React.createRef<FormikProps<InputSetDTO & GitContextProps> | undefined>()
    const handleSubmit = jest.fn()
    const mockCodebaseInputs = {
      inputs: {
        image: {
          prompt: false,
          required: true,
          default: 'golang',
          type: 'string',
          desc: 'image name'
        },
        repo: {
          prompt: true,
          required: true,
          type: 'string',
          desc: 'repository name'
        }
      },
      repository: {
        reference: {
          type: {
            prompt: false,
            required: true,
            type: 'string',
            enums: ['branch', 'tag', 'pr']
          },
          value: {
            prompt: false,
            required: true,
            type: 'string'
          }
        }
      }
    }
    const inputSetYaml = {
      inputs: {
        image: '',
        repo: ''
      },
      repository: {
        reference: {
          type: 'branch',
          value: ''
        }
      }
    }
    ;(useGetPipelineInputsQuery as jest.Mock).mockImplementation().mockReturnValue(mockCodebaseInputs)
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
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FormikInputSetFormV1
          inputSet={{
            description: 'asd',
            entityValidityDetails: {
              valid: false
            },
            identifier: 'asd56',
            orgIdentifier: 'Harness11',
            pipelineIdentifier: 'testqqq',
            pipeline: { identifier: 'testqqq', name: '' },
            data: inputSetYaml,
            version: 1
          }}
          handleSubmit={handleSubmit}
          isEdit={true}
          formErrors={{ name: 'required' }}
          formikRef={ref as any}
          hasRuntimeInputs={false}
          hasCodebaseInputs={true}
          pipelineInputs={mockCodebaseInputs}
          inputSetYaml={inputSetYaml}
        />
      </TestWrapper>
    )
    act(() => {
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'asd56' } })
    })
    await act(() => ref.current?.submitForm()!)
    expect(handleSubmit).toHaveBeenCalledWith(
      {
        branch: '',
        description: 'asd',
        identifier: 'asd56',
        name: 'asd56',
        orgIdentifier: 'Harness11',
        pipelineIdentifier: 'testqqq',
        repo: '',
        connectorRef: '',
        repoName: '',
        storeType: 'INLINE',
        filePath: undefined,
        version: 1,
        pipeline: { identifier: 'testqqq', name: '' },
        data: {
          inputs: {
            image: '',
            repo: ''
          },
          repository: {
            reference: {
              type: 'branch',
              value: ''
            }
          }
        }
      },
      { branch: '', repoIdentifier: '', repoName: '' },
      { branch: '', connectorRef: '', filePath: undefined, repoName: '', storeType: 'INLINE' }
    )
  })

  test('render inputset with no inputSetResponse ', async () => {
    jest.spyOn(pipelineng, 'useGetInputSetForPipeline').mockImplementation((): any => {
      return { data: {}, error: null, loading: false }
    })
    jest.spyOn(pipelineng, 'useGetPipeline').mockImplementation((): any => {
      return {
        data: {
          status: 'SUCCESS',
          data: {
            ...PipelineResponse
          }
        },
        loading: false,
        refetch: jest.fn()
      }
    })
    const { container, getByText } = renderSetup()

    // click save
    act(() => {
      fireEvent.click(getByText('save'))
    })
    expect(container).toMatchSnapshot()
  })
})
