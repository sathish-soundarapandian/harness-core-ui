/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'

import EnvironmentGroupsList from '../EnvironmentGroupsList'
import EnvironmentGroupsMockData from './__mocks__/environmentGroupsMockData.json'

describe('Environment Groups List View', () => {
  test('renders basic list and works like an accordion', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentGroups({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <EnvironmentGroupsList
          environmentGroups={EnvironmentGroupsMockData as unknown as cdNgServices.EnvironmentGroupResponse[]}
          refetch={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.queryByTestId('Env_1')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('Env_Group_4'))
    await waitFor(() => expect(screen.queryByTestId('Env_1')).toBeInTheDocument())

    fireEvent.click(screen.queryByText('common.showLess')!)
    expect(screen.queryByTestId('Env_1')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('Env_Group_2'))
    await waitFor(() => expect(screen.queryByText('cd.noEnvironment.title')).toBeInTheDocument())

    expect(container).toMatchSnapshot()
  })

  test('edit routes to details page', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentGroups({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <EnvironmentGroupsList
          environmentGroups={EnvironmentGroupsMockData as unknown as cdNgServices.EnvironmentGroupResponse[]}
          refetch={jest.fn()}
        />
      </TestWrapper>
    )

    const moreIcon = container.querySelector('span[icon="more"]')
    fireEvent.click(moreIcon!)

    const popover = findPopoverContainer()
    const editMenuItem = popover?.querySelector('.bp3-icon-edit')
    fireEvent.click(editMenuItem!)

    expect(
      screen.getByTestId('location').innerHTML.endsWith(
        routes.toEnvironmentGroupDetails({
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          accountId: 'dummy',
          module: 'cd',
          environmentGroupIdentifier: 'Env_Group_4',
          sectionId: 'CONFIGURATION'
        })
      )
    ).toEqual(true)
  })

  test('delete env group asks for confirmation before deleting', async () => {
    const mutate = jest.fn()
    jest.spyOn(cdNgServices, 'useDeleteEnvironmentGroup').mockImplementation(
      () =>
        ({
          loading: false,
          mutate,
          cancel: jest.fn(),
          error: null
        } as any)
    )
    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentGroups({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <EnvironmentGroupsList
          environmentGroups={EnvironmentGroupsMockData as unknown as cdNgServices.EnvironmentGroupResponse[]}
          refetch={jest.fn()}
        />
      </TestWrapper>
    )

    const moreIcon = container.querySelector('span[icon="more"]')
    fireEvent.click(moreIcon!)

    const deleteMenuItem = findPopoverContainer()?.querySelector('.bp3-icon-trash')
    fireEvent.click(deleteMenuItem!)

    expect(findDialogContainer()).not.toBeNull()

    const cancelButton = findDialogContainer()?.querySelectorAll('.bp3-button-text')[1]
    fireEvent.click(cancelButton!)

    expect(findDialogContainer()).toBeNull()
    expect(mutate).not.toHaveBeenCalled()

    fireEvent.click(moreIcon!)
    fireEvent.click(deleteMenuItem!)

    act(() => {
      const deleteButton = findDialogContainer()?.querySelectorAll('.bp3-button-text')[0]
      fireEvent.click(deleteButton!)
    })

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith('Env_Group_4', { headers: { 'content-type': 'application/json' } })
    )
  })

  test('delete env group fails and displays toast', async () => {
    const mutate = jest.fn().mockRejectedValue({ message: 'Failed to delete' })
    jest.spyOn(cdNgServices, 'useDeleteEnvironmentGroup').mockImplementation(
      () =>
        ({
          loading: false,
          mutate,
          cancel: jest.fn()
        } as any)
    )
    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentGroups({ ...projectPathProps, ...modulePathProps })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
      >
        <EnvironmentGroupsList
          environmentGroups={EnvironmentGroupsMockData as unknown as cdNgServices.EnvironmentGroupResponse[]}
          refetch={jest.fn()}
        />
      </TestWrapper>
    )

    const moreIcon = container.querySelector('span[icon="more"]')
    fireEvent.click(moreIcon!)

    const deleteMenuItem = findPopoverContainer()?.querySelector('.bp3-icon-trash')
    fireEvent.click(deleteMenuItem!)

    expect(findDialogContainer()).not.toBeNull()

    act(() => {
      const deleteButton = findDialogContainer()?.querySelectorAll('.bp3-button-text')[0]
      fireEvent.click(deleteButton!)
    })

    await waitFor(() => expect(screen.queryByText('Failed to delete')).toBeInTheDocument())
  })
})
