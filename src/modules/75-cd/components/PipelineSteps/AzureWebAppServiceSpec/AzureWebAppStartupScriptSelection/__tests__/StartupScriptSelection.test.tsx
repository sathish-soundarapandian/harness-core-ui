/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findAllByText, findByText, fireEvent, render, waitFor } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import pipelineContextMock from '@pipeline/components/ManifestSelection/__tests__/pipeline_mock.json'
import * as cdngservices from 'services/cd-ng'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import StartupScriptSelection from '../StartupScriptSelection'
import { fetchConnectors, mockErrorHandler, props } from './StartupScriptTestUtils'

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: () => {
    return {
      data: connectorsData,
      refetch: jest.fn()
    }
  }
}))

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: mockErrorHandler
  })
}))

const testPath = routes.toAccountSettings({ accountId: ':accountId' })
const testPathParams = { accountId: 'accountId' }

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

describe('StartupScriptSelection', () => {
  test('initial render', async () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <PipelineContext.Provider value={getContextValue()}>
          <StartupScriptSelection {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const addFileButton = await findByText(container, 'common.plusAddName')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const label = await waitFor(() => findAllByText(portal as HTMLElement, 'pipeline.startupCommand.fileSource'))
    expect(label).toBeDefined()
    const closeButton = portal.querySelector("button[class*='crossIcon']") as Element
    fireEvent.click(closeButton)
    // portal closed
    expect(document.getElementsByClassName('bp3-dialog')[0]).toBeFalsy()
  })
  test('readonly mode', () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <PipelineContext.Provider value={getContextValue()}>
          <StartupScriptSelection
            deploymentType={props.deploymentType}
            isReadonlyServiceMode
            readonly
            isPropagating={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('empty state - no context values', () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <StartupScriptSelection
          deploymentType={props.deploymentType}
          isReadonlyServiceMode
          readonly
          isPropagating={false}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('error on connector fetch', async () => {
    jest.spyOn(cdngservices, 'useGetConnectorListV2').mockImplementation(
      () =>
        ({
          mutate: jest.fn().mockRejectedValue({})
        } as any)
    )
    render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <PipelineContext.Provider value={getContextValue()}>
          <StartupScriptSelection {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    await waitFor(() => expect(mockErrorHandler).toHaveBeenCalled())
  })
})
