/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getAllByText, render, RenderResult, waitFor } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { orgPathProps } from '@common/utils/routeUtils'
import mockImport from 'framework/utils/mockImport'
import OrganizationDetailsPage from '../OrganizationDetails/OrganizationDetailsPage'
import {
  getOrgAggregateMockData as getOrgMockData,
  invitesMockData,
  response,
  roleMockData,
  userMockData
} from './OrganizationsMockData'

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: userMockData, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetOrganizationAggregateDTO: jest.fn().mockImplementation(() => {
    return { ...getOrgMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetSmtpConfig: jest.fn().mockImplementation(() => {
    return {
      loading: false,
      data: {
        status: 'SUCCESS',
        data: {}
      }
    }
  }),
  useGetInvites: jest.fn().mockImplementation(() => ({ data: invitesMockData, loading: false, refetch: jest.fn() })),
  useAddUsers: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useDeleteInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useUpdateInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) }))
}))

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => ({ data: roleMockData, loading: false, refetch: jest.fn() }))
}))

describe('Organization Details', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getByTestId: RenderResult['getByTestId']
  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path={routes.toOrganizationDetails({ ...orgPathProps })}
        pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg' }}
      >
        <OrganizationDetailsPage />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
    getByTestId = renderObj.getByTestId
  })
  test('Render', async () => {
    expect(container).toMatchSnapshot()
  })
  test('Manage Organizations', async () => {
    const back = getByText('orgsText')
    fireEvent.click(back)
    await waitFor(() => getByTestId('location'))
    expect(getByTestId('location').innerHTML.endsWith(routes.toOrganizations({ accountId: 'testAcc' }))).toBeTruthy()
  })

  // eslint-disable-next-line jest/no-disabled-tests,jest/expect-expect
  test.skip('Route Resources', async () => {
    const resources = getByText('resources')
    fireEvent.click(resources)
    await waitFor(() => getByTestId('location'))
    // expect(
    //   getByTestId('location').innerHTML.endsWith(
    //     routes.toResources({
    //       accountId: 'testAcc',
    //       orgIdentifier: getOrgMockData.data.data.organizationResponse.organization.identifier
    //     })
    //   )
    // ).toBeTruthy()
  })
  test('Click on Add Admin', async () => {
    const plus = getAllByText(container, '+')[0]
    await act(async () => {
      fireEvent.click(plus)
      await waitFor(() => getAllByText(document.body, 'projectsOrgs.invite')[0])
    })
    const form = findDialogContainer()
    expect(form).toBeTruthy()
  })
  test('Click on Add Collaborator', async () => {
    const plus = getAllByText(container, '+')[1]
    await act(async () => {
      fireEvent.click(plus)
      await waitFor(() => getAllByText(document.body, 'projectsOrgs.invite')[0])
    })
    const form = findDialogContainer()
    expect(form).toBeTruthy()
  })

  test('Governance should be visible', async () => {
    mockImport('@common/hooks/useFeatureFlag', {
      useFeatureFlags: () => ({ OPA_PIPELINE_GOVERNANCE: true })
    })

    render(
      <TestWrapper
        path={routes.toOrganizationDetails({ ...orgPathProps })}
        pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg' }}
      >
        <OrganizationDetailsPage />
      </TestWrapper>
    )

    expect(getByText('common.governance')).toBeTruthy()
  })

  test('Audit trail should be visible', async () => {
    mockImport('@common/hooks/useFeatureFlag', {
      useFeatureFlags: () => ({ AUDIT_TRAIL_WEB_INTERFACE: true })
    })

    render(
      <TestWrapper
        path={routes.toOrganizationDetails({ ...orgPathProps })}
        pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg' }}
      >
        <OrganizationDetailsPage />
      </TestWrapper>
    )

    expect(getByText('common.auditTrail')).toBeTruthy()
    expect(getByText('projectsOrgs.orgAccessCtrlAndAuditTrail')).toBeTruthy()
  })
})
