/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import type { IconName } from '@blueprintjs/core'
import { TestWrapper } from '@common/utils/testUtils'
import type { UseGetReturnData } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { ResponseConnectorResponse, ResponseSetupStatus } from 'services/cd-ng'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import ExecutionGraph from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import BuildStageSetupShell from '../BuildStageSetupShell'
import pipelineContextMock from './pipelineContext.json'

jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} name={name || 'spec.source.spec.script'} />
))
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph')
jest.mock('@pipeline/components/ErrorsStrip/ErrorsStripBinded', () => () => <></>)

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

class StepOne extends Step<any> {
  protected type = StepType.CustomVariable
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): any {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<any>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}
const stepFactory = new StepFactory()
stepFactory.registerStep(new StepOne())

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    stepsFactory: stepFactory,
    getStagePathFromPipeline: jest.fn(),
    getStageFromPipeline: jest.fn(() => ({ stage: pipelineContextMock.state.pipeline.stages[0] })),
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn(),
    setSelectedSectionId: jest.fn()
  } as any
}
export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'tesa 1',
        identifier: 'tesa_1',
        description: '',
        orgIdentifier: 'Harness11',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

const secretMockdata = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 28,
    pageItemCount: 28,
    pageSize: 100,
    content: [
      {
        secret: {
          type: 'SecretText',
          name: 'testpass',
          identifier: 'testpass',
          tags: {},
          description: '',
          spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
        },
        createdAt: 1606900988388,
        updatedAt: 1606900988388,
        draft: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '7f453609-2037-4539-8571-cd3f270e00e9'
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListV2Promise: () =>
    Promise.resolve({
      data: {
        content: [
          {
            connector: ConnectorResponse.data!.data!.connector
          }
        ]
      }
    }),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(secretMockdata)),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useProvisionResourcesForCI: jest.fn().mockImplementation(() => {
    return {
      mutate: () =>
        Promise.resolve({
          data: 'SUCCESS',
          status: 'SUCCESS'
        } as ResponseSetupStatus)
    }
  })
}))

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateGroupsNGV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      data: {
        resource: {
          delegateGroupDetails: [{ delegateGroupIdentifier: '_harness_kubernetes_delegate', activelyConnected: false }]
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  }),
  useGetDelegateSelectorsUpTheHierarchyV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

describe('BuildStageSetupShell snapshot test', () => {
  test('initializes ok', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider value={getContextValue()}>
          <BuildStageSetupShell />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('advances through tabs and finalizes saving when click "Done"', async () => {
    const contextMock = getContextValue()
    const { container, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider value={contextMock}>
          <StageErrorContext.Provider
            value={{
              state: {} as any,
              checkErrorsForTab: () => Promise.resolve(),
              subscribeForm: () => undefined,
              unSubscribeForm: () => undefined,
              submitFormsForTab: () => undefined
            }}
          >
            <BuildStageSetupShell />
          </StageErrorContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const continueBtn = getByText('continue')
    expect(container.querySelector('[id="bp3-tab-title_stageSetupShell_OVERVIEW"]')).toBeInTheDocument()
    expect(continueBtn).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(continueBtn)
    })
    await act(async () => {
      fireEvent.click(continueBtn)
    })
    const advancedTab = getByText('ci.advancedLabel')
    expect(advancedTab).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(advancedTab!)
    })
    await act(async () => {
      fireEvent.click(getByText('Done')!)
    })
    expect(container.querySelector('[aria-selected="true"]')?.getAttribute('data-tab-id')).toBe('ADVANCED')
  })

  test('ExecutionGraph step handlers update pipeline view', async () => {
    ;(ExecutionGraph as any).render.mockImplementationOnce(({ onAddStep, onEditStep }: any) => (
      <div>
        <div data-testid="execution-graph-mock-add" onClick={() => onAddStep({})} />
        <div data-testid="execution-graph-mock-edit" onClick={() => onEditStep({})} />
      </div>
    ))
    const contextMock = getContextValue()
    const { findByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider value={contextMock}>
          <StageErrorContext.Provider
            value={{
              state: {} as any,
              checkErrorsForTab: () => Promise.resolve(),
              subscribeForm: () => undefined,
              unSubscribeForm: () => undefined,
              submitFormsForTab: () => undefined
            }}
          >
            <BuildStageSetupShell />
          </StageErrorContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )
    fireEvent.click(await findByTestId('ci.executionLabel'))
    fireEvent.click(await findByTestId('execution-graph-mock-add'))
    expect(contextMock.updatePipelineView).toHaveBeenCalledTimes(1)
    fireEvent.click(await findByTestId('execution-graph-mock-edit'))
    expect(contextMock.updatePipelineView).toHaveBeenCalledTimes(2)
  })

  test('Should invoke updateStage on step group add', async () => {
    ;(ExecutionGraph as any).render.mockImplementationOnce(({ onAddStep, onEditStep, updateStage }: any) => (
      <div>
        <div data-testid="execution-graph-mock-add" onClick={() => onAddStep({})} />
        <div data-testid="execution-graph-mock-step-group-add" onClick={() => updateStage({})} />
        <div data-testid="execution-graph-mock-edit" onClick={() => onEditStep({})} />
      </div>
    ))
    const contextMock = getContextValue()
    const { container, getByText, findByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider value={contextMock}>
          <StageErrorContext.Provider
            value={{
              state: {} as any,
              checkErrorsForTab: () => Promise.resolve(),
              subscribeForm: () => undefined,
              unSubscribeForm: () => undefined,
              submitFormsForTab: () => undefined
            }}
          >
            <BuildStageSetupShell />
          </StageErrorContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const continueBtn = getByText('continue')
    expect(container.querySelector('[id="bp3-tab-title_stageSetupShell_OVERVIEW"]')).toBeInTheDocument()
    expect(continueBtn).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(continueBtn)
    })
    await act(async () => {
      fireEvent.click(getByText('ci.executionLabel'))
    })
    const addStepButton = await findByTestId('execution-graph-mock-step-group-add')
    fireEvent.click(addStepButton)
    expect(container.querySelector('[aria-selected="true"]')?.getAttribute('data-tab-id')).toBe('EXECUTION')
  })
})
