/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  fireEvent,
  getByText,
  queryAllByText,
  queryByText,
  render,
  RenderResult,
  waitFor
} from '@testing-library/react'

import { act } from 'react-dom/test-utils'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { orgMockData } from '@projects-orgs/pages/organizations/__tests__/OrganizationsMockData'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import ProjectsListPage from '../ProjectsPage'
import {
  createMockData,
  invitesMockData,
  OrgMockData,
  projectMockData,
  projectPageMock,
  response,
  roleMockData,
  userMockData
} from './ProjectPageMock'

const getProjectList = jest.fn()
const deleteProject = jest.fn()
const getProject = jest.fn()
const getOrg = jest.fn()
const deleteProjectMock = (): Promise<{ status: string }> => {
  deleteProject()
  return Promise.resolve({ status: 'SUCCESS' })
}

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: userMockData, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetOrganizationList: jest.fn().mockImplementation(() => {
    return { ...orgMockData, refetch: jest.fn(), error: null }
  }),
  useStartTrialLicense: jest.fn().mockImplementation(() => {
    return {
      loading: false,
      data: {
        status: 'SUCCESS',
        data: {}
      }
    }
  }),
  useStartFreeLicense: jest.fn().mockImplementation(() => {
    return {
      loading: false,
      data: {
        status: 'SUCCESS',
        data: {}
      }
    }
  }),
  usePostProject: jest.fn().mockImplementation(() => createMockData),
  useGetProjectAggregateDTOList: jest.fn().mockImplementation(args => {
    getProjectList(args)
    return { ...projectPageMock, refetch: jest.fn(), error: null }
  }),
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: deleteProjectMock })),
  usePutProject: jest.fn().mockImplementation(() => createMockData),
  useGetProject: jest.fn().mockImplementation(args => {
    getProject(args)
    return { ...projectMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetOrganization: jest.fn().mockImplementation(args => {
    getOrg(args)
    return { ...OrgMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetInvites: jest.fn().mockImplementation(() => ({ data: invitesMockData, loading: false, refetch: jest.fn() })),
  useAddUsers: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useDeleteInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useUpdateInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useResendVerifyEmail: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementation(() => {
        return {
          status: 'SUCCESS'
        }
      })
    }
  })
}))

jest.mock('@harnessio/react-ng-manager-client', () => ({
  useGetOrganizationsQuery: jest.fn().mockImplementation(args => {
    getOrg(args)
    return { ...OrgMockData, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => ({ data: roleMockData, loading: false, refetch: jest.fn() }))
}))

jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as Record<string, any>),
  useRouteParams: () => ({
    params: {
      accountId: 'testAcc'
    },
    query: {
      orgId: 'testOrg'
    }
  })
}))

const project = projectPageMock.data.data.content[0].projectResponse.project

describe('Project Page List', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path={routes.toProjects({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ProjectsListPage />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    getByTestId = renderObj.getByTestId
  })

  test('Create Project and Close', async () => {
    expect(container).toMatchSnapshot()
    await act(async () => {
      const newProject = getAllByText?.('projectsOrgs.newProject')[0]
      expect(newProject).toBeDefined()
      fireEvent.click(newProject!)
      await waitFor(() => queryAllByText(document.body, 'projectsOrgs.aboutProject')[0])
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      await act(async () => {
        fireEvent.click(form?.querySelector('[icon="cross"]')!)
      })
      form = findDialogContainer()
      expect(form).not.toBeTruthy()
    })
  }),
    test('Whole Modal Test', async () => {
      expect(container).toMatchSnapshot()
      const newProject = getAllByText?.('projectsOrgs.newProject')[0]
      expect(newProject).toBeDefined()
      fireEvent.click(newProject!)
      await waitFor(() => queryAllByText(document.body, 'projectsOrgs.aboutProject')[0])
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      fireEvent.change(form?.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })

      fireEvent.click(form?.querySelector('button[type="submit"]')!)
      await waitFor(() => queryAllByText(document.body, 'projectsOrgs.invite'))
      fireEvent.click(getByText(document.body, 'back')!)
      await waitFor(() => queryAllByText(document.body, 'projectsOrgs.projectEdit'))
      fireEvent.click(form?.querySelector('button[type="submit"]')!)
      await waitFor(() => queryAllByText(document.body, 'projectsOrgs.invite'))
      fireEvent.click(queryByText(document.body, 'saveAndContinue')!)
      await waitFor(() => queryAllByText(document.body, 'projectsOrgs.purposeList.name'))
      fireEvent.click(form?.querySelector('[icon="cross"]')!)
      form = findDialogContainer()
      fireEvent.click(form?.querySelector('[icon="small-cross"]')!)
      form = findDialogContainer()
      expect(form).not.toBeTruthy()
    }),
    test('Invite Collaborators', async () => {
      const menu = container
        .querySelector(`[data-testid="project-card-${project.identifier + project.orgIdentifier}"]`)
        ?.querySelector("[data-icon='more']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const invite = getByText(popover as HTMLElement, 'projectsOrgs.invite')
      await act(async () => {
        fireEvent.click(invite)
        await waitFor(() => getByText(document.body, 'projectsOrgs.invite'))
        let form = findDialogContainer()
        expect(form).toBeTruthy()
        fireEvent.click(form?.querySelector('[icon="cross"]')!)
        form = findDialogContainer()
        expect(form).not.toBeTruthy()
      })
    }),
    test('Delete Project From Menu', async () => {
      deleteProject.mockReset()
      const menu = container
        .querySelector(`[data-testid="project-card-${project.identifier + project.orgIdentifier}"]`)
        ?.querySelector("[data-icon='more']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const deleteMenu = getByText(popover as HTMLElement, 'delete')
      await act(async () => {
        fireEvent.click(deleteMenu!)
        await waitFor(() => getByText(document.body, 'projectCard.confirmDeleteTitle'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
        const deleteBtn = queryByText(form as HTMLElement, 'delete')
        fireEvent.click(deleteBtn!)
        expect(deleteProject).toBeCalled()
      })
    }),
    test('Edit Project', async () => {
      const menu = container
        .querySelector(`[data-testid="project-card-${project.identifier + project.orgIdentifier}"]`)
        ?.querySelector("[data-icon='more']")
      fireEvent.click(menu!)
      const edit = getByTestId('edit-project')
      await act(async () => {
        fireEvent.click(edit)
        await waitFor(() => queryAllByText(document.body, 'projectsOrgs.projectEdit'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
        fireEvent.click(form?.querySelector('button[type="submit"]')!)
      })
    }),
    test('Toggle between grid and list view', async () => {
      const list = container.querySelectorAll("[icon='list']")[0]
      const grid = container.querySelectorAll("[icon='grid-view']")[0]
      await act(async () => {
        fireEvent.click(list!)
        expect(container).toMatchSnapshot()
        fireEvent.click(grid!)
        expect(container).toMatchSnapshot()
      })
    }),
    test('Go to Project Details', async () => {
      const card = container.getElementsByClassName('colorBar')[0]
      await act(async () => {
        fireEvent.click(card)
      })
      await waitFor(() => getByTestId('location'))
      expect(
        getByTestId('location').innerHTML.endsWith(
          routes.toProjectDetails({
            accountId: 'testAcc',
            orgIdentifier: projectPageMock.data.data.content[0].projectResponse.project.orgIdentifier,
            projectIdentifier: projectPageMock.data.data.content[0].projectResponse.project.identifier
          })
        )
      ).toBeTruthy()
    })
})
