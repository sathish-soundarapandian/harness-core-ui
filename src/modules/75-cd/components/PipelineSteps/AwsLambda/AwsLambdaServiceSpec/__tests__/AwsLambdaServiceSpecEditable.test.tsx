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
  screen
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  pipelineContextAwsLambda,
  pipelineContextAwsLambdaManifests
} from '@pipeline/components/PipelineStudio/PipelineContext/__tests__/helper'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { AwsLambdaServiceSpecEditable } from '../AwsLambdaServiceSpecEditable'
import { setupMode } from '../../../PipelineStepsUtil'
import {
  updateStageArgAwsLambdaFunctionDefinition,
  updateStageArgAwsLambdaFunctionAliasDefinition,
  updateStageArgFunctionDefinitionUpdate,
  updateStageArgAwsLambdaFunctionDefinitionManifestDelete,
  updateStageArgAwsLambdaFunctionAliasDefinitionManifestDelete,
  updateStageArgForPropagatedStageWithAwsLambdaFunctionDefinitionManifest
} from './helpers/helper'

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

  await userEvent.click(Git!)
  const connnectorRefInput = await findByTestId(portal, /connectorRef/)
  expect(connnectorRefInput).toBeTruthy()
  await userEvent.click(connnectorRefInput!)

  await act(async () => {
    const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[1] as HTMLElement
    const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
    expect(githubConnector1).toBeTruthy()
    const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
    expect(githubConnector2).toBeTruthy()
    await userEvent.click(githubConnector1)
    const applySelected = getElementByText(connectorSelectorDialog, 'entityReference.apply')
    await act(async () => {
      fireEvent.click(applySelected)
    })
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(1))
  })
  const secondStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
  await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
  await userEvent.click(secondStepContinueButton)
}

const testAwsLambdaManifestLastStep = async (portal: HTMLElement): Promise<void> => {
  await waitFor(() => expect(getElementByText(portal, 'pipeline.manifestType.manifestIdentifier')).toBeInTheDocument())

  const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', portal, name)
  await act(async () => {
    fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
    fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
    fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
    fireEvent.change(queryByNameAttribute('paths[0].path')!, { target: { value: 'test-path' } })
  })
  const submitButton = getElementByText(portal, 'submit').parentElement as HTMLElement
  await userEvent.click(submitButton)
}

const testUpdateAwsLambdaFunctionDefinitionManifest = async (): Promise<void> => {
  const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
  const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

  // Check if second step IS NOT displayed
  const Git = queryByValueAttribute('Git')
  await waitFor(() => expect(Git).toBeNull()) // Because upon editing manifest, directly third step will be shown

  // Change fields in the last step and submit manifest
  await testAwsLambdaManifestLastStep(portal)
}

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })

const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

