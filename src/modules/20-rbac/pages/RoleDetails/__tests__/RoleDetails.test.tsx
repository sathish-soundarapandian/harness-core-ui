/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import type { RenderResult } from '@testing-library/react';
import { act, fireEvent, queryByAttribute, render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import {
  getResourceTypeHandlerMock,
  getResourceGroupTypeHandlerMock,
  getResourceCategoryListMock
} from '@rbac/utils/RbacFactoryMockData'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import { permissionListMockData, resourceTypesMockData, roleMockData } from './mock'

jest.useFakeTimers()

const updateRole = jest.fn()
jest.mock('services/rbac', () => ({
  useGetRole: jest.fn().mockImplementation(() => {
    return { data: roleMockData, refetch: jest.fn(), error: null }
  }),
  usePutRole: jest.fn().mockImplementation(() => ({ mutate: updateRole })),
  useGetPermissionList: jest.fn().mockImplementation(() => {
    return { data: permissionListMockData, refetch: jest.fn(), error: null }
  }),
  useGetPermissionResourceTypesList: jest.fn().mockImplementation(() => {
    return { data: resourceTypesMockData, refetch: jest.fn(), error: null }
  })
}))

jest.mock('@rbac/factories/RbacFactory', () => ({
  getResourceTypeHandler: jest.fn().mockImplementation(resource => getResourceTypeHandlerMock(resource)),
  getResourceCategoryHandler: jest.fn().mockImplementation(resource => getResourceGroupTypeHandlerMock(resource)),
  getResourceCategoryList: jest.fn().mockImplementation(() => getResourceCategoryListMock())
}))

describe('Role Details Page', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <RoleDetails />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Add Permissions', async () => {
      const organizationView = queryByAttribute('data-testid', container, 'checkBox-ORGANIZATION-view')
      expect(organizationView).toBeTruthy()
      if (organizationView) fireEvent.click(organizationView)

      const applyChanges = getByText('applyChanges')
      expect(applyChanges).toBeTruthy()

      await act(async () => {
        fireEvent.click(applyChanges)
      })

      expect(updateRole).toHaveBeenCalledWith({
        identifier: 'identifier',
        name: 'name',
        permissions: [
          'core_project_delete',
          'core_organization_create',
          'core_project_create',
          'core_organization_view'
        ],
        allowedScopeLevels: ['account'],
        description: 'description',
        tags: { ui: '', dev: '' }
      })
    }),
    test('Click on Resource Type', () => {
      const projectResources = queryByAttribute('data-testid', container, 'resourceCard-SHARED_RESOURCES')
      act(() => {
        fireEvent.click(projectResources!)
      })
      expect(container).toMatchSnapshot()
    })
})
