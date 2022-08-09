/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import type { UserGroupDTO } from 'services/cd-ng'
import LinkToSSOProviderForm from '../views/LinkToSSOProviderForm'
import UnlinkSSOProviderForm from '../views/UnlinkSSOProviderForm'

const TEST_PATH = routes.toUserGroups({
  ...accountPathProps
})

const mockAuthResponse = {
  status: 'SUCCESS',
  resource: {
    ngAuthSettings: [
      {
        settingsType: 'SAML',
        origin: 'mock_origin',
        identifier: 'mock_id',
        logoutUrl: undefined,
        groupMembershipAttr: undefined,
        displayName: 'mock_sso_name',
        authorizationEnabled: undefined
      },
      {
        settingsType: 'LDAP',
        connectionSettings: {},
        identifier: 'mock_id',
        userSettingsList: [],
        groupSettingsList: [],
        displayName: 'mock_ldap_name',
        cronExpression: 'mock_cron_expr',
        nextIterations: []
      }
    ]
  },
  metaData: {},
  correlationId: ''
}

const mockSuccessResponse = {
  status: 'SUCCESS',
  data: {},
  metaData: {},
  correlationId: ''
}

const useUnlinkSsoGroup = jest.fn()
jest.mock('services/cd-ng', () => ({
  useGetAuthenticationSettings: jest.fn().mockImplementation(() => {
    return { data: mockAuthResponse, loading: false, refetch: jest.fn().mockReturnValue(mockAuthResponse), error: null }
  }),
  useLinkToSamlGroup: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockSuccessResponse) }
  }),
  useLinkToLdapGroup: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockSuccessResponse) }
  }),
  useUnlinkSsoGroup: jest.fn().mockImplementation(() => {
    return { mutate: () => useUnlinkSsoGroup }
  })
}))

const TEST_ID = 'TEST_ID'

const mockUserGroup: UserGroupDTO = {
  accountIdentifier: 'MOCK_ACC_ID',
  identifier: 'MOCK_USER_GROUP_ID',
  name: 'MOCK_GROUP_NAME',
  users: ['MOCK_USER'],
  notificationConfigs: [],
  description: '',
  tags: {},
  ssoLinked: true,
  linkedSsoId: 'MOCK_LINK_ID',
  linkedSsoDisplayName: 'MOCK_SSO_NAME',
  ssoGroupId: 'MOCK_SSO_GROUP_ID',
  ssoGroupName: 'MOCK_GROUP_NAME'
}

describe('Create LinkToSSOProviderModal', () => {
  test('should render UnlinkToSSOProviderModalForm', async () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={{ accountId: TEST_ID }}>
        <UnlinkSSOProviderForm onSubmit={noop} userGroupData={mockUserGroup} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render the form with ssoLinked false', async () => {
    mockUserGroup.ssoLinked = false
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={{ accountId: TEST_ID }}>
        <LinkToSSOProviderForm onSubmit={noop} userGroupData={mockUserGroup} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render the form with ssoLinked true', async () => {
    mockUserGroup.ssoLinked = true
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={{ accountId: TEST_ID }}>
        <LinkToSSOProviderForm onSubmit={noop} userGroupData={mockUserGroup} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
