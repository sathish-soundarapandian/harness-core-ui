/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'

import { fireEvent, getByText, queryByText, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import type { Project } from 'services/cd-ng'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import Collaborators from '../Collaborators'
import { userMockData } from './UserMockData'
import { invitesMockData, roleMockData } from './InvitesMockData'

const project: Project = {
  orgIdentifier: 'testOrg',
  identifier: 'test',
  name: 'test',
  color: '#e6b800',
  modules: ['CD'],
  description: 'test',
  tags: { tag1: '', tag2: 'tag3' }
}

const response = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: userMockData, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetInvites: jest.fn().mockImplementation(() => ({ data: invitesMockData, loading: false, refetch: jest.fn() })),
  useAddUsers: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useDeleteInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useUpdateInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) }))
}))

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => ({ data: roleMockData, loading: false, refetch: jest.fn() }))
}))

const testPath = routes.toAccessControl({ accountId: ':accountId' })
const testPathParams = { accountId: 'testAcc' }

describe('Collaborators test', () => {
  test('Render Collaborators ', async () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <Collaborators projectIdentifier={project.identifier} orgIdentifier={project.orgIdentifier} />
      </TestWrapper>
    )
    expect(queryByText(container, 'Project Viewer')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
    const role = getByText(container, 'Project Viewer')
    fireEvent.click(role!)
    const popover = findPopoverContainer()
    const opt = getByText(popover as HTMLElement, 'Project Admin')
    fireEvent.click(opt!)
    await act(async () => {
      fireEvent.change(container.querySelector("input[name='projectsOrgs.collaborator']")!, {
        target: { value: 'example5@email.com' }
      })
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    await act(async () => {
      const refresh = container.querySelectorAll('[icon="repeat"]')[0]
      fireEvent.click(refresh)
    })
    await act(async () => {
      const deleteInvite = container.querySelectorAll('[icon="trash"]')[0]
      fireEvent.click(deleteInvite)
    })
  })

  test('Collaborators test with FF ACCOUNT_BASIC_ROLE', async () => {
    const { container } = render(
      <TestWrapper
        path={testPath}
        pathParams={testPathParams}
        defaultFeatureFlagValues={{
          ACCOUNT_BASIC_ROLE: true
        }}
      >
        <Collaborators projectIdentifier={project.identifier} orgIdentifier={project.orgIdentifier} />
      </TestWrapper>
    )

    expect(queryByText(container, 'Project Viewer')).not.toBeInTheDocument()
    expect(getByText(container, 'rbac.usersPage.selectRole')).toBeInTheDocument()
  })
})
