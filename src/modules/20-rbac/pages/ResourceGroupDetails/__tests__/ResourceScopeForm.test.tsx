/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RenderResult, getByText, render, act, fireEvent } from '@testing-library/react'
import { useGetOrganizationList, useGetProjectList } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, resourceGroupPathProps } from '@common/utils/routeUtils'
import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'
import ResourceScopeForm from '@rbac/modals/ResourceScope/views/ResourceScopeForm'
import { projectMockData, orgMockData } from './mock'

const onSubmit = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetProjectList: jest.fn().mockImplementation(() => {
    return { data: { data: { content: projectMockData } }, refetch: jest.fn(), error: null }
  }),
  useGetOrganizationList: jest.fn().mockImplementation(() => {
    return { ...orgMockData, refetch: jest.fn(), error: null }
  })
}))
const useGetProjectListMock = useGetProjectList as jest.MockedFunction<any>
const useGetOrganizationListMock = useGetOrganizationList as jest.MockedFunction<any>

describe('Resource Scope Form ', () => {
  let renderObj: RenderResult
  beforeEach(() => {
    renderObj = render(
      <TestWrapper
        path={routes.toResourceGroupDetails({ ...accountPathProps, ...orgPathProps, ...resourceGroupPathProps })}
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'testOrg',
          resourceGroupIdentifier: 'dummyResourceGroupIdentifier'
        }}
        defaultFeatureFlagValues={{ CUSTOM_RESOURCEGROUP_SCOPE: true }}
      >
        <ResourceScopeForm scopes={[]} onSubmit={onSubmit} onCancel={jest.fn()} />
      </TestWrapper>
    )
  })
  afterEach(() => {
    renderObj.unmount()
    jest.resetAllMocks()
  })
  test('custom scope at account', async () => {
    useGetProjectListMock.mockImplementation(() => {
      return { data: { data: { content: projectMockData } }, refetch: jest.fn(), error: null }
    })
    useGetOrganizationListMock.mockImplementation(() => {
      return { ...orgMockData, refetch: jest.fn(), error: null }
    })
    const { container, getByTestId } = render(
      <TestWrapper
        path={routes.toResourceGroupDetails({ ...accountPathProps, ...resourceGroupPathProps })}
        pathParams={{
          accountId: 'dummy',
          resourceGroupIdentifier: 'dummyResourceGroupIdentifier'
        }}
        defaultFeatureFlagValues={{ CUSTOM_RESOURCEGROUP_SCOPE: true }}
      >
        <ResourceScopeForm
          scopes={[
            {
              filter: 'EXCLUDING_CHILD_SCOPES',
              accountIdentifier: 'dummy',
              orgIdentifier: 'testOrg'
            },
            {
              filter: 'EXCLUDING_CHILD_SCOPES',
              accountIdentifier: 'dummy',
              orgIdentifier: 'testOrg',
              projectIdentifier: 'fdfder32432'
            }
          ]}
          onSubmit={onSubmit}
          onCancel={jest.fn()}
        />
      </TestWrapper>
    )

    const includeCurrentScope = getByText(container, 'rbac.resourceScope.includeAccResources')
    act(() => {
      fireEvent.click(includeCurrentScope)
    })

    const selectOrg = getByText(container, 'Select')
    act(() => {
      fireEvent.click(selectOrg)
    })
    const popover = findPopoverContainer()
    expect(popover).toBeTruthy()

    const defaultOrg = getByText(popover!, 'default')
    act(() => {
      fireEvent.click(defaultOrg)
    })

    const includeProjects = getByTestId('default-INCLUDE-SPECFIED-PROJECTS')
    act(() => {
      fireEvent.click(includeProjects)
    })

    const includeAllProjects = getByTestId('default-INCLUDE-ALL-PROJECTS')
    act(() => {
      fireEvent.click(includeAllProjects)
    })

    act(() => {
      fireEvent.click(getByText(container, 'common.apply'))
    })

    expect(onSubmit).toHaveBeenCalledWith([
      {
        accountIdentifier: 'dummy',
        filter: 'EXCLUDING_CHILD_SCOPES'
      },
      {
        filter: 'EXCLUDING_CHILD_SCOPES',
        accountIdentifier: 'dummy',
        orgIdentifier: 'testOrg'
      },
      {
        accountIdentifier: 'dummy',
        filter: 'EXCLUDING_CHILD_SCOPES',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'fdfder32432'
      },
      {
        filter: 'INCLUDING_CHILD_SCOPES',
        accountIdentifier: 'dummy',
        orgIdentifier: 'default'
      }
    ])
  })
})
