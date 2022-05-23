/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  fireEvent,
  getAllByText,
  getByText,
  render,
  waitFor,
  getByTestId,
  queryAllByText
} from '@testing-library/react'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { projectPathProps } from '@common/utils/routeUtils'
import ProjectDetails from '../views/ProjectDetails/ProjectDetails'
import {
  createMockData,
  invitesMockData,
  OrgMockData,
  projectMockDataWithModules,
  response,
  responseProjectAggregateDTO,
  responseProjectAggregateDTOWithNoModules,
  roleMockData,
  userMockData
} from './ProjectPageMock'

const getProject = jest.fn()
const deleteProject = jest.fn()
const getOrg = jest.fn()
const deleteProjectMock = (): Promise<{ status: string }> => {
  deleteProject()
  return Promise.resolve({ status: 'SUCCESS', data: true })
}

let noModule = false

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: userMockData, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useStartFreeLicense: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementation(() => {
        return {
          status: 'SUCCESS',
          data: {
            licenseType: 'FREE'
          }
        }
      })
    }
  }),
  useStartTrialLicense: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementation(() => {
        return {
          status: 'SUCCESS',
          data: {
            licenseType: 'TRIAL'
          }
        }
      })
    }
  }),
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: deleteProjectMock })),
  usePutProject: jest.fn().mockImplementation(() => createMockData),
  useGetProject: jest.fn().mockImplementation(() => {
    return { ...projectMockDataWithModules, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetProjectAggregateDTO: jest.fn().mockImplementation(args => {
    getProject(args)

    return {
      ...(noModule ? { data: responseProjectAggregateDTOWithNoModules } : { data: responseProjectAggregateDTO }),
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useGetOrganization: jest.fn().mockImplementation(args => {
    getOrg(args)
    return { ...OrgMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetInvites: jest.fn().mockImplementation(() => ({ data: invitesMockData, loading: false, refetch: jest.fn() })),
  useAddUsers: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useDeleteInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useUpdateInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) }))
}))

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => ({ data: roleMockData, loading: false, refetch: jest.fn() }))
}))

describe('Project Details', () => {
  test('render with modules and edit menu', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toProjectDetails({ ...projectPathProps })}
        pathParams={{ accountId: 'testAcc', orgIdentifier: 'Cisco_Meraki', projectIdentifier: 'Portal' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ProjectDetails />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const menu = container.querySelector("[data-icon='Options']")
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const edit = getByTestId(popover as HTMLElement, 'edit-project')
    await act(async () => {
      fireEvent.click(edit)
      await waitFor(() => queryAllByText(document.body, 'projectsOrgs.projectEdit'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      fireEvent.click(form?.querySelector('button[type="submit"]')!)
    })
  }),
    test('render with no modules and invite collaborators', async () => {
      noModule = true
      const { container } = render(
        <TestWrapper
          path={routes.toProjectDetails({ ...projectPathProps })}
          pathParams={{ accountId: 'testAcc', orgIdentifier: 'Cisco_Meraki', projectIdentifier: 'Portal' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <ProjectDetails />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
      const menu = container.querySelector("[data-icon='Options']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const invite = getByText(popover as HTMLElement, 'projectsOrgs.invite')
      await act(async () => {
        fireEvent.click(invite)
        await waitFor(() => queryAllByText(document.body, 'projectsOrgs.invite'))
        let form = findDialogContainer()
        expect(form).toBeTruthy()
        await waitFor(() => fireEvent.click(form?.querySelector('[icon="cross"]')!))
        form = findDialogContainer()
        expect(form).not.toBeTruthy()
      })
    }),
    test('Manage Projects', async () => {
      const { container, getByTestId: localGetByTestId } = render(
        <TestWrapper
          path={routes.toProjectDetails({ ...projectPathProps })}
          pathParams={{ accountId: 'testAcc', orgIdentifier: 'Cisco_Meraki', projectIdentifier: 'Portal' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <ProjectDetails />
        </TestWrapper>
      )
      const back = getByText(container, 'projectsText')
      fireEvent.click(back)
      await waitFor(() => localGetByTestId('location'))
      expect(localGetByTestId('location').innerHTML.endsWith(routes.toProjects({ accountId: 'testAcc' }))).toBeTruthy()
    }),
    test('Click on Add Admin', async () => {
      const { container } = render(
        <TestWrapper
          path={routes.toProjectDetails({ ...projectPathProps })}
          pathParams={{ accountId: 'testAcc', orgIdentifier: 'Cisco_Meraki', projectIdentifier: 'Portal' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <ProjectDetails />
        </TestWrapper>
      )
      const plus = getAllByText(container, '+')[0]
      await act(async () => {
        fireEvent.click(plus)
        await waitFor(() => queryAllByText(document.body, 'projectsOrgs.invite')[0])
      })
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    }),
    test('Click on Add Collaborator', async () => {
      const { container } = render(
        <TestWrapper
          path={routes.toProjectDetails({ ...projectPathProps })}
          pathParams={{ accountId: 'testAcc', orgIdentifier: 'Cisco_Meraki', projectIdentifier: 'Portal' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <ProjectDetails />
        </TestWrapper>
      )
      const plus = getAllByText(container, '+')[1]
      await act(async () => {
        fireEvent.click(plus)
        await waitFor(() => queryAllByText(document.body, 'projectsOrgs.invite')[0])
      })
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    })
})
