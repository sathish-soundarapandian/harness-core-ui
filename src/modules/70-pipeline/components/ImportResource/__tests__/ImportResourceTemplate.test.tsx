import { render } from '@testing-library/react'
import React from 'react'
import routes from '@common/RouteDefinitions'
import { accountPathProps, modulePathProps, orgPathProps, templatePathProps } from '@common/utils/routeUtils'
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
  ...modulePathProps
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

// const initialValues = {
//   identifier: 'Github_Template',
//   name: 'Github Template',
//   description: 'importing Template',
//   connectorRef: 'testConnectorRef',
//   repoName: 'testRepo',
//   branch: 'testBranch',
//   filePath: '.harness/Github_Template.yaml'
// }

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
})
