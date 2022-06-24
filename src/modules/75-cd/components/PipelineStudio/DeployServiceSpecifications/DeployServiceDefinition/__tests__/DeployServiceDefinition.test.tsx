/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { ServiceContext, ServiceContextValues } from '@cd/context/ServiceContext'
import DeployServiceDefinition from '../DeployServiceDefinition'

import {
  mockStageReturnWithManifest,
  mockStageReturnWithoutManifestData,
  specObjectWithData,
  pipelineMock,
  serviceContextData
} from './deployServiceDefinitionHelper'

const getContextValue = (mockData: any): PipelineContextInterface => {
  return {
    ...pipelineMock,
    getStageFromPipeline: jest.fn(() => mockData),
    updateStage: jest.fn(() => {
      undefined
    }),
    updatePipeline: jest.fn(() => undefined)
  } as any
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const renderFunction = (pipelineContextValue: PipelineContextInterface) => {
  return render(
    <TestWrapper
      path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services/:serviceIdentifier?tab=configuration"
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        serviceIdentifier: 'dummy'
      }}
    >
      <ServiceContext.Provider value={serviceContextData as ServiceContextValues}>
        <PipelineContext.Provider value={pipelineContextValue}>
          <DeployServiceDefinition />
        </PipelineContext.Provider>
      </ServiceContext.Provider>
    </TestWrapper>
  )
}

const pipelineMockData = getContextValue(mockStageReturnWithoutManifestData)

describe('DeployServiceDefinition', () => {
  test('should render DeployServiceDefinition and switch between deployment type without opening dialog (no manifest/artifact data)', async () => {
    const { container } = renderFunction(pipelineMockData)
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(container.querySelector('[data-icon="service-helm"]')).toBeInTheDocument())
    const a = container.querySelector('[data-icon="service-helm"]')?.parentElement?.parentElement
    fireEvent.click(a!)
    await waitFor(() => expect(pipelineMockData.updateStage).toHaveBeenCalled(), { timeout: 3000 })
  })
  test('Checking on the gitops without manifest data (no dialogue expected)', async () => {
    const { getByText } = renderFunction(pipelineMockData)
    const gitOpsElement = getByText('Gitops') as HTMLElement
    expect(gitOpsElement).toBeTruthy()
    fireEvent.click(gitOpsElement)
    await waitFor(() => expect(pipelineMockData.updatePipeline).toHaveBeenCalled(), { timeout: 3000 })
  })
  test('Gitops checkbox should only be visible if selected deployment type is Kubernetes', () => {
    mockStageReturnWithoutManifestData.stage.stage.spec.serviceConfig.serviceDefinition.type = 'NativeHelm'
    const pipelineMockDataWithNativeHelm = getContextValue(mockStageReturnWithoutManifestData)
    renderFunction(pipelineMockDataWithNativeHelm)
    const gitOpsElement = screen.queryByText('Gitops')
    expect(gitOpsElement).toBeNull()
  })

  test('checking on the gitops with other stage data should render a dialogue confirmation', async () => {
    const pipelineMockDataWithManifest = getContextValue(mockStageReturnWithManifest)
    const { container, getByText } = renderFunction(pipelineMockDataWithManifest)
    expect(container).toMatchSnapshot()
    const gitOpsElement = getByText('Gitops') as HTMLElement
    expect(gitOpsElement).toBeTruthy()
    fireEvent.click(gitOpsElement)
    const form = findDialogContainer() as HTMLElement
    await waitFor(() => expect(form).toBeTruthy())
    const confirmButton = (await screen.findAllByRole('button', { name: /confirm/i }))[0]
    fireEvent.click(confirmButton)
    await waitFor(() => expect(pipelineMockDataWithManifest.updatePipeline).toHaveBeenCalled(), { timeout: 3000 })
  })

  test('Changing the deployment type when the stage contains other data should open the confirmation dialogue', async () => {
    mockStageReturnWithManifest.stage.stage.spec.serviceConfig.serviceDefinition.spec = specObjectWithData
    const pipelineMockDataWithManifest = getContextValue(mockStageReturnWithManifest)
    const { container } = renderFunction(pipelineMockDataWithManifest)
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(container.querySelector('[data-icon="service-helm"]')).toBeInTheDocument())
    const nativeHelmContainer = container.querySelector('[data-icon="service-helm"]')?.parentElement?.parentElement
    fireEvent.click(nativeHelmContainer!)
    const form = findDialogContainer() as HTMLElement
    await waitFor(() => expect(form).toBeTruthy())
    const confirmButton = (await screen.findAllByRole('button', { name: /confirm/i }))[0]
    fireEvent.click(confirmButton)
    await waitFor(() => expect(pipelineMockDataWithManifest.updateStage).toHaveBeenCalled(), { timeout: 3000 })
  })
})
