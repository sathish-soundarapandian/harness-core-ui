/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, findByText, act } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { useGetListOfReposByRefConnector } from 'services/cd-ng'
import RepositorySelect from '../RepositorySelect'

const mockRepos = {
  status: 'SUCCESS',
  data: [{ name: 'repo1' }, { name: 'repo2' }, { name: 'repo3' }, { name: 'repotest1' }, { name: 'repotest2' }],
  metaData: null,
  correlationId: 'correlationId'
}
const mockReposSingle = {
  status: 'SUCCESS',
  data: [{ name: 'repo1' }],
  metaData: null,
  correlationId: 'correlationId'
}

const testPath = routes.toPipelineStudio({
  ...projectPathProps,
  ...pipelinePathProps,
  ...modulePathProps
})

const pathParams = {
  accountId: 'dummy',
  orgIdentifier: 'default',
  projectIdentifier: 'dummyProject',
  module: 'cd',
  pipelineIdentifier: '-1'
}

const fetchRepos = jest.fn(() => Promise.resolve(mockRepos))
const repoChangehandler = jest.fn(() => noop)
const setErrorResponse = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetListOfReposByRefConnector: jest.fn().mockImplementation(() => {
    return { data: mockRepos, refetch: fetchRepos }
  })
}))

describe('RepositorySelect test', () => {
  afterEach(() => {
    fetchRepos.mockReset()
    repoChangehandler.mockReset()
    setErrorResponse.mockReset()
  })

  test('default rendering RepositorySelect', async () => {
    const { container, getByText } = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <RepositorySelect connectorRef="connectorId" onChange={repoChangehandler} />
      </TestWrapper>
    )
    await waitFor(() => expect(fetchRepos).toBeCalledTimes(1))
    expect(getByText('repository')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('Repository list api called only if connectorRef is provided and field is not disabled', () => {
    render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <RepositorySelect connectorRef="connectorId" disabled={true} />
      </TestWrapper>
    )

    expect(fetchRepos).not.toBeCalled()

    render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <RepositorySelect disabled={false} />
      </TestWrapper>
    )

    expect(fetchRepos).not.toBeCalled()

    render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <RepositorySelect connectorRef="connectorId" disabled={false} />
      </TestWrapper>
    )

    expect(fetchRepos).toBeCalledTimes(1)
  })

  test('Show refetch button if repo list api failed', () => {
    ;(useGetListOfReposByRefConnector as jest.Mock).mockImplementation(() => ({
      data: [],
      refetch: fetchRepos,
      error: {
        data: {
          responseMessages: ['error']
        }
      },
      loading: false
    }))

    const { container, getByText } = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <RepositorySelect connectorRef="connectorId" disabled={false} />
      </TestWrapper>
    )

    const refreshButton = container.querySelector('[data-icon="refresh"]') as HTMLSpanElement

    expect(getByText('refresh')).toBeInTheDocument()
    expect(refreshButton).toBeInTheDocument()
    expect(fetchRepos).toBeCalledTimes(1)

    act(() => {
      fireEvent.click(refreshButton)
    })

    expect(fetchRepos).toBeCalledTimes(2)
  })

  test('Default selection if only 1 repo in list', async () => {
    ;(useGetListOfReposByRefConnector as jest.Mock).mockImplementation(() => {
      return { data: mockReposSingle, refetch: fetchRepos }
    })

    render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <RepositorySelect
          connectorRef="connectorId"
          disabled={false}
          onChange={repoChangehandler}
          setErrorResponse={setErrorResponse}
        />
      </TestWrapper>
    )

    // test defaultSelected if only 1 item in list
    expect(setErrorResponse).not.toBeCalled()
    expect(repoChangehandler).toHaveBeenLastCalledWith({ label: 'repo1', value: 'repo1' }, [])
  })

  test('Changing repo will call onchange handler with the selectedValue & selectOptions and reset error', async () => {
    // multiple items now
    ;(useGetListOfReposByRefConnector as jest.Mock).mockImplementation(() => {
      return { data: mockRepos, refetch: fetchRepos }
    })

    const { container, getByText } = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <RepositorySelect
          connectorRef="connectorId"
          disabled={false}
          onChange={repoChangehandler}
          setErrorResponse={setErrorResponse}
        />
      </TestWrapper>
    )

    // because default is only applicable of 1 repo in array
    expect(repoChangehandler).not.toBeCalled()

    const dropdown = container.querySelector('[data-icon="chevron-down"]') as HTMLInputElement

    act(() => {
      fireEvent.click(dropdown)
    })

    await waitFor(() => {
      expect(getByText('repo1')).toBeInTheDocument()
      expect(getByText('repo2')).toBeInTheDocument()
      expect(getByText('repo3')).toBeInTheDocument()
    })

    const item = await findByText(document.body, 'repo2')

    act(() => {
      fireEvent.click(item)
    })

    await waitFor(() => {
      expect(setErrorResponse).toHaveBeenLastCalledWith([])
      expect(repoChangehandler).toHaveBeenLastCalledWith({ label: 'repo2', value: 'repo2' }, [
        { label: 'repo1', value: 'repo1' },
        { label: 'repo2', value: 'repo2' },
        { label: 'repo3', value: 'repo3' },
        { label: 'repotest1', value: 'repotest1' },
        { label: 'repotest2', value: 'repotest2' }
      ])
    })
  })
})
