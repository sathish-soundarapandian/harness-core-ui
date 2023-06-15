/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Scope } from '@common/interfaces/SecretsInterface'
import { getReference } from '@common/utils/utils'
import { getSSHDTOFromFormData, buildAuthConfig } from '../SSHAuthUtils'

describe('SSHAuthUtils', () => {
  test('getSSHDTOFromFormData for SSH', () => {
    const formData = {
      name: 'ssh1',
      description: 'desc',
      tags: {},
      identifier: 'ssh1',
      authScheme: 'SSH',
      credentialType: 'KeyReference',
      tgtGenerationMethod: 'None',
      userName: 'asd',
      port: 22,
      key: {
        name: 'nfile1',
        identifier: 'nfile1',
        referenceString: 'account.nfile1'
      },
      encryptedPassphrase: {
        identifier: 'text1',
        name: 'text1',
        referenceString: 'account.text1'
      }
    }
    const SSHDto = {
      type: 'SSHKey',
      name: 'ssh1',
      description: 'desc',
      identifier: 'ssh1',
      tags: {},
      spec: {
        port: 22,
        auth: {
          type: 'SSH',
          spec: {
            credentialType: 'KeyReference',
            spec: { userName: 'asd', key: 'account.nfile1', encryptedPassphrase: 'account.text1' }
          }
        }
      }
    }
    expect(getSSHDTOFromFormData(formData as any)).toEqual(SSHDto)

    const formData2 = {
      name: 'kerb7',
      description: '',
      tags: {},
      identifier: 'kerb7',
      authScheme: 'SSH',
      credentialType: 'KeyPath',
      tgtGenerationMethod: 'None',
      userName: 'asd',
      keyPath: 'asd',
      port: 22,
      encryptedPassphrase: {
        identifier: 'text1',
        name: 'text1',
        referenceString: 'account.text1'
      }
    }

    const SSHDto2 = {
      type: 'SSHKey',
      name: 'kerb7',
      description: '',
      identifier: 'kerb7',
      tags: {},
      spec: {
        port: 22,
        auth: {
          type: 'SSH',
          spec: {
            credentialType: 'KeyPath',
            spec: { userName: 'asd', keyPath: 'asd', encryptedPassphrase: 'account.text1' }
          }
        }
      }
    }

    expect(getSSHDTOFromFormData(formData2 as any)).toEqual(SSHDto2)

    const formData3 = {
      name: 'kerb7',
      description: '',
      tags: {},
      identifier: 'kerb7',
      authScheme: 'SSH',
      credentialType: 'Password',
      tgtGenerationMethod: 'None',
      userName: 'asd',
      port: 22,
      password: {
        identifier: 'text1',
        name: 'text1',
        referenceString: 'account.text1'
      }
    }

    const SSHDto3 = {
      type: 'SSHKey',
      name: 'kerb7',
      description: '',
      identifier: 'kerb7',
      tags: {},
      spec: {
        port: 22,
        auth: {
          type: 'SSH',
          spec: { credentialType: 'Password', spec: { userName: 'asd', password: 'account.text1' } }
        }
      }
    }

    expect(getSSHDTOFromFormData(formData3 as any)).toEqual(SSHDto3)
  })

  test('getSSHDTOFromFormData for Kerberos', () => {
    const formData1 = {
      name: 'kerb7',
      description: '',
      tags: {},
      identifier: 'kerb7',
      authScheme: 'Kerberos',
      tgtGenerationMethod: 'Password',
      principal: 'asd',
      realm: 'asd',
      port: 22,
      password: {
        identifier: 'text1',
        name: 'text1',
        referenceString: 'account.text1'
      }
    }

    const SSHDto1 = {
      type: 'SSHKey',
      name: 'kerb7',
      description: '',
      identifier: 'kerb7',
      tags: {},
      spec: {
        port: 22,
        auth: {
          type: 'Kerberos',
          spec: { principal: 'asd', realm: 'asd', tgtGenerationMethod: 'Password', spec: { password: 'account.text1' } }
        }
      }
    }

    expect(getSSHDTOFromFormData(formData1 as any)).toEqual(SSHDto1)

    const formData2 = {
      name: 'kerb7',
      description: '',
      tags: {},
      identifier: 'kerb7',
      authScheme: 'Kerberos',
      tgtGenerationMethod: 'KeyTabFilePath',
      principal: 'asd',
      realm: 'asd',
      keyPath: 'asd',
      port: 22
    }
    const sshdto2 = {
      type: 'SSHKey',
      name: 'kerb7',
      description: '',
      identifier: 'kerb7',
      tags: {},
      spec: {
        port: 22,
        auth: {
          type: 'Kerberos',
          spec: { principal: 'asd', realm: 'asd', tgtGenerationMethod: 'KeyTabFilePath', spec: { keyPath: 'asd' } }
        }
      }
    }
    expect(getSSHDTOFromFormData(formData2 as any)).toEqual(sshdto2)

    const formData3 = {
      name: 'kerb7',
      description: '',
      tags: {},
      identifier: 'kerb7',
      authScheme: 'Kerberos',
      tgtGenerationMethod: 'None',
      principal: 'asd',
      realm: 'asd',
      keyPath: 'asd',
      port: 22
    }

    const sshdto3 = {
      type: 'SSHKey',
      name: 'kerb7',
      description: '',
      identifier: 'kerb7',
      tags: {},
      spec: {
        port: 22,
        auth: { type: 'Kerberos', spec: { principal: 'asd', realm: 'asd', tgtGenerationMethod: 'None', spec: null } }
      }
    }
    expect(getSSHDTOFromFormData(formData3 as any)).toEqual(sshdto3)
  })

  test('getReference', () => {
    expect(getReference(Scope.ACCOUNT, 'id')).toEqual('account.id')
    expect(getReference(Scope.ORG, 'id')).toEqual('org.id')
    expect(getReference(Scope.PROJECT, 'id')).toEqual('id')
  })
})

describe('SSHAuthUtils > buildAuthConfig', () => {
  test('build config for ssh key', async () => {
    const config = await buildAuthConfig({
      authScheme: 'SSH',
      credentialType: 'KeyReference',
      tgtGenerationMethod: 'None',
      userName: 'asd',
      principal: '',
      realm: '',
      keyPath: '',
      port: 22,
      key: {
        name: 'nfile1',
        identifier: 'nfile1',
        referenceString: 'account.nfile1'
      },
      encryptedPassphrase: {
        name: 'text1',
        identifier: 'text1',
        referenceString: 'account.text1'
      }
    })

    expect(config).toEqual({
      credentialType: 'KeyReference',
      spec: { userName: 'asd', key: 'account.nfile1', encryptedPassphrase: 'account.text1' }
    })
  })

  test('build config for kerberos', async () => {
    const config = await buildAuthConfig({
      authScheme: 'Kerberos',
      credentialType: 'KeyReference',
      tgtGenerationMethod: 'KeyTabFilePath',
      userName: 'asd',
      principal: 'asd',
      realm: 'asd',
      keyPath: 'asd',
      port: 22
    })
    expect(config).toEqual({
      principal: 'asd',
      realm: 'asd',
      tgtGenerationMethod: 'KeyTabFilePath',
      spec: { keyPath: 'asd' }
    })
  })
})
