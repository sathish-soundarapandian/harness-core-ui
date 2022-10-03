/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  fireEvent,
  getByTestId,
  getByText,
  queryByTestId,
  queryByText,
  render,
  RenderResult,
  waitFor
} from '@testing-library/react'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps, userPathProps } from '@common/utils/routeUtils'
import type { ResponseBoolean } from 'services/cd-ng'
import UserDetails from '../UserDetails'
import {
  mockResponse,
  userInfo,
  orgMockData,
  projectMockData,
  roleBindingsList,
  userGroupsAggregateInfo,
  userGroupsAggregate
} from './mock'

const deleteMember = jest.fn()
const deleteMemberMock = (): ResponseBoolean => {
  deleteMember()
  return mockResponse
}

const createUser = jest.fn()
const createUserMock = (): ResponseBoolean => {
  createUser()
  return mockResponse
}

jest.mock('services/cd-ng', () => ({
  useGetAggregatedUser: jest.fn().mockImplementation(() => {
    return { data: userInfo, refetch: jest.fn(), error: null, loading: false }
  }),
  useRemoveMember: jest.fn().mockImplementation(() => {
    return { mutate: deleteMemberMock }
  }),
  useAddUsers: jest.fn().mockImplementation(() => ({ mutate: createUserMock })),
  getUserGroupAggregateListPromise: jest.fn().mockImplementation(() => {
    return Promise.resolve({ data: userGroupsAggregate.data, refetch: jest.fn(), error: null, loading: false })
  }),

  useGetUserGroupAggregateListByUser: jest.fn(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => Promise.resolve(userGroupsAggregateInfo))
  })),
  useGetOrganizationList: jest.fn().mockImplementation(() => {
    return { ...orgMockData, refetch: jest.fn(), error: null }
  }),
  getOrganizationListPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: orgMockData.data.data, refetch: jest.fn(), error: null })
    })
  }),
  useGetProjectList: jest.fn().mockImplementation(() => {
    return { data: { data: { content: projectMockData } }, refetch: jest.fn(), error: null }
  })
}))

jest.mock('services/rbac', () => ({
  useGetFilteredRoleAssignmentByScopeList: jest.fn(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => Promise.resolve(roleBindingsList))
  }))
}))

describe('UserDetails Test', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path={routes.toUserDetails({ ...accountPathProps, ...userPathProps })}
        pathParams={{ accountId: 'testAcc', userIdentifier: 'dummy' }}
      >
        <UserDetails />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    await waitFor(() => getAllByText('accessControl: users'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  })
  test('Change Scope', () => {
    const scopeDropDown = getByText(container, 'rbac.scopeItems.accountOnly')
    act(() => {
      fireEvent.click(scopeDropDown)
    })
    const popover = findPopoverContainer()
    expect(popover).toBeTruthy()
    const all = getByText(popover!, 'all')
    act(() => {
      fireEvent.click(all)
    })
    expect(getAllByText('all').length).toBe(2)
  })
  test('Change Scope to Org', async () => {
    const scopeDropDown = getByText(container, 'rbac.scopeItems.accountOnly')
    await act(() => {
      fireEvent.click(scopeDropDown)
    })
    const popover = findPopoverContainer()
    expect(popover).toBeTruthy()
    const orgOnly = getByText(popover!, 'rbac.scopeItems.orgOnly')
    await act(() => {
      fireEvent.click(orgOnly)
    })
    expect(getAllByText('default').length).toBe(1)
  })
  test('Change Scope to Org With Projects', async () => {
    const scopeDropDown = getByText(container, 'rbac.scopeItems.accountOnly')
    await act(() => {
      fireEvent.click(scopeDropDown)
    })
    const popover = findPopoverContainer()
    expect(popover).toBeTruthy()
    const orgWithProjects = getByText(popover!, 'rbac.scopeItems.orgWithProjects')
    await act(() => {
      fireEvent.click(orgWithProjects)
    })
    expect(getAllByText('default').length).toBe(1)
    const select = getByText(container, 'rbac.scopeItems.allProjects')
    await act(() => {
      fireEvent.click(select)
    })
    const project1 = getByText(container, 'Project 1')
    await act(() => {
      fireEvent.click(project1)
    })
  })
  test('Render RoleBindings', async () => {
    const roleBindings = getByText(container, 'rbac.roleBindings')
    await act(async () => {
      fireEvent.click(roleBindings)
    })
    expect(getByText(container, 'Account Viewer')).toBeTruthy()
  })
  test('Add User Group to User', async () => {
    createUser.mockReset()
    const addUG = getByTestId(container, 'add-UserGroup')
    fireEvent.click(addUG!)
    const dialog = findDialogContainer()
    expect(dialog).toBeTruthy()
    await waitFor(() => getByText(dialog!, 'abc_name'))

    if (dialog) {
      expect(queryByTestId(dialog, 'Checkbox-abc')).not.toBeDisabled()
      act(() => {
        fireEvent.click(getByText(dialog, 'abc_name'))
      })

      const submit = getByText(dialog, 'entityReference.apply')
      await act(async () => {
        fireEvent.click(submit)
      })
      expect(createUser).toHaveBeenCalled()
    }
  })
  test('Delete User Group from User', async () => {
    deleteMember.mockReset()
    const menu = getByTestId(container, 'menu-UserGroup-user_group')
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    expect(popover).toBeTruthy()
    const deleteMenu = getByText(popover as HTMLElement, 'common.remove')
    await act(async () => {
      fireEvent.click(deleteMenu!)
      await waitFor(() => getByText(document.body, 'rbac.userDetails.userGroup.deleteTitle'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const deleteBtn = queryByText(form as HTMLElement, 'common.remove')
      fireEvent.click(deleteBtn!)
      expect(deleteMember).toBeCalled()
    })
  })
})

describe('UserDetails Scope Test', () => {
  test('Org scope Test', () => {
    const { container, getAllByText } = render(
      <TestWrapper
        path={routes.toUserDetails({ ...accountPathProps, ...orgPathProps, ...userPathProps })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'orgId',
          userIdentifier: 'dummy'
        }}
      >
        <UserDetails />
      </TestWrapper>
    )

    const scopeDropDown = getByText(container, 'rbac.scopeItems.orgOnly')
    act(() => {
      fireEvent.click(scopeDropDown)
    })
    const popover = findPopoverContainer()
    expect(popover).toBeTruthy()
    const all = getByText(popover!, 'all')
    act(() => {
      fireEvent.click(all)
    })
    expect(getAllByText('all').length).toBe(2)
  })
  test('Project scope Test', () => {
    const { container, getAllByText } = render(
      <TestWrapper
        path={routes.toUserDetails({ ...accountPathProps, ...projectPathProps, ...userPathProps })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'orgId',
          projectIdentifier: 'projectId',
          userIdentifier: 'dummy'
        }}
      >
        <UserDetails />
      </TestWrapper>
    )

    const scopeDropDown = getByText(container, 'rbac.scopeItems.projectOnly')
    act(() => {
      fireEvent.click(scopeDropDown)
    })
    const popover = findPopoverContainer()
    expect(popover).toBeTruthy()
    const all = getByText(popover!, 'all')
    act(() => {
      fireEvent.click(all)
    })
    expect(getAllByText('all').length).toBe(2)
  })
})
