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
  getByText,
  queryByAttribute,
  findByTestId
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import {
  pipelineContextAwsLambda,
  pipelineContextECS
} from '@pipeline/components/PipelineStudio/PipelineContext/__tests__/helper'
import ManifestSelection from '../ManifestSelection'
import connectorsData from './connectors_mock.json'
import {
  updateManifestListFirstArgAwsLambdaFunctionDefinition,
  updateManifestListFirstArgAwsLambdaFunctionAliasDefinition
} from './helpers/helper'
import { ManifestDataType } from '../Manifesthelper'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[1], refetch: fetchConnectors, loading: false }
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

  const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[1] as HTMLElement
  const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
  expect(githubConnector1).toBeTruthy()
  const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
  expect(githubConnector2).toBeTruthy()
  userEvent.click(githubConnector1)
  const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
  userEvent.click(applySelected)

  await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(1))

  const secondStepContinueButton = getByText(portal, 'continue').parentElement as HTMLElement
  await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
  userEvent.click(secondStepContinueButton)
}

const testEcsManifestLastStep = async (portal: HTMLElement): Promise<void> => {
  await waitFor(() => expect(getByText(portal, 'pipeline.manifestType.manifestIdentifier')).toBeInTheDocument())

  const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', portal, name)

  fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
  fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
  fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
  fireEvent.change(queryByNameAttribute('paths[0].path')!, { target: { value: 'test-path' } })

  const submitButton = getByText(portal, 'submit').parentElement as HTMLElement
  userEvent.click(submitButton)
}

describe('ManifestSelection tests for AWSLambda', () => {
  test('for AWS Lambda deployment type, add AwsLambdaFunctionDefinition manifest', async () => {
    const updateManifestList = jest.fn()

    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextAwsLambda}>
          <ManifestSelection
            isReadonlyServiceMode={false}
            readonly={false}
            deploymentType={ServiceDeploymentType.AwsLambda}
            initialManifestList={[]}
            allowOnlyOneManifest={true}
            addManifestBtnText={'+ Add AWS Lambda Function Definition'}
            updateManifestList={updateManifestList}
            preSelectedManifestType={ManifestDataType.AwsLambdaFunctionDefinition}
            availableManifestTypes={[ManifestDataType.AwsLambdaFunctionDefinition]}
            deleteManifest={jest.fn()}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const addManifestButton = await findByText(container, '+ Add AWS Lambda Function Definition')
    userEvent.click(addManifestButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testEcsManifestLastStep(portal)

    await waitFor(() => {
      expect(updateManifestList).toHaveBeenCalledWith(updateManifestListFirstArgAwsLambdaFunctionDefinition, 0)
    })
  })

  test('for AWS Lambda deployment type, add AwsLambdaFunctionAliasDefinition manifest', async () => {
    const updateManifestList = jest.fn()

    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextECS}>
          <ManifestSelection
            isReadonlyServiceMode={false}
            readonly={false}
            deploymentType={ServiceDeploymentType.AwsLambda}
            initialManifestList={[]}
            addManifestBtnText={'+ Add AWS Lambda Function Alias Definition'}
            updateManifestList={updateManifestList}
            preSelectedManifestType={ManifestDataType.AwsLambdaFunctionAliasDefinition}
            availableManifestTypes={[ManifestDataType.AwsLambdaFunctionAliasDefinition]}
            deleteManifest={jest.fn()}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const addManifestButton = await findByText(container, '+ Add AWS Lambda Function Alias Definition')
    userEvent.click(addManifestButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testEcsManifestLastStep(portal)

    await waitFor(() => {
      expect(updateManifestList).toHaveBeenCalledWith(updateManifestListFirstArgAwsLambdaFunctionAliasDefinition, 0)
    })
  })
})
