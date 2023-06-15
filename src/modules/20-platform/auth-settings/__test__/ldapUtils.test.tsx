/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import {
  RawLdapConnectionSettings,
  updateLDAPConnectionSettingsFormData
} from '../components/CreateUpdateLdapWizard/utils'

describe('ldapUtils', () => {
  test('updateLDAPConnectionSettingsFormData', () => {
    const values = {
      host: 'test.ldap.com',
      port: '380',
      maxReferralHops: '2',
      referralsEnabled: true,
      connectTimeout: '5000',
      responseTimeout: '7000',
      bindDN: 'uid=testBindDN',
      bindPassword: 'bindPwd'
    }
    const res = updateLDAPConnectionSettingsFormData(values as unknown as RawLdapConnectionSettings, 'testAccountId', 2)
    expect(res).toStrictEqual({
      host: 'test.ldap.com',
      port: 380,
      maxReferralHops: 2,
      referralsEnabled: true,
      connectTimeout: 5000,
      responseTimeout: 7000,
      bindDN: 'uid=testBindDN',
      bindPassword: 'bindPwd',
      sslEnabled: false,
      accountId: 'testAccountId',
      passwordType: 'INLINE'
    })
  })

  test('updateLDAPConnectionSettingsFormData', () => {
    const values = {
      host: 'test.ldap.com',
      port: '380',
      referralsEnabled: true,
      connectTimeout: '5000',
      responseTimeout: '7000',
      bindDN: 'uid=testBindDN',
      bindPassword: 'bindPwd',
      sslEnabled: true,
      bindSecret: 'secretRefValue'
    }
    const res = updateLDAPConnectionSettingsFormData(values as unknown as RawLdapConnectionSettings, 'testAccountId', 2)
    expect(res).toStrictEqual({
      host: 'test.ldap.com',
      port: 380,
      maxReferralHops: 2,
      referralsEnabled: true,
      connectTimeout: 5000,
      responseTimeout: 7000,
      bindDN: 'uid=testBindDN',
      bindPassword: 'bindPwd',
      sslEnabled: true,
      accountId: 'testAccountId',
      passwordType: 'INLINE'
    })
  })

  test('updateLDAPConnectionSettingsFormData', () => {
    const values = {
      host: 'test.ldap.com',
      port: '380',
      connectTimeout: '5000',
      responseTimeout: '7000',
      bindDN: 'uid=testBindDN',
      bindPassword: 'bindPwd',
      sslEnabled: true,
      bindSecret: 'secretRefValue',
      maxReferralHops: '1'
    }
    const res = updateLDAPConnectionSettingsFormData(values as unknown as RawLdapConnectionSettings, 'testAccountId', 2)
    expect(res).toStrictEqual({
      host: 'test.ldap.com',
      port: 380,
      connectTimeout: 5000,
      responseTimeout: 7000,
      bindDN: 'uid=testBindDN',
      bindPassword: 'bindPwd',
      sslEnabled: true,
      accountId: 'testAccountId',
      passwordType: 'INLINE'
    })
  })

  test('undefined values', () => {
    expect(updateLDAPConnectionSettingsFormData(undefined, 'testAccountId', 2)).toBeUndefined()
  })
})
