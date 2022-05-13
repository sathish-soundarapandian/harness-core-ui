/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { UseGetReturn } from 'restful-react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as services from 'services/pipeline-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { ApprovalStageSetupShellMode } from '../ApprovalStageSetupShellMode'
import { ApprovalStage } from '../ApprovalStage'
import {
  approvalStageTemplateMock,
  getDummyPipelineContextValue,
  getDummyPipelineContextValueJiraApproval,
  getPropsForMinimalStage,
  getPropsForMinimalStageWithTemplateCopied,
  getPropsForMinimalStageWithTemplateUsed,
  mockYamlSnippetResponse,
  mockYamlSnippetResponseJira
} from './ApprovalStageTestsHelper'

jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))
jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

describe('Approval Stage minimal view', () => {
  test('Basic render, selection and setup stage', async () => {
    const props = getPropsForMinimalStage()
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <ApprovalStage
            minimal={true}
            stageProps={props.stageProps as any}
            name={''}
            type={''}
            icon={'nav-harness'}
            isDisabled={false}
            isApproval={true}
            title="My approval stage"
            description={''}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })
    await waitFor(() => queryByText('approvalStage.stageNameRequired'))
    await waitFor(() => queryByText('pipeline.approvalTypeRequired'))

    const nameInput = container.querySelector('.bp3-input')
    act(() => {
      fireEvent.change(nameInput!, { target: { value: 'stagename' } })
    })
    expect(props.stageProps?.onChange).toBeCalledTimes(3)
    act(() => {
      fireEvent.click(getByText('Harness Approval'))
    })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })
    await waitFor(() =>
      expect(props.stageProps?.onSubmit).toBeCalledWith(
        {
          stage: {
            name: 'stagename',
            identifier: 'stagename',
            description: undefined,
            approvalType: 'HarnessApproval',
            tags: {}
          }
        },
        'stagename'
      )
    )
  })
})

describe('Jira Approval Stage minimal view', () => {
  test('Basic render, selection and setup stage', async () => {
    const props = getPropsForMinimalStage()
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <ApprovalStage
            minimal={true}
            stageProps={props.stageProps as any}
            name={''}
            type={''}
            icon={'service-jira'}
            isDisabled={false}
            isApproval={true}
            title="My approval stage"
            description={''}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })
    await waitFor(() => queryByText('approvalStage.stageNameRequired'))
    await waitFor(() => queryByText('pipeline.approvalTypeRequired'))

    const nameInput = container.querySelector('.bp3-input')
    act(() => {
      fireEvent.change(nameInput!, { target: { value: 'stagename' } })
    })

    expect(props.stageProps?.onChange).toBeCalledTimes(3)
    act(() => {
      fireEvent.click(getByText('Jira'))
    })
    expect(props.stageProps?.onChange).toBeCalledWith({
      name: 'stagename',
      identifier: 'stagename',
      description: undefined,
      approvalType: 'JiraApproval',
      tags: {}
    })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })
    await waitFor(() =>
      expect(props.stageProps?.onSubmit).toBeCalledWith(
        {
          stage: {
            name: 'stagename',
            identifier: 'stagename',
            description: undefined,
            approvalType: 'JiraApproval',
            tags: {}
          }
        },
        'stagename'
      )
    )
  })
})

describe('Approval Stage minimal view when a template is used', () => {
  test('Basic render and setup stage', async () => {
    const props = getPropsForMinimalStageWithTemplateUsed()
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <ApprovalStage
            minimal={true}
            stageProps={props as any}
            name={''}
            type={''}
            icon={'nav-harness'}
            isDisabled={false}
            isApproval={true}
            title="My approval stage"
            description={''}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toHaveTextContent('Using Template: Approval Stage Test (v1)')
    const nameInput = container.querySelector('input[name="name"]') as HTMLElement
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'stagename' } })
    })
    act(() => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })
    await waitFor(() => {
      expect(props.onSubmit).toBeCalledWith(
        {
          stage: {
            name: 'stagename',
            identifier: 'stagename',
            template: {
              templateRef: 'Approval_Stage_Test',
              versionLabel: 'v1'
            }
          }
        },
        'stagename'
      )
    })
  })
})

