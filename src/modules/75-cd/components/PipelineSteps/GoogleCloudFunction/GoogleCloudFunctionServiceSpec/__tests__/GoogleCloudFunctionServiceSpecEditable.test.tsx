/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  findByText,
  fireEvent,
  waitFor,
  getByText as getElementByText,
  queryByAttribute,
  act,
  findByTestId,
  within,
  screen,
  queryAllByAttribute
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { setupMode } from '../../../PipelineStepsUtil'
import {
  updateStageArgGcfFunctionDefinition,
  updateStageArgForPropagatedStageWithGcfFunctionDefinitionManifest,
  updateStageArgGcfFunctionAliasDefinition,
  updateStageArgGoogleCloudFunctionDefinitionUpdate,
  updateStageArgGoogleCloudFunctionGenOneDefinitionUpdate,
  updateStageArgGoogleCloudFunctionDefinitionManifestDelete,
  updateStageArgGoogleCloudFunctionGenOneDefinitionManifestDelete
} from './helper'
import GoogleCloudFunctionServiceSpecEditable from '../GoogleCloudFunctionServiceSpecEditable'
import {
  pipelineContextGcf,
  pipelineContextGcfManifests,
  pipelineContextGcfGen1,
  pipelineContextGcfGen1Manifest
} from './mocks'

const connectorData = { data: connectorsData.data.content[1] }
const fetchConnector = jest.fn().mockReturnValue(connectorData)
const fetchConnectorList = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectorList })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorData, refetch: fetchConnector, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

const testManifestStoreStep = async (portal: HTMLElement): Promise<void> => {
  const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

  await waitFor(() => expect(queryByValueAttribute('Github')).not.toBeNull())

  const Git = queryByValueAttribute('Git')
  expect(Git).not.toBeNull()
  const GitLab = queryByValueAttribute('GitLab')
  expect(GitLab).not.toBeNull()
  const Bitbucket = queryByValueAttribute('Bitbucket')
  expect(Bitbucket).not.toBeNull()
  const Harness = queryByValueAttribute('Harness')
  expect(Harness).not.toBeNull()

  userEvent.click(Git!)
  const connnectorRefInput = await findByTestId(portal, /connectorRef/)
  expect(connnectorRefInput).toBeTruthy()
  userEvent.click(connnectorRefInput!)

  await act(async () => {
    const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[1] as HTMLElement
    const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
    expect(githubConnector1).toBeTruthy()
    const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
    expect(githubConnector2).toBeTruthy()
    userEvent.click(githubConnector1)
    const applySelected = getElementByText(connectorSelectorDialog, 'entityReference.apply')
    await act(async () => {
      fireEvent.click(applySelected)
    })
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(1))
  })
  const secondStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
  await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
  userEvent.click(secondStepContinueButton)
}

const testGcfManifestLastStep = async (portal: HTMLElement): Promise<void> => {
  await waitFor(() => expect(getElementByText(portal, 'pipeline.manifestType.manifestIdentifier')).toBeInTheDocument())

  const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', portal, name)
  await act(async () => {
    fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
    fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
    fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
    fireEvent.change(queryByNameAttribute('paths[0].path')!, { target: { value: 'test-path' } })
  })
  const submitButton = getElementByText(portal, 'submit').parentElement as HTMLElement
  userEvent.click(submitButton)
}

const testUpdateGcfFunctionDefinitionManifest = async (): Promise<void> => {
  const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
  const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

  // Check if second step IS NOT displayed
  const Git = queryByValueAttribute('Git')
  await waitFor(() => expect(Git).toBeNull()) // Because upon editing manifest, directly third step will be shown

  // Change fields in the last step and submit manifest
  await testGcfManifestLastStep(portal)
}

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })

const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

