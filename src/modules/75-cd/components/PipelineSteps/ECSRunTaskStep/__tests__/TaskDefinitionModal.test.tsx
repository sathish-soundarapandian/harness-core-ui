/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  fireEvent,
  queryByAttribute,
  render,
  waitFor,
  findByText,
  findByTestId,
  getByText,
  getByTestId
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'

import type { StoreConfigWrapper } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import { TaskDefinitionModal } from '../TaskDefinitionModal'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: connectorsData.data.content[1] }, refetch: fetchConnectors, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

export const testTaskDefinitionSecondStep = async (portal: HTMLElement): Promise<void> => {
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
  // Pick up second dialog for choosing connector
  const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[1] as HTMLElement
  const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
  expect(githubConnector1).toBeTruthy()
  const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
  expect(githubConnector2).toBeTruthy()
  userEvent.click(githubConnector1)
  const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
  userEvent.click(applySelected)
  // Expect for connector dialog to be closed and only task definition dialog to be opened
  await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(1))

  const secondStepContinueButton = getByText(portal, 'continue').parentElement as HTMLElement
  await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
  userEvent.click(secondStepContinueButton)
}

export const testTaskDefinitionLastStep = async (portal: HTMLElement): Promise<void> => {
  await waitFor(() => expect(getByText(portal, 'pipeline.manifestType.gitFetchTypeLabel')).toBeInTheDocument())

  const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', portal, name)

  fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
  fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
  fireEvent.change(queryByNameAttribute('paths[0].path')!, { target: { value: 'test-path' } })

  const submitButton = getByText(portal, 'submit').parentElement as HTMLElement
  userEvent.click(submitButton)
}

const emptyInitialValues = {}
const existingInitialValues: StoreConfigWrapper = {
  type: 'Github',
  spec: {
    connectorRef: 'account.Git_CTR',
    repoName: 'repo1',
    gitFetchType: 'Commit',
    commitId: 'abcdefghi123456',
    paths: ['path1']
  }
}

const onTaskDefinitionModalClose = jest.fn()
const setConnectorView = jest.fn()
const updateManifestList = jest.fn()

describe('TaskDefinitionModal tests', () => {
  beforeEach(() => {
    onTaskDefinitionModalClose.mockReset()
    setConnectorView.mockReset()
    updateManifestList.mockReset()
  })

  test(`renders fine for empty values and values can be changed`, async () => {
    render(
      <TestWrapper>
        <TaskDefinitionModal
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          onTaskDefinitionModalClose={onTaskDefinitionModalClose}
          connectorView={false}
          updateManifestList={updateManifestList}
          setConnectorView={setConnectorView}
          isOpen={true}
          selectedManifest={ManifestDataType.EcsTaskDefinition}
          availableManifestTypes={[ManifestDataType.EcsTaskDefinition]}
        />
      </TestWrapper>
    )

    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    // Test manifest store tiles, choose Git and fill in Connector field
    await testTaskDefinitionSecondStep(portal)

    // Fill in required field and submit manifest
    await testTaskDefinitionLastStep(portal)

    await waitFor(() =>
      expect(updateManifestList).toHaveBeenCalledWith({
        manifest: {
          identifier: '',
          type: ManifestDataType.EcsTaskDefinition,
          spec: {
            store: {
              spec: {
                branch: 'testBranch',
                connectorRef: 'account.Git_CTR',
                gitFetchType: 'Branch',
                paths: ['test-path']
              },
              type: 'Git'
            }
          }
        }
      })
    )
  })

  test(`Edit view - renders fine for existing values`, async () => {
    const updateManifestList1 = jest.fn()
    render(
      <TestWrapper>
        <TaskDefinitionModal
          initialValues={existingInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          onTaskDefinitionModalClose={onTaskDefinitionModalClose}
          connectorView={false}
          updateManifestList={updateManifestList1}
          setConnectorView={setConnectorView}
          isOpen={true}
          selectedManifest={ManifestDataType.EcsTaskDefinition}
          availableManifestTypes={[ManifestDataType.EcsTaskDefinition]}
        />
      </TestWrapper>
    )

    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const queryByNameAttribute = (name: string): HTMLElement | null =>
      queryByAttribute('name', portal, name) as HTMLInputElement
    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    // Store step
    const Github = queryByValueAttribute('Github')
    await waitFor(() => expect(Github).not.toBeNull())
    expect(Github).toBeChecked()
    const connnectorRefInput = await findByTestId(portal, /connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    await waitFor(() => expect(getByText(connnectorRefInput, 'Git CTR')).toBeInTheDocument())
    const secondStepContinueButton = getByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
    userEvent.click(secondStepContinueButton)

    // Final step
    await waitFor(() => expect(getByText(portal, 'pipeline.manifestType.gitFetchTypeLabel')).toBeInTheDocument())
    const repoNameInput = queryByNameAttribute('repoName') as HTMLInputElement
    expect(repoNameInput.value).toBe('repo1')
    const gitFetchTypeInput = queryByNameAttribute('gitFetchType') as HTMLInputElement
    expect(gitFetchTypeInput.value).toBe('Specific Commit Id / Git Tag')
    const branchInput = queryByNameAttribute('commitId') as HTMLInputElement
    expect(branchInput.value).toBe('abcdefghi123456')
    const path1Input = queryByNameAttribute('paths[0].path') as HTMLInputElement
    expect(path1Input.value).toBe('path1')
    const submitButton = getByText(portal, 'submit').parentElement as HTMLElement
    userEvent.click(submitButton)

    await waitFor(() =>
      expect(updateManifestList1).toHaveBeenCalledWith({
        manifest: {
          identifier: '',
          type: ManifestDataType.EcsTaskDefinition,
          spec: {
            store: {
              spec: {
                connectorRef: 'account.Git_CTR',
                repoName: 'repo1',
                gitFetchType: 'Commit',
                commitId: 'abcdefghi123456',
                paths: ['path1']
              },
              type: 'Github'
            }
          }
        }
      })
    )
  })

  test(`Harness as ECS Task Definition Store`, async () => {
    render(
      <TestWrapper>
        <TaskDefinitionModal
          initialValues={emptyInitialValues as unknown as any}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          onTaskDefinitionModalClose={onTaskDefinitionModalClose}
          connectorView={false}
          updateManifestList={updateManifestList}
          setConnectorView={setConnectorView}
          isOpen={true}
          selectedManifest={ManifestDataType.EcsTaskDefinition}
          availableManifestTypes={[ManifestDataType.EcsTaskDefinition]}
        />
      </TestWrapper>
    )

    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
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
    userEvent.click(Harness!)
    const secondStepContinueButton = getByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
    userEvent.click(secondStepContinueButton)

    // Check if last step is rendered file with + Add adding file select field properly
    await waitFor(() => expect(getByText(portal, 'fileFolderPathText')).toBeInTheDocument())
    const addFilesBtn = getByTestId(portal, 'add-files').parentElement
    userEvent.click(addFilesBtn!)
    await waitFor(() => expect(portal.querySelector('[data-icon="chevron-down"]')).toBeInTheDocument())
  })
})
