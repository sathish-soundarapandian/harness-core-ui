/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, getByText as getElementByText, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@harness/uicore'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { gitConnectorMock, mockRepos } from '@gitsync/components/GitSyncForm/__tests__/mockdata'
import useEditGitMetadata, { UseEditGitMetadataProps } from '../useEditGitMetadata'

jest.mock('services/pipeline-ng', () => ({
  updatePipelineGitDetailsPromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  updateInputSetGitDetailsPromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
}))

jest.mock('services/template-ng', () => ({
  updateGitDetailsPromise: jest.fn().mockImplementation(() => {
    return Promise.resolve({ status: 'SUCCESS' })
  })
}))

const getGitConnector = jest.fn(() => Promise.resolve(gitConnectorMock))
const fetchRepos = jest.fn(() => Promise.resolve(mockRepos))

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(gitConnectorMock)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: gitConnectorMock.data.content[0], refetch: getGitConnector, loading: false }
  }),
  useGetListOfReposByRefConnector: jest.fn().mockImplementation(() => {
    return { refetch: fetchRepos, data: mockRepos }
  }),
  useGetSettingValue: jest.fn().mockImplementation(() => {
    return { data: { allowDifferentRepoSettings: { data: { value: null } }, loading: false } }
  })
}))

const TEST_PIPELINES_PATH = routes.toPipelines({
  ...accountPathProps,
  ...orgPathProps,
  ...projectPathProps,
  ...pipelineModuleParams
})

const TEST_PATH_PARAMS = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  module: 'cd'
}

const onSuccess = jest.fn()
const onFailure = jest.fn()

const commonProps = {
  resourceType: ResourceType.PIPELINES,
  identifier: 'identifier',
  metadata: { connectorRef: 'connectorRefTest', repo: 'mock-repo', filePath: './src/pipeline.yaml' },
  onSuccess,
  onFailure
}
const buttonLabel = 'Edit Git Meatadata'
const modalTitleMock = 'Editing pipeline metadata'

function Component(prop: UseEditGitMetadataProps): JSX.Element {
  const { showEditGitMetadataModal: showEditGitMetadataModal } = useEditGitMetadata({
    ...commonProps,
    modalTitle: prop.modalTitle
  })

  return <Button onClick={showEditGitMetadataModal} text={buttonLabel}></Button>
}

describe('useEditGitMetadata tests', () => {
  beforeEach(() => {
    onSuccess.mockReset()
    onFailure.mockReset()
  })

  test('Component should render initial value', async () => {
    const { container, getByText, getByPlaceholderText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <Component
          modalTitle={modalTitleMock}
          resourceType={ResourceType.PIPELINES}
          identifier={'identifier'}
          metadata={{ connectorRef: 'connectorRefTest', repo: 'mock-repo', filePath: './src/pipeline.yaml' }}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      </TestWrapper>
    )

    const dummyButton = getElementByText(container, buttonLabel)
    fireEvent.click(dummyButton)
    const dialogDivs = document.getElementsByClassName('bp3-dialog')
    await waitFor(() => expect(dialogDivs).toHaveLength(1))
    expect(getByText(modalTitleMock)).toBeInTheDocument()
    expect(getByPlaceholderText('gitsync.gitSyncForm.enterYamlPath')).toHaveValue('./src/pipeline.yaml')
    const saveButton = getByText('save')
    userEvent.click(saveButton)
    await waitFor(() => expect(dialogDivs).toHaveLength(0))
    expect(onSuccess).toBeCalledTimes(1)
    expect(onFailure).toBeCalledTimes(0)
  })

  test('Component should render default title and cancel should close modal without any API', async () => {
    const { container, getByText, getByPlaceholderText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <Component
          resourceType={ResourceType.PIPELINES}
          identifier={'identifier'}
          metadata={{ connectorRef: 'connectorRefTest', repo: 'mock-repo', filePath: './src/pipeline.yaml' }}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      </TestWrapper>
    )

    const dummyButton = getElementByText(container, buttonLabel)
    fireEvent.click(dummyButton)
    const dialogDivs = document.getElementsByClassName('bp3-dialog')
    await waitFor(() => expect(dialogDivs).toHaveLength(1))
    //Default modal title should be rendered
    expect(getByText('pipeline.editingGitDetails')).toBeInTheDocument()
    expect(getByPlaceholderText('gitsync.gitSyncForm.enterYamlPath')).toHaveValue('./src/pipeline.yaml')
    const cancelButton = getByText('cancel')
    userEvent.click(cancelButton)
    await waitFor(() => expect(dialogDivs).toHaveLength(0))
    expect(onSuccess).toBeCalledTimes(0)
    expect(onFailure).toBeCalledTimes(0)
  })
})