describe('AwsLambdaServiceSpecEditable tests', () => {
  test('for AWS Lambda deployment type, add AwsLambdaFunctionDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsLambda.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsLambda}>
          <AwsLambdaServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const functionDefinitionSection = screen.getByTestId('aws-lambda-function-definition-card')
    const addTaskDefinitionBtn = within(functionDefinitionSection).getByText('common.addName')
    expect(addTaskDefinitionBtn).toBeInTheDocument()
    await userEvent.click(addTaskDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testAwsLambdaManifestLastStep(portal)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgAwsLambdaFunctionDefinition)
    })
  })

  test('for AWS Lambda deployment type, add AwsLambdaFunctionAliasDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsLambda.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsLambda}>
          <AwsLambdaServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const functionAliasDefinitionSection = screen.getByTestId('aws-lambda-function-alias-definition-card')
    const addFunctionAliasDefinitionBtn = within(functionAliasDefinitionSection).getByText('common.addName')
    expect(addFunctionAliasDefinitionBtn).toBeInTheDocument()
    fireEvent.click(addFunctionAliasDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    await waitFor(() => expect(queryByValueAttribute('Github')).not.toBeNull())
    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testAwsLambdaManifestLastStep(portal)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgAwsLambdaFunctionAliasDefinition)
    })
  })

  test('for AWS Lambda deployment type, only expected add manifest buttons should appear', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsLambdaManifests.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsLambdaManifests}>
          <AwsLambdaServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // There should be 1 Add button, because for AwsLambdaFunctionAliasDefinition multiple are allowed
    // while only 1 is allowed for AwsLambdaFunctionDefinition
    const allPlusAddManifestButtons = await screen.findAllByText(/common.addName/)
    expect(allPlusAddManifestButtons).toHaveLength(1)
    // Check if section is rendered with correct header and list items
    // Function Definition
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-header-container')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.AwsLambdaFunctionDefinition')
    ).toBeInTheDocument()
    expect(screen.getByText('AwsLambdaFunctionDefinition_Manifest')).toBeInTheDocument()
    // Function Alias Definition
    expect(screen.getByText('common.headerWithOptionalText')).toBeInTheDocument()
    expect(screen.getByText('AwsLambdaFunctionAliasDefinition_Manifest')).toBeInTheDocument()
  })

  test('update AwsLambdaFunctionDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsLambdaManifests.updateStage = updateStage

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsLambdaManifests}>
          <AwsLambdaServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Click Edit button for Function Definition manifest
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-header-container')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.AwsLambdaFunctionDefinition')
    ).toBeInTheDocument()

    // continue with updating manifest
    expect(screen.getByText('AwsLambdaFunctionDefinition_Manifest')).toBeInTheDocument()
    const editButtons = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButtons).toHaveLength(2)
    const functionDefinitionManifestEditButton = editButtons[0]
    expect(functionDefinitionManifestEditButton).toBeInTheDocument()
    await userEvent.click(functionDefinitionManifestEditButton)

    await testUpdateAwsLambdaFunctionDefinitionManifest()

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgFunctionDefinitionUpdate)
    })
  })

  test('delete AwsLambdaFunctionDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsLambdaManifests.updateStage = updateStage

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsLambdaManifests}>
          <AwsLambdaServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present then Click Delete button of AWS Lambda Function Definition manifest
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-header-container')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.AwsLambdaFunctionDefinition')
    ).toBeInTheDocument()
    expect(screen.getByText('AwsLambdaFunctionDefinition_Manifest')).toBeInTheDocument()
    const deleteButtons = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButtons).toHaveLength(2)
    const functionDefinitionManifestDeleteButton = deleteButtons[0]
    expect(functionDefinitionManifestDeleteButton).toBeInTheDocument()
    await userEvent.click(functionDefinitionManifestDeleteButton)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgAwsLambdaFunctionDefinitionManifestDelete)
    })
  })

  test('delete AwsLambdaFunctionAliasDefinition manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsLambdaManifests.updateStage = updateStage

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsLambdaManifests}>
          <AwsLambdaServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present then Click Delete button of AWS Lambda Function Alias Definition manifest
    expect(screen.getByText('common.headerWithOptionalText')).toBeInTheDocument()
    expect(screen.getByText('AwsLambdaFunctionAliasDefinition_Manifest')).toBeInTheDocument()
    const deleteButtons = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButtons).toHaveLength(2)
    const functionAliasDefinitionManifestDeleteButton = deleteButtons[1]
    expect(functionAliasDefinitionManifestDeleteButton).toBeInTheDocument()
    await userEvent.click(functionAliasDefinitionManifestDeleteButton)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgAwsLambdaFunctionAliasDefinitionManifestDelete)
    })
  })

  test('when stage is propagated from previous stage', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsLambdaManifests.state.selectionState.selectedStageId = 'Stage_2'
    pipelineContextAwsLambdaManifests.updateStage = updateStage

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsLambdaManifests}>
          <AwsLambdaServiceSpecEditable
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
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-header-container')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.AwsLambdaFunctionDefinition')
    ).toBeInTheDocument()
    expect(screen.getByText('FunctionDefinition_Manifest')).toBeInTheDocument()
    const editButtons = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButtons).toHaveLength(1)
    const functionDefinitionManifestEditButton = editButtons[0]
    expect(functionDefinitionManifestEditButton).toBeInTheDocument()
    await userEvent.click(functionDefinitionManifestEditButton)

    await testUpdateAwsLambdaFunctionDefinitionManifest()

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgForPropagatedStageWithAwsLambdaFunctionDefinitionManifest)
    })
  })

  test('when manifest internal object is not present in main manifest object', async () => {
    const updateStage = jest.fn()
    delete pipelineContextAwsLambdaManifests.state.pipeline.stages[1].stage.spec.serviceConfig.stageOverrides
      .manifests[0].manifest
    pipelineContextAwsLambdaManifests.state.selectionState.selectedStageId = 'Stage_2'
    pipelineContextAwsLambdaManifests.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsLambdaManifests}>
          <AwsLambdaServiceSpecEditable
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
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-header-container')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.AwsLambdaFunctionDefinition')
    ).toBeInTheDocument()
    expect(screen.queryByText('AwsLambdaFunctionDefinition_Manifest')).not.toBeInTheDocument()
  })

  test('when deployment type is passed as a part of props', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsLambdaManifests.state.selectionState.selectedStageId = 'Stage_1'
    pipelineContextAwsLambdaManifests.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsLambdaManifests}>
          <AwsLambdaServiceSpecEditable
            initialValues={{
              isReadonlyServiceMode: false,
              deploymentType: ServiceDeploymentType.AwsLambda
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-header-container')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.AwsLambdaFunctionDefinition')
    ).toBeInTheDocument()
    expect(screen.getByText('AwsLambdaFunctionDefinition_Manifest')).toBeInTheDocument()
  })
})
