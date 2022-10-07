/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, act, fireEvent, queryByAttribute, findAllByText, findByText } from '@testing-library/react'
import { noop } from 'lodash-es'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import { gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { projectPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import useCreateConnectorModalMock from '@connectors/modals/ConnectorModal/__mocks__/useCreateConnectorModal'
import GitSyncRepoForm from '../GitSyncRepoForm'
import { gitHubMock, mockBranches } from './mockData'

const branches = { data: ['master', 'devBranch'], status: 'SUCCESS' }
const fetchBranches = jest.fn(() => Promise.resolve(branches))
const createGitSynRepo = jest.fn()
const getGitConnector = jest.fn(() => Promise.resolve({}))

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(mockBranches))
let getTestConnectionResultPromiseCalled = false
jest.mock('@connectors/modals/ConnectorModal/useCreateConnectorModal', () =>
  useCreateConnectorModalMock({
    connector: {
      name: 'abhinav-github',
      identifier: 'abhinavgithub',
      description: '',
      orgIdentifier: undefined,
      projectIdentifier: undefined,
      tags: {},
      type: 'Github',
      spec: {
        url: 'https://github.com/harness/harness-core-ui/',
        validationRepo: null,
        authentication: {
          type: 'Http',
          spec: {
            type: 'UsernameToken',
            spec: { username: null, usernameRef: 'account.autouser1', tokenRef: 'account.abhinavtest2' }
          }
        },
        apiAccess: null,
        delegateSelectors: [],
        executeOnDelegate: false,
        type: 'Repo'
      }
    },
    createdAt: 1649150274945,
    lastModifiedAt: 1649299488973,
    status: {
      status: 'SUCCESS',
      errorSummary: null,
      errors: null,
      testedAt: 1649299467270,
      lastTestedAt: 0,
      lastConnectedAt: 1649299467270
    },
    activityDetails: { lastActivityTime: 1649299463522 },
    harnessManaged: false,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null }
  })
)
jest.mock('services/cd-ng', () => {
  return {
    getTestConnectionResultPromise: jest.fn().mockImplementation(() => {
      getTestConnectionResultPromiseCalled = true
      return Promise.resolve({ data: { data: { status: 'SUCESS' } } })
    }),
    usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
    useGetConnector: jest.fn().mockImplementation(() => ({ data: gitHubMock, refetch: getGitConnector })),
    getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(gitHubMock)),
    useGetListOfBranchesByConnector: jest.fn().mockImplementation(() => ({ data: branches, refetch: fetchBranches })),
    useGetTestGitRepoConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn })),
    useListGitSync: jest
      .fn()
      .mockImplementation(() => ({ data: gitConfigs, refetch: () => Promise.resolve(gitConfigs) })),

    useGetListOfBranchesWithStatus: jest.fn().mockImplementation((): any => {
      return {
        data: mockBranches,
        refetch: getListOfBranchesWithStatus,
        error: null,
        loading: false,
        absolutePath: '',
        cancel: jest.fn(),
        response: null
      }
    }),
    useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
      return { data: sourceCodeManagers, refetch: () => Promise.resolve(sourceCodeManagers) }
    })
  }
})

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('Git Sync - repo tab', () => {
  test('rendering form to create gitSync repo', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper path={routes.toGitSyncReposAdmin(projectPathProps)} pathParams={pathParams}>
        <GitSyncRepoForm
          {...pathParams}
          isEditMode={false}
          isNewUser={true}
          gitSyncRepoInfo={{ branch: 'branch', gitConnectorType: 'Github' }}
          onSuccess={noop}
          onClose={noop}
        />
      </GitSyncTestWrapper>
    )

    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })
    expect(container).toMatchSnapshot()

    // All required validation test
    await act(async () => {
      fireEvent.click(getByText('continue'))
    })

    expect(container).toMatchSnapshot()
  })

  test('Repo type card should be enabled only for Github', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper path={routes.toGitSyncReposAdmin(projectPathProps)} pathParams={pathParams}>
        <GitSyncRepoForm
          {...pathParams}
          isEditMode={false}
          isNewUser={true}
          gitSyncRepoInfo={undefined}
          onSuccess={noop}
          onClose={noop}
        />
      </GitSyncTestWrapper>
    )

    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })
    const gitHubCard = queryByAttribute('data-testid', container, 'Github-card')
    // const gitLabCard = queryByAttribute('data-testid', container, 'Gitlab-card')

    expect(gitHubCard?.classList.contains('Card--interactive')).toBe(true)
    expect(gitHubCard?.classList.contains('Card--disabled')).toBe(false)
    // expect(gitLabCard?.classList.contains('Card--interactive')).toBe(false)
    // expect(gitLabCard?.classList.contains('Card--disabled')).toBe(true)

    // await act(async () => {
    //   fireEvent.click(gitLabCard!)
    // })
    //selected card should not change
    expect(container).toMatchSnapshot()
  })

  test('Filling gitSync repo form', async () => {
    const { container, getByText, queryByText } = render(
      <GitSyncTestWrapper path={routes.toGitSyncReposAdmin(projectPathProps)} pathParams={pathParams}>
        <GitSyncRepoForm
          {...pathParams}
          isEditMode={false}
          isNewUser={false}
          gitSyncRepoInfo={undefined}
          onSuccess={noop}
          onClose={noop}
        />
      </GitSyncTestWrapper>
    )

    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })

    const connnectorRefInput = queryByAttribute('data-testid', container, /gitConnector/)
    expect(connnectorRefInput).toBeDefined()
    fireEvent.click(connnectorRefInput!)

    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0]
      const githubConnector = await findAllByText(connectorSelectorDialog as HTMLElement, 'ValidGithubRepo')
      expect(connectorSelectorDialog).toMatchSnapshot('connectorSelectorDialog')
      expect(githubConnector).toBeTruthy()
      fireEvent.click(githubConnector?.[0])
      const applySelected = getByText('entityReference.apply')
      await act(async () => {
        fireEvent.click(applySelected)
      })
    })

    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeDefined()

    await act(async () => {
      fireEvent.change(nameInput!, { target: { value: 'repoName' } })
    })

    expect(fetchBranches).toBeCalledTimes(1)
    const rootfolderInput = queryByAttribute('name', container, 'rootfolder')
    expect(rootfolderInput).toBeDefined()

    await act(async () => {
      fireEvent.change(rootfolderInput!, { target: { value: 'src' } })
    })

    const icons = container.querySelectorAll('[icon="chevron-down"]')
    const branchInputIcon = icons[icons.length - 1]
    expect(branchInputIcon).toBeDefined()

    act(() => {
      fireEvent.click(branchInputIcon!)
    })

    await waitFor(() => expect(queryByText('devBranch')).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('devBranch'))
    })

    expect(container).toMatchSnapshot('gitSync repo form')

    const submitBtn = await findByText(container, 'save')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(createGitSynRepo).toBeCalledTimes(1)
      expect(createGitSynRepo).toHaveBeenCalledWith({
        branch: 'devBranch',
        gitConnectorRef: 'ValidGithubRepo',
        gitConnectorType: 'Github',
        gitSyncFolderConfigDTOs: [
          {
            isDefault: true,
            rootFolder: '/src/.harness/'
          }
        ],
        identifier: 'repoName',
        name: 'repoName',
        orgIdentifier: 'default',
        projectIdentifier: 'dummyProject',
        repo: 'https://github.com/wings-software/sunnykesh-gitSync'
      })
    })
  })

  test('Updating the status of connector', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper path={routes.toGitSyncReposAdmin(projectPathProps)} pathParams={pathParams}>
        <GitSyncRepoForm
          {...pathParams}
          isEditMode={false}
          isNewUser={false}
          gitSyncRepoInfo={undefined}
          onSuccess={noop}
          onClose={noop}
        />
      </GitSyncTestWrapper>
    )

    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })

    const connnectorRefInput = queryByAttribute('data-testid', container, /gitConnector/)
    expect(connnectorRefInput).toBeDefined()
    fireEvent.click(connnectorRefInput!)

    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0]
      const githubConnector = await findAllByText(connectorSelectorDialog as HTMLElement, 'ValidGithubRepo')
      expect(connectorSelectorDialog).toMatchSnapshot('connectorSelectorDialog')
      expect(githubConnector).toBeTruthy()
      const editBtn = document.getElementsByClassName('editBtn')[0]

      expect(editBtn).toBeDefined()
      expect(editBtn).toMatchSnapshot('editBtn')
      await act(async () => {
        fireEvent.click(editBtn! as HTMLElement)
      })
    })
    const connectorDialog = document.getElementsByClassName('bp3-dialog')[1]
    expect(connectorDialog).toBeDefined()
    expect(connectorDialog).toMatchSnapshot('connectorDialog')

    const continueStepOne = await findByText(connectorDialog as HTMLElement, 'save')
    expect(continueStepOne).toBeDefined()
    await act(async () => {
      fireEvent.click(continueStepOne! as HTMLElement)
    })
    expect(getTestConnectionResultPromiseCalled).toBeTruthy()
  })
})
