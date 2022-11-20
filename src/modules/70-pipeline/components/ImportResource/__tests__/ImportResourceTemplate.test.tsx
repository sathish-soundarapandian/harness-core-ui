import { act, render, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  modulePathProps,
  orgPathProps,
  projectPathProps,
  templatePathProps
} from '@common/utils/routeUtils'
import * as templateNg from 'services/template-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { mockRepos, mockBranches, gitConnectorMock } from '@gitsync/components/GitSyncForm/__tests__/mockdata'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import ImportResource from '../ImportResource'

jest.mock('services/template-ng', () => ({
  importTemplatePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
}))

const getGitConnector = jest.fn(() => Promise.resolve(gitConnectorMock))
const fetchRepos = jest.fn(() => Promise.resolve(mockRepos))
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(gitConnectorMock)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: gitConnectorMock.data.content[0], refetch: getGitConnector, loading: false }
  }),
  useGetListOfReposByRefConnector: jest.fn().mockImplementation(() => {
    return { data: mockRepos, refetch: fetchRepos, loading: false }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  })
}))

const TEST_TEMPLATES_PATH = routes.toTemplates({
  ...accountPathProps,
  ...orgPathProps,
  ...templatePathProps,
  ...modulePathProps,
  ...projectPathProps
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

const initialValues = {
  identifier: 'Github_Template',
  name: 'Github Template',
  description: 'importing Template',
  connectorRef: 'testConnectorRef',
  repoName: 'testRepo',
  branch: 'testBranch',
  filePath: '.harness/Github_Template.yaml',
  versionLabel: 'Version1'
}

describe('ImportResource - Template', () => {
  beforeEach(() => {
    onSuccess.mockReset()
    onFailure.mockReset()
    onCancelClick.mockReset()
  })

  test('snapshot testing', () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_TEMPLATES_PATH} pathParams={TEST_PATH_PARAMS}>
        <ImportResource resourceType={ResourceType.TEMPLATE} />
      </TestWrapper>
    )
    expect(getByText('name')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('clicking on cancel button should call onCancelClick prop function', () => {
    const { getByText } = render(
      <TestWrapper path={TEST_TEMPLATES_PATH} pathParams={TEST_PATH_PARAMS}>
        <ImportResource resourceType={ResourceType.TEMPLATE} onCancelClick={onCancelClick} />
      </TestWrapper>
    )

    const cancelButton = getByText('cancel')
    userEvent.click(cancelButton)
    expect(onCancelClick).toHaveBeenCalled()
    expect(onCancelClick).toHaveBeenCalledTimes(1)
  })

  test('when onCancelClick prop is not passed - clicking on cancel button should not call onCancelClick prop function', () => {
    const { getByText } = render(
      <TestWrapper path={TEST_TEMPLATES_PATH} pathParams={TEST_PATH_PARAMS}>
        <ImportResource resourceType={ResourceType.TEMPLATE} />
      </TestWrapper>
    )

    const cancelButton = getByText('cancel')
    userEvent.click(cancelButton)
    expect(onCancelClick).not.toHaveBeenCalled()
    expect(onCancelClick).toHaveBeenCalledTimes(0)
  })

  test('provide required values and click on import button', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_TEMPLATES_PATH} pathParams={TEST_PATH_PARAMS}>
        <ImportResource
          resourceType={ResourceType.TEMPLATE}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          initialValues={initialValues}
        />
      </TestWrapper>
    )

    const importButton = getByText('common.import')
    expect(container).toMatchSnapshot()
    act(() => {
      userEvent.click(importButton)
    })
    await waitFor(() => expect(getByText('pipeline.importSuccessMessage')).toBeDefined())
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
  test('when onSuccess prop is not passed - provide required values and click on import button', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_TEMPLATES_PATH} pathParams={TEST_PATH_PARAMS}>
        <ImportResource
          resourceType={ResourceType.TEMPLATE}
          onCancelClick={onCancelClick}
          initialValues={initialValues}
        />
      </TestWrapper>
    )

    const importButton = getByText('common.import')
    expect(container).toMatchSnapshot()
    act(() => {
      userEvent.click(importButton)
    })
    await waitFor(() => expect(getByText('pipeline.importSuccessMessage')).toBeDefined())
    await waitFor(() => expect(onSuccess).not.toHaveBeenCalled())
    expect(onSuccess).toHaveBeenCalledTimes(0)
  })

  test('when import throws error WITHOUT responseMessages', async () => {
    jest.spyOn(templateNg, 'importTemplatePromise').mockImplementation((): any => {
      return Promise.reject({
        status: 'ERROR',
        code: 'INVALID_REQUEST',
        message: 'Invalid Request: Error while importing template'
      })
    })

    const { container, getByText } = render(
      <TestWrapper path={TEST_TEMPLATES_PATH} pathParams={TEST_PATH_PARAMS}>
        <ImportResource
          resourceType={ResourceType.TEMPLATE}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          onFailure={onFailure}
          initialValues={initialValues}
        />
      </TestWrapper>
    )

    const importButton = getByText('common.import')
    expect(container).toMatchSnapshot()
    act(() => {
      userEvent.click(importButton)
    })
    await waitFor(() => expect(getByText('Invalid Request: Error while importing template')).toBeDefined())
    await waitFor(() => expect(onFailure).toHaveBeenCalled())
    expect(onFailure).toHaveBeenCalledTimes(1)
  })
})
