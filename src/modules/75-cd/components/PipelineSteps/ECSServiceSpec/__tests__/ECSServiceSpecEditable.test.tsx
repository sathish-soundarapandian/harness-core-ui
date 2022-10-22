/*
 * Copyright 2022 Harness Inc. All rights reserved.
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
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  pipelineContextECS,
  pipelineContextECSManifests
} from '@pipeline/components/PipelineStudio/PipelineContext/__tests__/helper'
import { ECSServiceSpecEditable } from '../ECSServiceSpecEditable'
import {
  updateStageArgEcsScallingPolicyDefinition,
  updateStageArgEcsServiceDefinition,
  updateStageArgEcsTaskDefinition,
  updateStageArgEcsScalableTargetDefinition,
  updateStageArgEcsTaskDefinitionManifestUpdate,
  updateStageArgEcsTaskDefinitionManifestDelete,
  updateStageArgEcsServiceDefinitionManifestDelete,
  updateStageArgEcsScallingPolicyManifestDelete,
  updateStageArgEcsScalableTargetManifestDelete,
  updateStageArgManifestUpdateForPropagatedStage
} from './helpers/helper'
import { setupMode } from '../../PipelineStepsUtil'

const fetchConnector = jest.fn().mockReturnValue({ data: connectorsData.data?.content?.[1] })
const fetchConnectorList = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectorList })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: connectorsData.data.content[1] }, refetch: fetchConnector, loading: false }
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

const testEcsManifestLastStep = async (portal: HTMLElement): Promise<void> => {
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

const testUpdateEcsTaskDefinitionManifest = async (): Promise<void> => {
  const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
  const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

  // Check if Git tile is checked and click Continue
  const Git = queryByValueAttribute('Git')
  await waitFor(() => expect(Git).not.toBeNull())
  expect(Git).toBeChecked()
  const secondStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
  await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
  userEvent.click(secondStepContinueButton)

  // Change fields in the last step and submit manifest
  await testEcsManifestLastStep(portal)
}

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })

const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

describe('ManifestSelection tests for ECS', () => {
  test('for Amazon ECS deployment type, add EcsTaskDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextECS.updateStage = updateStage

    const { getByTestId } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECS}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const taskDefinitionSection = getByTestId('task-definition-card')
    const addTaskDefinitionBtn = within(taskDefinitionSection).getByText('common.addName')
    expect(addTaskDefinitionBtn).toBeDefined()
    fireEvent.click(addTaskDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testEcsManifestLastStep(portal)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgEcsTaskDefinition)
    })
  })

  test('for Amazon ECS deployment type, add EcsServiceDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextECS.updateStage = updateStage

    const { getByTestId } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECS}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const serviceDefinitionSection = getByTestId('service-definition-card')
    const addServiceDefinitionBtn = within(serviceDefinitionSection).getByText('common.addName')
    expect(addServiceDefinitionBtn).toBeDefined()
    fireEvent.click(addServiceDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testEcsManifestLastStep(portal)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgEcsServiceDefinition)
    })
  })

  test('for Amazon ECS deployment type, add EcsScalingPolicyDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextECS.updateStage = updateStage

    const { getByTestId } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECS}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const scallingPolicyDefinitionSection = getByTestId('scaling-policy-definition-card')
    const addScallingPolicyDefinitionBtn = within(scallingPolicyDefinitionSection).getByText('common.addName')
    expect(addScallingPolicyDefinitionBtn).toBeDefined()
    fireEvent.click(addScallingPolicyDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    await waitFor(() => expect(queryByValueAttribute('Github')).not.toBeNull())
    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testEcsManifestLastStep(portal)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgEcsScallingPolicyDefinition)
    })
  })

  test('for Amazon ECS deployment type, add EcsScalableTargetDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextECS.updateStage = updateStage

    const { getByTestId } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECS}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const scalableTargetDefinitionSection = getByTestId('scalable-target-definition-card')
    const addscalableTargetDefinitionBtn = within(scalableTargetDefinitionSection).getByText('common.addName')
    expect(addscalableTargetDefinitionBtn).toBeDefined()
    fireEvent.click(addscalableTargetDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    await waitFor(() => expect(queryByValueAttribute('Github')).not.toBeNull())
    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testEcsManifestLastStep(portal)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgEcsScalableTargetDefinition)
    })
  })

  test('for Amazon ECS deployment type, only expected add manifest buttons should appear', async () => {
    const updateStage = jest.fn()
    pipelineContextECSManifests.updateStage = updateStage

    const { getByText, findAllByText, getAllByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECSManifests}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // There should be only 2 Add buttons because EcsTaskDefinition and EcsServiceDefinition allows only 1 manifest addition
    const allPlusAddManifestButtons = await findAllByText(/common.addName/)
    expect(allPlusAddManifestButtons).toHaveLength(2)

    // Check if section is rendered with correct header and list items
    // Task Definition
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')).toBeInTheDocument()
    expect(getByText('TaskDefinition_Manifest')).toBeInTheDocument()
    // Service Definition
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')).toBeInTheDocument()
    expect(getByText('ServiceDefinition_Manifest')).toBeInTheDocument()

    // Scalling Policy and Scalable Target Definition
    expect(getAllByText('common.headerWithOptionalText')).toHaveLength(2)
    // Scalling Policy
    expect(getByText('ScallingPolicy_Manifest')).toBeInTheDocument()
    // Scalable Target Definition
    expect(getByText('ScalableTarget_Manifest')).toBeInTheDocument()
  })

  test('update EcsTaskDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextECSManifests.updateStage = updateStage

    const { getByText, container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECSManifests}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Click Edit button for Task Definition manifest
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')).toBeInTheDocument()
    expect(getByText('TaskDefinition_Manifest')).toBeInTheDocument()
    const editButtons = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButtons).toHaveLength(4)
    const taskDefinitionManifestEditButton = editButtons[0]
    expect(taskDefinitionManifestEditButton).toBeInTheDocument()
    userEvent.click(taskDefinitionManifestEditButton)

    await testUpdateEcsTaskDefinitionManifest()

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgEcsTaskDefinitionManifestUpdate)
    })
  })

  test('delete EcsTaskDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextECSManifests.updateStage = updateStage

    const { getByText, container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECSManifests}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present then Click Delete button of Task Definition manifest
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')).toBeInTheDocument()
    expect(getByText('TaskDefinition_Manifest')).toBeInTheDocument()
    const deleteButtons = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButtons).toHaveLength(4)
    const taskDefinitionManifestDeleteButton = deleteButtons[0]
    expect(taskDefinitionManifestDeleteButton).toBeInTheDocument()
    userEvent.click(taskDefinitionManifestDeleteButton)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgEcsTaskDefinitionManifestDelete)
    })
  })

  test('delete EcsServiceDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextECSManifests.updateStage = updateStage

    const { getByText, container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECSManifests}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present then Click Delete button of Service Definition manifest
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')).toBeInTheDocument()
    expect(getByText('ServiceDefinition_Manifest')).toBeInTheDocument()
    const deleteButtons = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButtons).toHaveLength(4)
    const serviceDefinitionManifestDeleteButton = deleteButtons[1]
    expect(serviceDefinitionManifestDeleteButton).toBeInTheDocument()
    userEvent.click(serviceDefinitionManifestDeleteButton)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgEcsServiceDefinitionManifestDelete)
    })
  })

  test('delete EcsScalableTargetDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextECSManifests.updateStage = updateStage

    const { getByText, container, getAllByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECSManifests}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present then Click Delete button of Scalable Target manifest
    expect(getAllByText('common.headerWithOptionalText')).toHaveLength(2)
    expect(getByText('ScalableTarget_Manifest')).toBeInTheDocument()
    const deleteButtons = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButtons).toHaveLength(4)
    const scalableTargetManifestDeleteButton = deleteButtons[2]
    expect(scalableTargetManifestDeleteButton).toBeInTheDocument()
    userEvent.click(scalableTargetManifestDeleteButton)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgEcsScalableTargetManifestDelete)
    })
  })

  test('delete EcsScalingPolicyDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextECSManifests.updateStage = updateStage

    const { getByText, container, getAllByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECSManifests}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present then Click Delete button of Scalling Policy manifest
    expect(getAllByText('common.headerWithOptionalText')).toHaveLength(2)
    expect(getByText('ScallingPolicy_Manifest')).toBeInTheDocument()
    const deleteButtons = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButtons).toHaveLength(4)
    const scallingPolicyManifestDeleteButton = deleteButtons[3]
    expect(scallingPolicyManifestDeleteButton).toBeInTheDocument()
    userEvent.click(scallingPolicyManifestDeleteButton)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgEcsScallingPolicyManifestDelete)
    })
  })

  test('when stage is propagated from previous stage', async () => {
    const updateStage = jest.fn()
    pipelineContextECSManifests.state.selectionState.selectedStageId = 'Stage_2'
    pipelineContextECSManifests.updateStage = updateStage

    const { getByText, container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECSManifests}>
          <ECSServiceSpecEditable
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
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')).toBeInTheDocument()
    expect(getByText('TaskDefinition_Manifest')).toBeInTheDocument()
    const editButtons = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButtons).toHaveLength(1)
    const taskDefinitionManifestEditButton = editButtons[0]
    expect(taskDefinitionManifestEditButton).toBeInTheDocument()
    userEvent.click(taskDefinitionManifestEditButton)

    await testUpdateEcsTaskDefinitionManifest()

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgManifestUpdateForPropagatedStage)
    })
  })

  test('when manifest internal object is not present in main manifest object', async () => {
    const updateStage = jest.fn()
    delete pipelineContextECSManifests.state.pipeline.stages[1].stage.spec.serviceConfig.stageOverrides.manifests[0]
      .manifest
    pipelineContextECSManifests.state.selectionState.selectedStageId = 'Stage_2'
    pipelineContextECSManifests.updateStage = updateStage

    const { queryByText, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECSManifests}>
          <ECSServiceSpecEditable
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
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')).toBeInTheDocument()
    expect(queryByText('TaskDefinition_Manifest')).not.toBeInTheDocument()
  })

  test('when deployment type is passed as a part of props', async () => {
    const updateStage = jest.fn()
    pipelineContextECSManifests.state.selectionState.selectedStageId = 'Stage_1'
    pipelineContextECSManifests.updateStage = updateStage

    const { getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECSManifests}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false,
              deploymentType: 'ECS'
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')).toBeInTheDocument()
    expect(getByText('TaskDefinition_Manifest')).toBeInTheDocument()
  })

  test('when prop isReadonlyServiceMode is true', async () => {
    const updateStage = jest.fn()
    pipelineContextECSManifests.updateStage = updateStage

    const { getByText, getAllByText, findAllByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextECSManifests}>
          <ECSServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: true
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Two Add buttons should be visible (Scalling Policy and Scalable Target sections)
    const allPlusAddManifestButtons = await findAllByText(/common.addName/)
    expect(allPlusAddManifestButtons).toHaveLength(2)

    // Check header of each manifest section card
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')).toBeInTheDocument()
    expect(getByText('TaskDefinition_Manifest')).toBeInTheDocument()
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')).toBeInTheDocument()
    expect(getAllByText('common.headerWithOptionalText')).toHaveLength(2)

    // Check if + Add Primary Artifact button is disabled
    const addPrimaryArtifactBtn = getByText('pipeline.artifactsSelection.addPrimaryArtifact')
    expect(addPrimaryArtifactBtn).toBeInTheDocument()
    // Check if + Add Sidecar button is disabled
    const addSidecarBtn = getByText('pipeline.artifactsSelection.addSidecar')
    expect(addSidecarBtn).toBeInTheDocument()

    // Check if Variable section is rendered
    expect(getByText('common.variables')).toBeInTheDocument()
  })
})
