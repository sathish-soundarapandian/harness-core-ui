/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, getByText, screen } from '@testing-library/react'
import mockEnvironments from '@cd/components/PipelineSteps/DeployEnvStep/__tests__/mock.json'
import mockImport from 'framework/utils/mockImport'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import EnvironmentsList from '../EnvironmentsList'

const deleteEnvironment = jest.fn().mockResolvedValue({ data: {} })
const mockErrorHandler = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentListV2: jest
    .fn()
    .mockImplementation(() => ({ loading: true, data: mockEnvironments, refetch: jest.fn() })),
  useDeleteEnvironmentV2: () => ({ mutate: deleteEnvironment })
}))

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: mockErrorHandler
  })
}))

describe('EnvironmentsList', () => {
  test('should render data correctly', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironmentListV2: () => ({
        loading: false,
        error: undefined,
        data: mockEnvironments,
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironment({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', module: 'cd', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsList response={mockEnvironments.data} refetch={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText(container, mockEnvironments.data.content[0].environment.name)).toBeInTheDocument()
    expect(getByText(container, mockEnvironments.data.content[1].environment.name)).toBeInTheDocument()
  })

  test('Environment row click should redirect to environment details page', async () => {
    const { getByTestId, container } = render(
      <TestWrapper
        path={routes.toEnvironment({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', module: 'cd', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsList response={mockEnvironments.data} refetch={jest.fn()} />
      </TestWrapper>
    )

    const row = container.getElementsByClassName('TableV2--row TableV2--card TableV2--clickable')[0]
    fireEvent.click(row!)
    await waitFor(() => getByTestId('location'))

    expect(getByTestId('location')).toHaveTextContent(
      '/account/dummy/cd/orgs/dummy/projects/dummy/environment/gjhjghjhg/details?sectionId=CONFIGURATION'
    )
  })

  test('should be possible to edit from Environment menu', async () => {
    const { getByTestId } = render(
      <TestWrapper
        path={routes.toEnvironment({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', module: 'cd', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsList response={mockEnvironments.data} refetch={jest.fn()} />
      </TestWrapper>
    )

    fireEvent.click(screen.getAllByRole('button', { name: /more/i })[0])
    fireEvent.click(screen.getAllByText(/edit/i)[0])
    await waitFor(() => getByTestId('location'))

    expect(getByTestId('location')).toHaveTextContent(
      '/account/dummy/cd/orgs/dummy/projects/dummy/environment/gjhjghjhg/details?sectionId=CONFIGURATION'
    )
  })

  test('should be possible to delete from Environment menu', async () => {
    render(
      <TestWrapper
        path={routes.toEnvironment({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', module: 'cd', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsList response={mockEnvironments.data} refetch={jest.fn()} />
      </TestWrapper>
    )

    fireEvent.click(screen.getAllByRole('button', { name: /more/i })[0])
    fireEvent.click(screen.getAllByText(/delete/i)[0])
    const form = findDialogContainer() as HTMLElement
    expect(form).toMatchSnapshot()
    expect(getByText(form, 'delete')).toBeInTheDocument()
    fireEvent.click(getByText(form, 'delete') as HTMLButtonElement)
    await waitFor(() => expect(deleteEnvironment).toBeCalledTimes(1))
  })

  test('Error handling during the deletion of items from the Environment Menu', async () => {
    mockImport('services/cd-ng', {
      useDeleteEnvironmentV2: () => ({
        mutate: jest.fn().mockRejectedValue({
          message: 'Error Detected'
        })
      })
    })

    render(
      <TestWrapper
        path={routes.toEnvironment({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', module: 'cd', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsList response={mockEnvironments.data} refetch={jest.fn()} />
      </TestWrapper>
    )
    fireEvent.click(screen.getAllByRole('button', { name: /more/i })[0])
    fireEvent.click(screen.getAllByText(/delete/i)[0])
    const form = findDialogContainer() as HTMLElement
    expect(form).toBeTruthy()
    expect(getByText(form, 'delete')).toBeInTheDocument()
    fireEvent.click(getByText(form, 'delete') as HTMLButtonElement)
    await waitFor(() => expect(mockErrorHandler).toHaveBeenCalled())
  })
})
