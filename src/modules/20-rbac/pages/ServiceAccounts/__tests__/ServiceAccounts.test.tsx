/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, queryByText, render, RenderResult, waitFor } from '@testing-library/react'

import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import type { ResponseBoolean } from 'services/cd-ng'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { mockResponse, serviceAccountsAggregate, roleMockData, resourceGroupsMockData } from './ServiceAccountsMock'
import ServiceAccountsPage from '../ServiceAccounts'

jest.useFakeTimers()

const deleteServiceAccount = jest.fn()
const deleteServiceAccountMock = (): ResponseBoolean => {
  deleteServiceAccount()
  return mockResponse
}

const createServiceAccount = jest.fn()
const createServiceAccountMock = (): ResponseBoolean => {
  createServiceAccount()
  return mockResponse
}

const editServiceAccount = jest.fn()
const editServiceAccountMock = (): ResponseBoolean => {
  editServiceAccount()
  return mockResponse
}

const createRole = jest.fn()
const createRoleMock = (): ResponseBoolean => {
  createRole()
  return mockResponse
}

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => {
    return { data: roleMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  usePostRoleAssignments: jest.fn().mockImplementation(() => ({ mutate: createRoleMock })),
  useDeleteRoleAssignment: jest.fn().mockImplementation(() => ({ mutate: mockResponse }))
}))

jest.mock('services/resourcegroups', () => ({
  useGetResourceGroupListV2: jest.fn().mockImplementation(() => {
    return { data: resourceGroupsMockData, refetch: jest.fn(), error: null }
  })
}))

jest.mock('services/cd-ng', () => ({
  useListAggregatedServiceAccounts: jest.fn().mockImplementation(() => {
    return { data: serviceAccountsAggregate, refetch: jest.fn(), error: null, loading: false }
  }),
  useDeleteServiceAccount: jest.fn().mockImplementation(() => ({ mutate: deleteServiceAccountMock })),
  useCreateServiceAccount: jest.fn().mockImplementation(() => ({ mutate: createServiceAccountMock })),
  useUpdateServiceAccount: jest.fn().mockImplementation(() => ({ mutate: editServiceAccountMock }))
}))

jest.useFakeTimers()

describe('ServiceAccountsPage Test', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path={routes.toServiceAccounts({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <ServiceAccountsPage />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    getByTestId = renderObj.getByTestId
    await waitFor(() => getAllByText('rbac.serviceAccounts.newServiceAccount'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Delete Service Account', async () => {
      deleteServiceAccount.mockReset()
      const menu = container.querySelector(
        `[data-testid="menu-${serviceAccountsAggregate.data?.content?.[0].serviceAccount.identifier}"]`
      )
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const deleteMenu = getByText(popover as HTMLElement, 'delete')
      await act(async () => {
        fireEvent.click(deleteMenu!)
        await waitFor(() => getByText(document.body, 'rbac.serviceAccounts.confirmDeleteTitle'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
        const deleteBtn = queryByText(form as HTMLElement, 'delete')
        fireEvent.click(deleteBtn!)
        expect(deleteServiceAccount).toBeCalled()
      })
    }),
    test('Create Service Account', async () => {
      createServiceAccount.mockReset()
      const newUG = getByText(container, 'rbac.serviceAccounts.newServiceAccount')
      fireEvent.click(newUG)
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      fillAtForm([{ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'name', value: 'dummy name' }])

      await act(async () => {
        clickSubmit(form!)
      })
      expect(createServiceAccount).toBeCalled()
    }),
    test('Add Roles', async () => {
      createRole.mockReset()
      const addRole = container.querySelector(
        `[data-testid="addRole-${serviceAccountsAggregate.data?.content?.[0].serviceAccount.identifier}"]`
      )
      expect(addRole).toBeTruthy()
      act(() => {
        fireEvent.click(addRole!)
      })
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const addButton = form?.querySelector('button[data-id="btn-add"]')

      expect(addButton).toBeTruthy()

      act(() => {
        fireEvent.click(addButton!)
      })

      await act(async () => {
        clickSubmit(form!)
      })

      expect(form).toMatchSnapshot()
    }),
    test('Click row', async () => {
      const row = getByText(container, serviceAccountsAggregate.data?.content?.[0].serviceAccount.name!)
      fireEvent.click(row!)
      await waitFor(() => getByTestId('location'))
      expect(
        getByTestId('location').innerHTML.endsWith(
          routes.toServiceAccountDetails({
            accountId: 'testAcc',
            serviceAccountIdentifier: serviceAccountsAggregate.data?.content?.[0].serviceAccount.identifier
          })
        )
      ).toBeTruthy()
    })
})
