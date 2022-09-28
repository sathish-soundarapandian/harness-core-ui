/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { buildAuthConfig } from '@secrets/utils/WinRmAuthUtils'

describe('WinRmAuthUtils > buildAuthConfig', () => {
  test('build config for kerberos with keypath', async () => {
    const config = await buildAuthConfig({
      authScheme: 'Kerberos',
      tgtGenerationMethod: 'KeyTabFilePath',
      username: 'asd',
      principal: 'asd',
      domain: 'asd',
      useSSL: false,
      useNoProfile: false,
      skipCertChecks: false,
      realm: 'asd',
      keyPath: 'asd',
      port: 22
    })
    expect(config).toEqual({
      principal: 'asd',
      realm: 'asd',
      tgtGenerationMethod: 'KeyTabFilePath',
      spec: { keyPath: 'asd' },
      skipCertChecks: false,
      useNoProfile: false,
      useSSL: false
    })
  })

  test('build config for kerberos with password', async () => {
    const config = await buildAuthConfig({
      authScheme: 'Kerberos',
      tgtGenerationMethod: 'Password',
      username: 'asd',
      principal: 'asd',
      domain: 'asd',
      useSSL: false,
      useNoProfile: false,
      skipCertChecks: false,
      realm: 'asd',
      password: {
        name: '',
        identifier: '',
        referenceString: 'asd'
      },
      keyPath: '',
      port: 22
    })
    expect(config).toEqual({
      principal: 'asd',
      realm: 'asd',
      tgtGenerationMethod: 'Password',
      spec: { password: 'asd' },
      skipCertChecks: false,
      useNoProfile: false,
      useSSL: false
    })
  })

  test('build config for NTLM', async () => {
    const config = await buildAuthConfig({
      authScheme: 'NTLM',
      tgtGenerationMethod: 'Password',
      username: 'asd',
      principal: 'asd',
      domain: 'asd',
      useSSL: false,
      useNoProfile: false,
      skipCertChecks: false,
      realm: 'asd',
      password: {
        name: '',
        identifier: '',
        referenceString: 'asd'
      },
      keyPath: '',
      port: 22
    })
    expect(config).toEqual({
      username: 'asd',
      password: 'asd',
      domain: 'asd',
      skipCertChecks: false,
      useNoProfile: false,
      useSSL: false
    })
  })

  test('build config for Kerberos default auth scheme', async () => {
    const config = await buildAuthConfig({
      authScheme: 'Kerberos',
      username: 'asd',
      principal: 'asd',
      domain: 'asd',
      useSSL: false,
      useNoProfile: false,
      skipCertChecks: false,
      realm: 'asd',
      password: {
        name: '',
        identifier: '',
        referenceString: 'asd'
      },
      keyPath: '',
      port: 22
    })
    expect(config).toEqual({
      principal: 'asd',
      realm: 'asd',
      skipCertChecks: false,
      useNoProfile: false,
      useSSL: false
    })
  })
})
