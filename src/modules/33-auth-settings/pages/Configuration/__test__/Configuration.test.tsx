/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Configuration from '@auth-settings/pages/Configuration/Configuration'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { mockAuthSettingsResponse, mockResponse } from '@auth-settings/pages/Configuration/__test__/mock'

const syncLdapGroupsMock = jest.fn()
jest.mock('services/cd-ng', () => ({
  useGetAuthenticationSettings: jest.fn().mockImplementation(() => {
    return { data: mockAuthSettingsResponse, refetch: Promise.resolve(mockAuthSettingsResponse) }
  }),
  useUpdateAuthMechanism: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  usePutLoginSettings: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useSetTwoFactorAuthAtAccountLevel: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useUpdateOauthProviders: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useGetSamlLoginTest: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  usePostLdapAuthenticationTest: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useUpdateWhitelistedDomains: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useRemoveOauthMechanism: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useDeleteSamlMetaData: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useDeleteLdapSettings: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  syncLdapGroupsPromise: jest.fn().mockImplementation(() => {
    return syncLdapGroupsMock()
  })
}))

describe('Configuration', () => {
  test('Configuration page', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
        defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}
      >
        <Configuration />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
