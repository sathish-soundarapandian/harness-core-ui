/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createFormData, getSelectedSAMLProvider, Providers } from '../utils'

describe('utils tests', () => {
  test('create form data with required values', () => {
    const formData = createFormData({
      displayName: 'test',
      authorizationEnabled: false,
      groupMembershipAttr: 'testgroup',
      entityIdEnabled: false,
      entityIdentifier: 'testEntityIdentifier',
      enableClientIdAndSecret: false
    })
    const obj = {}

    formData.forEach(function (value, key) {
      // eslint-disable-next-line
      // @ts-ignore
      obj[key] = value
    })

    expect(JSON.stringify(obj)).toEqual(
      '{"displayName":"test","authorizationEnabled":"false","groupMembershipAttr":"testgroup","ssoSetupType":"SAML"}'
    )
  })

  test('create form data with all the values', () => {
    const formData = createFormData({
      displayName: 'test',
      friendlySamlName: 'friendlyNametest',
      authorizationEnabled: false,
      groupMembershipAttr: 'testgroup',
      entityIdEnabled: false,
      entityIdentifier: 'testEntityIdentifier',
      logoutUrl: 'http://testurl.com',
      clientSecret: 'testClientSecret',
      clientId: 'testClientId',
      samlProviderType: Providers.AZURE,
      enableClientIdAndSecret: false
    })
    const obj = {}

    formData.forEach(function (value, key) {
      // eslint-disable-next-line
      // @ts-ignore
      obj[key] = value
    })

    expect(JSON.stringify(obj)).toEqual(
      '{"displayName":"test","authorizationEnabled":"false","groupMembershipAttr":"testgroup","ssoSetupType":"SAML","friendlySamlName":"friendlyNametest","logoutUrl":"http://testurl.com","samlProviderType":"AZURE"}'
    )
  })

  test('test with enableenableClientIdAndSecret', () => {
    const formData = createFormData({
      displayName: 'test',
      friendlySamlName: 'friendlyNametest',
      authorizationEnabled: true,
      groupMembershipAttr: 'testgroup',
      entityIdEnabled: true,
      entityIdentifier: 'testEntityIdentifier',
      logoutUrl: 'http://testurl.com',
      clientSecret: 'testClientSecret',
      clientId: 'testClientId',
      samlProviderType: Providers.AZURE,
      enableClientIdAndSecret: true,
      // eslint-disable-next-line
      // @ts-ignore
      files: ['testfile']
    })
    const obj = {}

    formData.forEach(function (value, key) {
      // eslint-disable-next-line
      // @ts-ignore
      obj[key] = value
    })

    expect(JSON.stringify(obj)).toEqual(
      '{"displayName":"test","authorizationEnabled":"true","groupMembershipAttr":"testgroup","ssoSetupType":"SAML","friendlySamlName":"friendlyNametest","logoutUrl":"http://testurl.com","samlProviderType":"AZURE","clientId":"testClientId","clientSecret":"testClientSecret","entityIdentifier":"testEntityIdentifier","file":"testfile"}'
    )
  })

  test('test getSelectedSamlProvider', () => {
    const getString = jest.fn()
    const selectedSamlProvider = getSelectedSAMLProvider(
      { value: Providers.AZURE, label: 'test', icon: 'warning-icon' },
      getString
    )
    expect(selectedSamlProvider).toEqual('test')
  })

  test('test getSelectedSamlProvider with undefned', () => {
    const getString = jest.fn()
    getSelectedSAMLProvider(undefined, getString)
    expect(getString).toBeCalledWith('authSettings.SAMLProvider')
  })
})
