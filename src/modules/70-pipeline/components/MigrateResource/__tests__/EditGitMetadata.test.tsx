/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor, queryByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as pipelineNg from 'services/pipeline-ng'
import { mockRepos, gitConnectorMock } from '@gitsync/components/GitSyncForm/__tests__/mockdata'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import EditGitMetadata from '../EditGitMetadata'

const updatePipelineGitDetailsMock = () =>
  Promise.resolve({
    status: 'SUCCESS',
    data: { identifier: 'testId' },
    metaData: null,
    correlationId: 'correlationId'
  })

jest.mock('services/pipeline-ng', () => ({
  updatePipelineGitDetailsPromise: jest.fn().mockImplementation(() => {
    return updatePipelineGitDetailsMock()
  }),
  updateInputSetGitDetailsPromise: jest.fn().mockImplementation(() => {
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
const onCancelClick = jest.fn()

describe('EditGitMetadata tests', () => {
  beforeEach(() => {
    onSuccess.mockReset()
    onFailure.mockReset()
    onCancelClick.mockReset()
  })

  test('initial rendering for EditGitMetadata for pipeline', async () => {
    const { container, getByText, getAllByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <EditGitMetadata
          resourceType={ResourceType.PIPELINES}
          initialValues={{
            connectorRef: 'connectorRefDummy',
            repo: 'repo-dummy',
            filePath: './mockFilePath'
          }}
          identifier={'testId'}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      </TestWrapper>
    )
    //Fields should be populated and enabled
    await waitFor(() => expect(getGitConnector).toHaveBeenCalled())

    const connectorSelector = container.querySelector('button[data-testid="cr-field-connectorRef"]')
    expect(connectorSelector).not.toHaveAttribute('disabled')
    const filePathInput = queryByAttribute('name', container, 'filePath') as HTMLInputElement
    expect(filePathInput).toHaveValue('./mockFilePath')
    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'filePath', value: '' })

    const saveButton = getByText('save')
    act(() => {
      userEvent.click(saveButton)
    })
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    await waitFor(() => expect(getAllByText('pipeline.editGitDetailsSuccess')[0]).toBeDefined())
  })

  test('Initial rendering for EditGitMetadata for inputSet', async () => {
    const { container, getByText, getAllByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <EditGitMetadata
          resourceType={ResourceType.INPUT_SETS}
          initialValues={{
            connectorRef: 'connectorRefDummy',
            repo: 'repo-dummy',
            filePath: './mockFilePath'
          }}
          extraQueryParams={{ pipelineIdentifier: 'pipelineId' }}
          identifier={'testId'}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      </TestWrapper>
    )
    //Fields should be populated and enabled for InputSet too
    await waitFor(() => expect(getGitConnector).toHaveBeenCalled())
    const connectorSelector = container.querySelector('button[data-testid="cr-field-connectorRef"]')
    expect(connectorSelector).not.toHaveAttribute('disabled')
    const saveButton = getByText('save')
    act(() => {
      userEvent.click(saveButton)
    })
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    await waitFor(() => expect(getAllByText('pipeline.editGitDetailsSuccess')[0]).toBeDefined())
  })

  test('clicking on cancel button should call onCancelClick prop function', () => {
    const { getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <EditGitMetadata
          resourceType={ResourceType.PIPELINES}
          initialValues={{
            connectorRef: 'connectorRefDummy',
            repo: 'repo-dummy',
            filePath: './mockFilePath'
          }}
          identifier={'testId'}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      </TestWrapper>
    )

    const cancelButton = getByText('cancel')
    userEvent.click(cancelButton)
    expect(onCancelClick).toHaveBeenCalled()
    expect(onCancelClick).toHaveBeenCalledTimes(1)
  })

  test('when editMetadata throws error without responseMessages', async () => {
    jest.spyOn(pipelineNg, 'updatePipelineGitDetailsPromise').mockImplementation((): any => {
      return Promise.reject({
        status: 'ERROR',
        code: 'INVALID_REQUEST',
        message: 'Invalid Request: Error while moving inputSet'
      })
    })

    const { getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <EditGitMetadata
          resourceType={ResourceType.PIPELINES}
          initialValues={{
            connectorRef: 'connectorRefDummy',
            repo: 'repo-dummy',
            filePath: './mockFilePath'
          }}
          identifier={'testId'}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      </TestWrapper>
    )

    const saveButton = getByText('save')
    act(() => {
      userEvent.click(saveButton)
    })
    await waitFor(() => expect(getByText('Invalid Request: Error while moving inputSet')).toBeDefined())
    await waitFor(() => expect(onFailure).toHaveBeenCalled())
    expect(onFailure).toHaveBeenCalledTimes(1)
  })

  test('when edit throws error without message and responseMessages', async () => {
    jest.spyOn(pipelineNg, 'updatePipelineGitDetailsPromise').mockImplementation((): any => {
      return Promise.reject({
        status: 'ERROR'
      })
    })

    const { getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <EditGitMetadata
          resourceType={ResourceType.PIPELINES}
          initialValues={{
            connectorRef: 'connectorRefDummy',
            repo: 'repo-dummy',
            filePath: './mockFilePath'
          }}
          identifier={'testId'}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      </TestWrapper>
    )

    const saveButton = getByText('save')
    act(() => {
      userEvent.click(saveButton)
    })
    await waitFor(() => expect(getByText('somethingWentWrong')).toBeDefined())
    await waitFor(() => expect(onFailure).toHaveBeenCalled())
    expect(onFailure).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(0)
  })
})
