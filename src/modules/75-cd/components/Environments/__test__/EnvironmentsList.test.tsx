/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, getAllByText, fireEvent, waitFor, getByRole, getAllByRole } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import mockEnvironments from '@cd/components/PipelineSteps/DeployEnvStep/__tests__/mock.json'
import mockImport from 'framework/utils/mockImport'
import { EnvironmentList } from '../EnvironmentList/EnvironmentsList'

const mutate = jest.fn(() => {
  return Promise.resolve({ data: {} })
})
jest.mock('services/cd-ng', () => {
  return {
    useGetYamlSchema: jest.fn(() => ({ data: null })),
    useGetEnvironmentList: jest
      .fn()
      .mockImplementation(() => ({ loading: false, data: mockEnvironments, refetch: jest.fn() })),
    useCreateEnvironmentV2: jest.fn(() => ({ data: null })),
    useUpsertEnvironmentV2: jest.fn(() => ({ data: null })),
    useDeleteEnvironmentV2: jest.fn(() => ({ mutate }))
  }
})

describe('EnvironmentList', () => {
  test('EnvironmentList should render loading correctly', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironmentList: () => ({ loading: true, refetch: jest.fn() })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/environment"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentList />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
  })

  test('Environment should render error correctly', async () => {
    const message = 'ERROR OCCURS'

    mockImport('services/cd-ng', {
      useGetEnvironmentList: () => ({ error: { message }, refetch: jest.fn() })
    })
    render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/environment"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentList />
      </TestWrapper>
    )
    expect(getByText(document.body, message)).toBeDefined()
  })

  test('EnvironmentList should render data correctly', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironmentList: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/environment"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentList />
      </TestWrapper>
    )

    expect(getAllByText(document.body, mockEnvironments.data.content[0].environment.name)).toBeDefined()
    expect(getAllByText(document.body, mockEnvironments.data.content[1].environment.name)).toBeDefined()
  })
  test('Should open Add Environment Modal on click', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/environment"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentList />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[data-testid="add-environment"]') as HTMLElement)
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(form).toMatchSnapshot()
  })

  test('Should go to edit modal by clicking edit', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironmentList: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/environment"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentList />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="edit"]') as HTMLElement)

    expect(container).toMatchSnapshot()
  })

  test('Should allow deleting', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironmentList: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/environment"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentList />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)

    expect(getByText(document.body, 'confirm')).toBeDefined()
    fireEvent.click(getByText(document.body, 'confirm') as HTMLButtonElement)
    await waitFor(() => expect(mutate).toBeCalledTimes(1))
  })

  test('force delete env entity', async () => {
    const forceDeleteMutateRejected = jest.fn().mockRejectedValue({
      data: {
        status: 'ERROR',
        code: 'ENTITY_REFERENCE_EXCEPTION',
        message: 'Error Detected'
      }
    })

    mockImport('services/cd-ng', {
      useDeleteEnvironmentV2: () => ({
        mutate: forceDeleteMutateRejected
      })
    })

    const { container } = render(
      <TestWrapper
        defaultFeatureFlagValues={{ SPG_MODULE_VERSION_INFO: true }}
        path={routes.toEnvironment({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', module: 'cd', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentList />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)

    const form = findDialogContainer() as HTMLElement
    await waitFor(() => expect(form).toBeTruthy())

    expect(getByText(form, 'confirm')).toBeInTheDocument()
    fireEvent.click(getByText(form, 'confirm') as HTMLButtonElement)

    await waitFor(() => expect(findDialogContainer()!).toBeTruthy())
    const forceDeleteForm = findDialogContainer()

    const forceDeleteMutateResolved = jest.fn().mockResolvedValue({
      data: {
        status: 'ERROR',
        code: 'ENTITY_REFERENCE_EXCEPTION',
        message: 'Error Detected'
      }
    })

    mockImport('services/cd-ng', {
      useDeleteEnvironmentV2: () => ({
        mutate: forceDeleteMutateResolved
      })
    })

    expect(getAllByRole(forceDeleteForm!, 'button')[1]).toBeDisabled()
    fireEvent.click(getByRole(forceDeleteForm!, 'checkbox'))

    await waitFor(() => expect(getAllByRole(forceDeleteForm!, 'button')[1]).not.toBeDisabled())
    fireEvent.click(getAllByRole(forceDeleteForm!, 'button')[1])

    await waitFor(() =>
      expect(forceDeleteMutateResolved).toHaveBeenLastCalledWith('gjhjghjhg', {
        headers: { 'content-type': 'application/json' },
        queryParams: {
          accountIdentifier: 'dummy',
          forceDelete: true,
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy'
        }
      })
    )
  })
})