describe('Approval Stage minimal view when a template is copied', () => {
  test('Basic render and setup stage', async () => {
    const props = getPropsForMinimalStageWithTemplateCopied()
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <ApprovalStage
            minimal={true}
            stageProps={props as any}
            name={''}
            type={''}
            icon={'nav-harness'}
            isDisabled={false}
            isApproval={true}
            title="My approval stage"
            description={''}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const nameInput = container.querySelector('input[name="name"]') as HTMLElement
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'stagename' } })
    })
    fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    await waitFor(() =>
      expect(props.onSubmit).toBeCalledWith(
        {
          stage: {
            name: 'stagename',
            identifier: 'stagename',
            description: undefined,
            tags: {},
            ...approvalStageTemplateMock.spec
          }
        },
        'stagename'
      )
    )
  })
})

describe('Approval Stage shell view', () => {
  beforeEach(() => {
    jest
      .spyOn(services, 'useGetInitialStageYamlSnippet')
      .mockReturnValue(mockYamlSnippetResponse as UseGetReturn<any, services.Failure, any, unknown>)
  })
  test('Setup shell view tests', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { getByDisplayValue, getByText, getAllByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <ApprovalStageSetupShellMode />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('overview'))
    })
    act(() => {
      fireEvent.change(getByDisplayValue('ApprovalStep'), { target: { value: 'changedstagename' } })
    })

    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Move to next tab
    act(() => {
      fireEvent.click(getByText('next'))
    })
    await waitFor(() => expect(pipelineContextMockValue.updatePipeline).toBeCalled())

    // Switch back to first tab
    act(() => {
      fireEvent.click(getByText('overview'))
    })

    await waitFor(() => expect(pipelineContextMockValue.updatePipeline).toBeCalled())
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Click on execution tab and check the shallow render of graph
    act(() => {
      fireEvent.click(getByText('executionText'))
    })

    // Click on execution tab and check the shallow render of graph
    act(() => {
      fireEvent.click(getAllByText('advancedTitle')[0])
    })

    // Click on the checkbox that enables us to enter when condition
    act(() => {
      fireEvent.click(getByText('pipeline.conditionalExecution.condition'))
    })
    // Call the update methods if the when condition changes
    await waitFor(() => expect(pipelineContextMockValue.getStageFromPipeline).toBeCalled())
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Click on add button for failure strategy
    act(() => {
      fireEvent.click(getByText('add'))
    })
    // Call the update methods
    await waitFor(() => expect(pipelineContextMockValue.getStageFromPipeline).toBeCalled())
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())
  })
})

describe('Jira Approval Stage shell view', () => {
  beforeEach(() => {
    jest
      .spyOn(services, 'useGetInitialStageYamlSnippet')
      .mockReturnValue(mockYamlSnippetResponseJira as UseGetReturn<any, services.Failure, any, unknown>)
  })
  test('Setup shell view tests', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValueJiraApproval()
    const { getByDisplayValue, getByText, getAllByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <ApprovalStageSetupShellMode />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('overview'))
    })
    act(() => {
      fireEvent.change(getByDisplayValue('ApprovalStep'), { target: { value: 'changedstagename' } })
    })

    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Move to next tab
    act(() => {
      fireEvent.click(getByText('next'))
    })
    await waitFor(() => expect(pipelineContextMockValue.updatePipeline).toBeCalled())

    // Switch back to first tab
    act(() => {
      fireEvent.click(getByText('overview'))
    })
    await waitFor(() => expect(pipelineContextMockValue.updatePipeline).toBeCalled())
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Click on execution tab and check the shallow render of graph
    act(() => {
      fireEvent.click(getAllByText('advancedTitle')[0])
    })

    // Click on the checkbox that enables us to enter when condition
    act(() => {
      fireEvent.click(getByText('pipeline.conditionalExecution.condition'))
    })
    // Call the update methods if the when condition changes
    await waitFor(() => expect(pipelineContextMockValue.getStageFromPipeline).toBeCalled())
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())

    // Click on add button for failure strategy
    act(() => {
      fireEvent.click(getByText('add'))
    })
    // Call the update methods
    await waitFor(() => expect(pipelineContextMockValue.getStageFromPipeline).toBeCalled())
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toBeCalled())
  })
})

describe('Approval Stage readonly view', () => {
  beforeEach(() => {
    jest
      .spyOn(services, 'useGetInitialStageYamlSnippet')
      .mockReturnValue(mockYamlSnippetResponse as UseGetReturn<any, services.Failure, any, unknown>)
  })

  test('if readonly view works', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={{ ...pipelineContextMockValue, isReadonly: true }}>
          <ApprovalStageSetupShellMode />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('overview'))
    })

    expect(container).toMatchSnapshot('readonly view apprvoal step overview')
  })
})
