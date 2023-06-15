/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { WinRmConfigFormData } from '@secrets/modals/CreateWinRmCredModal/views/StepAuthentication'
import {
  KerberosWinRmConfigDTO,
  NTLMConfigDTO,
  TGTKeyTabFilePathSpecDTO,
  TGTPasswordSpecDTO,
  WinRmCredentialsSpecDTO,
  getSecretV2Promise,
  KerberosConfigDTO,
  SecretDTOV2
} from 'services/cd-ng'

import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'

function buildKerberosConfig(data: WinRmConfigFormData): KerberosWinRmConfigDTO {
  switch (data.tgtGenerationMethod) {
    case 'KeyTabFilePath':
      return {
        principal: data.principal,
        realm: data.realm,
        tgtGenerationMethod: data.tgtGenerationMethod,
        useSSL: data.useSSL,
        useNoProfile: data.useNoProfile,
        skipCertChecks: data.skipCertChecks,
        spec: {
          keyPath: data.keyPath
        } as TGTKeyTabFilePathSpecDTO
      } as KerberosWinRmConfigDTO
    case 'Password':
      return {
        principal: data.principal,
        realm: data.realm,
        tgtGenerationMethod: data.tgtGenerationMethod,
        useSSL: data.useSSL,
        useNoProfile: data.useNoProfile,
        skipCertChecks: data.skipCertChecks,
        spec: {
          password: data.password?.referenceString
        } as TGTPasswordSpecDTO
      } as KerberosWinRmConfigDTO
    default:
      return {
        principal: data.principal,
        realm: data.realm,
        useSSL: data.useSSL,
        useNoProfile: data.useNoProfile,
        skipCertChecks: data.skipCertChecks
      }
  }
}

export function buildAuthConfig(data: WinRmConfigFormData): NTLMConfigDTO | KerberosWinRmConfigDTO {
  switch (data.authScheme) {
    case 'NTLM':
      return {
        username: data.username,
        password: data.password?.referenceString,
        domain: data.domain,
        useNoProfile: data.useNoProfile,
        useSSL: data.useSSL,
        skipCertChecks: data.skipCertChecks
      } as NTLMConfigDTO
    case 'Kerberos':
      return buildKerberosConfig(data)
  }
}

export const getSecretReferencesForWinRm = async (
  secret: SecretDTOV2,
  pathParams: {
    accountIdentifier: string
    orgIdentifier?: string
    projectIdentifier?: string
  }
): Promise<{
  keySecret?: SecretReference
  passwordSecret?: SecretReference
  encryptedPassphraseSecret?: SecretReference
}> => {
  let password, passwordSecret
  const secretSpec = secret.spec as WinRmCredentialsSpecDTO
  const authScheme = secretSpec.auth.type
  if (authScheme === 'NTLM') {
    const ntlmConfig = secretSpec.auth.spec as NTLMConfigDTO
    password = ntlmConfig?.password
  } else if (authScheme === 'Kerberos') {
    const kerberosConfig = secretSpec.auth.spec as KerberosConfigDTO
    if (kerberosConfig.tgtGenerationMethod === 'Password') {
      password = kerberosConfig.spec?.password
    }
  }

  if (password) {
    const secretId = password.indexOf('.') < 0 ? password : password.split('.')[1]
    const data = await getSecretV2Promise({
      identifier: secretId,
      queryParams: pathParams
    })
    passwordSecret = {
      ...data.data?.secret,
      referenceString: password
    } as SecretReference
  }

  return {
    passwordSecret
  }
}
