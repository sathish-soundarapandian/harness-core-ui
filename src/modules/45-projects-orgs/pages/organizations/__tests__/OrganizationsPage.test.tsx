/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  fireEvent,
  getByText,
  queryByText,
  render,
  RenderResult,
  waitFor,
  findAllByText,
  queryAllByText
} from '@testing-library/react'

import { act } from 'react-dom/test-utils'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { clickBack, clickSubmit, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import {
  orgMockData,
  getOrgMockData,
  createOrgMockData,
  getOrganizationAggregateDTOListMockData,
  roleMockData,
  invitesMockData,
  response,
  userMockData
} from './OrganizationsMockData'
import OrganizationsPage from '../OrganizationsPage'

const getOrganizationList = jest.fn()
const deleteOrganization = jest.fn()
const getOrg = jest.fn()
const editOrg = jest.fn()
const deleteOrganizationMock = (): Promise<{ status: string }> => {
  deleteOrganization()
  return Promise.resolve({ status: 'SUCCESS' })
}
jest.mock('services/cd-ng', () => ({
  usePostOrganization: jest.fn().mockImplementation(() => createOrgMockData),
  usePutOrganization: jest.fn().mockImplementation(args => {
    editOrg(args)
    return createOrgMockData
  }),
  useGetOrganizationList: jest.fn().mockImplementation(args => {
    getOrganizationList(args)
    return { ...orgMockData, refetch: jest.fn(), error: null }
  }),
  useDeleteOrganization: jest.fn().mockImplementation(() => ({ mutate: deleteOrganizationMock })),

  useGetOrganization: jest.fn().mockImplementation(args => {
    getOrg(args)
    return { ...getOrgMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetOrganizationAggregateDTOList: jest.fn().mockImplementation(() => {
    return { ...getOrganizationAggregateDTOListMockData, refetch: jest.fn(), error: null }
  }),
  useGetCurrentGenUsers: jest
    .fn()
    .mockImplementation(() => ({ data: userMockData, loading: false, refetch: jest.fn() })),
  useGetInvites: jest.fn().mockImplementation(() => ({ data: invitesMockData, loading: false, refetch: jest.fn() })),
  useAddUsers: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useDeleteInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useUpdateInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) }))
}))

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => ({ data: roleMockData, loading: false, refetch: jest.fn() }))
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: userMockData, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.useFakeTimers()

const organization = getOrganizationAggregateDTOListMockData.data.data.content[0].organizationResponse.organization

describe('Org Page List', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path={routes.toOrganizations({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <OrganizationsPage />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
  })

  test('Create New Org', async () => {
    expect(container).toMatchSnapshot()
    const newOrg = getAllByText?.('projectsOrgs.newOrganization')[0]
    await act(async () => {
      if (newOrg) fireEvent.click(newOrg)
      await waitFor(() => findAllByText(document.body, 'projectsOrgs.aboutTitle'))
    })
    let form = findDialogContainer()
    expect(form).toBeTruthy()
    setFieldValue({ container: form as HTMLElement, type: InputTypes.TEXTFIELD, fieldId: 'name', value: 'dummyorg' })
    await act(async () => {
      clickSubmit(form as HTMLElement)
      await waitFor(() => queryAllByText(document.body, 'projectsOrgs.invite'))
    })
    await act(async () => {
      clickBack(form as HTMLElement)
      await waitFor(() => queryAllByText(document.body, 'projectsOrgs.editTitle'))
    })
    await act(async () => {
      fireEvent.click(form?.querySelector('[icon="cross"]')!)
    })
    form = findDialogContainer()
    expect(form).not.toBeTruthy()
  }),
    test('Delete Organization From Menu', async () => {
      deleteOrganization.mockReset()
      const menu = container
        .querySelector(`[data-testid="org-card-${organization.identifier}"]`)
        ?.querySelector("[data-icon='more']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const deleteMenu = getByText(popover as HTMLElement, 'delete')
      await act(async () => {
        fireEvent.click(deleteMenu!)
        await waitFor(() => getByText(document.body, 'projectsOrgs.confirmDeleteTitle'))
      })
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const chckBox = queryByText(form as HTMLElement, 'projectsOrgs.yesIamSure')
      act(() => {
        fireEvent.click(chckBox!)
      })

      await waitFor(() => expect(queryByText(form as HTMLElement, 'delete')).not.toBeDisabled())
      const deleteBtn = queryByText(form as HTMLElement, 'delete')
      act(() => {
        fireEvent.click(deleteBtn!)
      })

      await waitFor(() => expect(deleteOrganization).toBeCalled())
      expect(deleteOrganization).toBeCalled()
    }),
    test('Edit Organization', async () => {
      const menu = container
        .querySelector(`[data-testid="org-card-${organization.identifier}"]`)
        ?.querySelector("[data-icon='more']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const edit = queryAllByText(popover as HTMLElement, 'edit')
      await act(async () => {
        fireEvent.click(edit[0])
        await waitFor(() => getByText(document.body, 'projectsOrgs.editTitle'))
      })
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      await act(async () => {
        fireEvent.click(form?.querySelector('button[type="submit"]')!)
      })
      expect(editOrg).toHaveBeenCalled()
    }),
    test('Invite Collaborators', async () => {
      const menu = container
        .querySelector(`[data-testid="org-card-${organization.identifier}"]`)
        ?.querySelector("[data-icon='more']")
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const invite = getByText(popover as HTMLElement, 'projectsOrgs.invite')
      await act(async () => {
        fireEvent.click(invite)
        await waitFor(() => getByText(document.body, 'projectsOrgs.invite'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
      })
      await act(async () => {
        let form = findDialogContainer()
        fireEvent.click(form?.querySelector('[icon="cross"]')!)
        form = findDialogContainer()
        expect(form).not.toBeTruthy
      })
    })
})
