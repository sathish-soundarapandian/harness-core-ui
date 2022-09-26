/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByTestId, fireEvent, waitFor, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MultiTypeSkipInstances from '../MultiTypeSkipInstances'

import { PipelineContext, PipelineContextInterface } from '../../PipelineContext/PipelineContext'
import { getDummyPipelineContextValue, runtimeFnArg } from './mock'

describe('SkipInstances test', () => {
  let component: HTMLElement
  let pipelineContextMockValue: PipelineContextInterface

  test('Define runtime field', async () => {
    pipelineContextMockValue = getDummyPipelineContextValue()
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectId/pipelines/:pipelineIdentifier/pipeline-studio"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          projectId: 'testProject',
          pipelineIdentifier: 'test'
        }}
        queryParams={{
          stageId: 'testStage',
          sectionId: 'ADVANCED'
        }}
      >
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <MultiTypeSkipInstances value="<+input>" />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    component = container
    const formEl = component.querySelector('[name=skipInstances]') as Element
    expect(formEl).toBeInTheDocument()
    expect(formEl).toHaveValue('')
    expect(formEl).toBeDisabled()
    expect(component.querySelector('checkbox')).not.toBeInTheDocument()
  })
  test('Switch to chexkbox field', async () => {
    pipelineContextMockValue = getDummyPipelineContextValue()
    const { container, findByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectId/pipelines/:pipelineIdentifier/pipeline-studio"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          projectId: 'testProject',
          pipelineIdentifier: 'test'
        }}
        queryParams={{
          stageId: 'testStage',
          sectionId: 'ADVANCED'
        }}
      >
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <MultiTypeSkipInstances value={true} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    component = container
    const multiBtn = await findByTestId(component, 'skip-multi-btn')
    expect(multiBtn).toBeInTheDocument()
    const checkbox = await findByTestId(component, 'skip-instances-check')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toBeChecked()
    fireEvent.click(checkbox)
    expect(pipelineContextMockValue.updateStage).toHaveBeenCalled()
    expect(pipelineContextMockValue.updateStage).toHaveBeenCalledWith(runtimeFnArg)

    fireEvent.click(multiBtn)
    const button = await waitFor(() => findByText('Fixed value'))
    act(() => {
      fireEvent.click(button)
    })
    const formEl = component.querySelector('[name=skipInstances]') as Element
    expect(formEl).toBeInTheDocument()
    act(() => {
      fireEvent.click(multiBtn)
    })
    expect(await waitFor(() => findByText('Runtime input'))).toBeInTheDocument()
  })
  test('No Multi button', async () => {
    pipelineContextMockValue = getDummyPipelineContextValue()
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectId/pipelines/:pipelineIdentifier/pipeline-studio"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          projectId: 'testProject',
          pipelineIdentifier: 'test'
        }}
        queryParams={{
          stageId: 'testStage',
          sectionId: 'ADVANCED'
        }}
      >
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <MultiTypeSkipInstances value={true} disableTypeSelection={true} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    component = container
    const multiButton = container.querySelector('button')
    expect(multiButton).toBeNull()
  })
})