describe('GoogleCloudFunctionServiceSpecEditable tests', () => {
  test('for GCF deployment type, add Gen2 Deployment type  manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextGcf.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextGcf}>
          <GoogleCloudFunctionServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const functionDefinitionSection = screen.getByTestId('function-definition-card')
    const addFunctionDefinitionBtn = within(functionDefinitionSection).getByText('common.addName')
    expect(addFunctionDefinitionBtn).toBeInTheDocument()
    userEvent.click(addFunctionDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testGcfManifestLastStep(portal)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgGcfFunctionDefinition)
    })
  })

  test('for GCF deployment type, add Gen1 Deployment type manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextGcfGen1.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextGcfGen1}>
          <GoogleCloudFunctionServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const functionDefinitionSection = screen.getByTestId('function-definition-card')
    const addFunctionDefinitionBtn = within(functionDefinitionSection).getByText('common.addName')
    expect(addFunctionDefinitionBtn).toBeInTheDocument()
    fireEvent.click(addFunctionDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    await waitFor(() => expect(queryByValueAttribute('Github')).not.toBeNull())
    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testGcfManifestLastStep(portal)
    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgGcfFunctionAliasDefinition)
    })
  })

  test('update GoogleCloudFunctionDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextGcfManifests.updateStage = updateStage

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextGcfManifests}>
          <GoogleCloudFunctionServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Click Edit button for Function Definition manifest
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-card')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.GoogleCloudFunctionDefinition')
    ).toBeInTheDocument()
    // continue with updating manifest
    expect(screen.getByText('manifest1')).toBeInTheDocument()
    const editButtons = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButtons).toHaveLength(1)
    const functionDefinitionManifestEditButton = editButtons[0]
    expect(functionDefinitionManifestEditButton).toBeInTheDocument()
    userEvent.click(functionDefinitionManifestEditButton)

    await testUpdateGcfFunctionDefinitionManifest()

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgGoogleCloudFunctionDefinitionUpdate)
    })
  })

  test('update GoogleCloudFunctionGenOneDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextGcfGen1Manifest.updateStage = updateStage

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextGcfGen1Manifest}>
          <GoogleCloudFunctionServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Click Edit button for Function Definition manifest
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-card')
    expect(
      within(functionDefinitionHeaderContainer).getByText(
        'pipeline.manifestTypeLabels.GoogleCloudFunctionDefinitionGenOne'
      )
    ).toBeInTheDocument()
    // continue with updating manifest
    expect(screen.getByText('GcfManifestGenOne')).toBeInTheDocument()
    const editButtons = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButtons).toHaveLength(1)
    const functionDefinitionManifestEditButton = editButtons[0]
    expect(functionDefinitionManifestEditButton).toBeInTheDocument()
    userEvent.click(functionDefinitionManifestEditButton)

    await testUpdateGcfFunctionDefinitionManifest()

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgGoogleCloudFunctionGenOneDefinitionUpdate)
    })
  })

  test('delete GoogleCloudFunctionDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextGcfManifests.updateStage = updateStage

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextGcfManifests}>
          <GoogleCloudFunctionServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present then Click Delete button of GCFFunction Definition manifest
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-card')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.GoogleCloudFunctionDefinition')
    ).toBeInTheDocument()
    expect(screen.getByText('testidentifier')).toBeInTheDocument()
    const deleteButtons = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButtons).toHaveLength(1)
    const functionDefinitionManifestDeleteButton = deleteButtons[0]
    expect(functionDefinitionManifestDeleteButton).toBeInTheDocument()
    userEvent.click(functionDefinitionManifestDeleteButton)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgGoogleCloudFunctionDefinitionManifestDelete)
    })
  })

  test('delete GoogleCloudFunctionGenOneDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextGcfGen1Manifest.updateStage = updateStage

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextGcfGen1Manifest}>
          <GoogleCloudFunctionServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    // Check if required manifest sections are present then Click Delete button of GCF Function GenOne Definition manifest
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-card')
    expect(
      within(functionDefinitionHeaderContainer).getByText(
        'pipeline.manifestTypeLabels.GoogleCloudFunctionDefinitionGenOne'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('testidentifier')).toBeInTheDocument()
    const deleteButtons = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButtons).toHaveLength(1)
    const functionDefinitionManifestDeleteButton = deleteButtons[0]
    expect(functionDefinitionManifestDeleteButton).toBeInTheDocument()
    userEvent.click(functionDefinitionManifestDeleteButton)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgGoogleCloudFunctionGenOneDefinitionManifestDelete)
    })
  })

  test('when stage is propagated from previous stage', async () => {
    const updateStage = jest.fn()
    pipelineContextGcfManifests.state.selectionState.selectedStageId = 'Stage_2'
    pipelineContextGcfManifests.updateStage = updateStage

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextGcfManifests}>
          <GoogleCloudFunctionServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false,
              setupModeType: setupMode.PROPAGATE,
              stageIndex: 1
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-card')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.GoogleCloudFunctionDefinition')
    ).toBeInTheDocument()
    expect(screen.getByText('FunctionDefinition_Manifest')).toBeInTheDocument()
    const editButtons = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButtons).toHaveLength(1)
    const functionDefinitionManifestEditButton = editButtons[0]
    expect(functionDefinitionManifestEditButton).toBeInTheDocument()
    userEvent.click(functionDefinitionManifestEditButton)

    await testUpdateGcfFunctionDefinitionManifest()

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgForPropagatedStageWithGcfFunctionDefinitionManifest)
    })
  })

  test('when manifest internal object is not present in main manifest object', async () => {
    const updateStage = jest.fn()
    delete pipelineContextGcfManifests.state.pipeline.stages[1].stage.spec.serviceConfig.stageOverrides.manifests[0]
      .manifest
    pipelineContextGcfManifests.state.selectionState.selectedStageId = 'Stage_2'
    pipelineContextGcfManifests.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextGcfManifests}>
          <GoogleCloudFunctionServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false,
              setupModeType: setupMode.PROPAGATE,
              stageIndex: 1
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-card')
    expect(functionDefinitionHeaderContainer).toBeInTheDocument()
    expect(screen.queryByText('manifest1')).not.toBeInTheDocument()
  })

  test('when deployment type is passed as a part of props', async () => {
    const updateStage = jest.fn()
    pipelineContextGcfManifests.state.selectionState.selectedStageId = 'Stage_1'
    pipelineContextGcfManifests.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextGcfManifests}>
          <GoogleCloudFunctionServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false,
              deploymentType: ServiceDeploymentType.GoogleCloudFunctions
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-card')
    const addFunctionDefinitionBtn = within(functionDefinitionHeaderContainer).getByText('common.addName')
    expect(addFunctionDefinitionBtn).toBeInTheDocument()
  })

  test('for GCF deployment type, Asserting Expected Labels and Yaml Editor', async () => {
    const updateStage = jest.fn()
    pipelineContextGcf.updateStage = updateStage

    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextGcf}>
          <GoogleCloudFunctionServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Asserting Yaml editor
    const elements = queryAllByAttribute('class', container, '~yamlBuilderContainer')
    expect(elements).not.toBeNull()

    // Check if section is rendered with correct header and list items
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-card')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.GoogleCloudFunctionDefinition')
    ).toBeInTheDocument()

    expect(getByText('cd.pipelineSteps.serviceTab.manifest.functionDefinition')).toBeInTheDocument()
  })
})
