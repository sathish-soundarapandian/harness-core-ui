/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { ValueType } from '@secrets/components/TextReference/TextReference'
import type { SCMData } from '@user-profile/modals/SourceCodeManager/views/SourceCodeManagerForm'
import type { SourceCodeManagerAuthentication, SourceCodeManagerDTO } from 'services/cd-ng'
import { setSecretField } from '@secrets/utils/SecretField'

export enum ConnectionType {
  HTTPS = 'HTTPS',
  HTTP = 'Http',
  SSH = 'Ssh'
}

export enum AuthTypes {
  USERNAME_PASSWORD = 'UsernamePassword',
  USERNAME_TOKEN = 'UsernameToken',
  KERBEROS = 'Kerberos',
  SSH_KEY = 'SSH_KEY',
  AWSCredentials = 'AWSCredentials'
}

export interface SourceCodeType {
  text: string
  value: SourceCodeTypes
  icon: IconName
}

export enum SourceCodeTypes {
  BITBUCKET = 'BITBUCKET',
  GITHUB = 'GITHUB',
  GITLAB = 'GITLAB',
  AZURE_REPO = 'AZURE_REPO',
  AWS_CODE_COMMIT = 'AWS_CODE_COMMIT'
}

export const selectedValueToTypeMap: Record<SourceCodeTypes, SourceCodeTypes> = {
  [SourceCodeTypes.BITBUCKET]: SourceCodeTypes.BITBUCKET,
  [SourceCodeTypes.GITHUB]: SourceCodeTypes.GITHUB,
  [SourceCodeTypes.GITLAB]: SourceCodeTypes.GITLAB,
  [SourceCodeTypes.AWS_CODE_COMMIT]: SourceCodeTypes.AWS_CODE_COMMIT,
  [SourceCodeTypes.AZURE_REPO]: SourceCodeTypes.AZURE_REPO
}

export const getIconBySCM = (item: SourceCodeTypes): IconName => {
  switch (item) {
    case SourceCodeTypes.BITBUCKET:
      return 'bitbucket-blue'
    case SourceCodeTypes.GITHUB:
      return 'github'
    case SourceCodeTypes.GITLAB:
      return 'service-gotlab'
    case SourceCodeTypes.AWS_CODE_COMMIT:
      return 'service-aws-code-deploy'
    case SourceCodeTypes.AZURE_REPO:
      return 'service-azure'
    default:
      return 'bitbucket'
  }
}

export const getAuthentication = (values: SCMData): SourceCodeManagerAuthentication | undefined => {
  switch (values.authType) {
    case AuthTypes.USERNAME_PASSWORD:
      return {
        type: ConnectionType.HTTP,
        spec: {
          type: AuthTypes.USERNAME_PASSWORD,
          spec: {
            ...(values.username?.type === ValueType.TEXT
              ? { username: values.username.value }
              : { usernameRef: values.username?.value }),
            passwordRef: values.password?.referenceString
          }
        }
      }
    case AuthTypes.USERNAME_TOKEN:
      return {
        type: ConnectionType.HTTP,
        spec: {
          type: AuthTypes.USERNAME_TOKEN,
          spec: {
            ...(values.username?.type === ValueType.TEXT
              ? { username: values.username.value }
              : { usernameRef: values.username?.value }),
            tokenRef: values.accessToken?.referenceString
          }
        }
      }
    default:
      return undefined
  }
}

const getBitBucketFormData = async (
  sourceCodeManagerData: SourceCodeManagerDTO,
  accountIdentifier: string
): Promise<SCMData> => {
  const { name, authentication } = sourceCodeManagerData
  return {
    name: name,
    authType: authentication?.spec?.type,
    password: (await setSecretField(authentication?.spec?.spec?.passwordRef, {
      accountIdentifier
    })) as SCMData['password'],
    username: {
      value: authentication?.spec?.spec?.username || authentication?.spec?.spec?.usernameRef,
      type: authentication?.spec?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
    }
  }
}

const getGithubFormData = async (
  sourceCodeManagerData: SourceCodeManagerDTO,
  accountIdentifier: string
): Promise<SCMData> => {
  const { name, authentication } = sourceCodeManagerData
  return {
    name: name,
    authType: authentication?.spec?.type,
    accessToken: (await setSecretField(
      authentication?.spec?.spec?.tokenRef || authentication?.spec?.apiAccess?.spec?.tokenRef,
      { accountIdentifier }
    )) as SCMData['accessToken'],
    username: {
      value: authentication?.spec?.spec?.username || authentication?.spec?.spec?.usernameRef,
      type: authentication?.spec?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
    }
  }
}

export const getFormDataBasedOnSCMType = (
  sourceCodeManagerData: SourceCodeManagerDTO,
  accountIdentifier: string
): Promise<SCMData | undefined> => {
  switch (sourceCodeManagerData.type) {
    case SourceCodeTypes.BITBUCKET:
      return getBitBucketFormData(sourceCodeManagerData, accountIdentifier)
    case SourceCodeTypes.GITHUB:
      return getGithubFormData(sourceCodeManagerData, accountIdentifier)
    default:
      return Promise.resolve(undefined)
  }
}

export const getDefaultSCMType = (
  supportedSCMS: SourceCodeType[],
  currentSCM?: SourceCodeManagerDTO['type']
): SourceCodeType => {
  return supportedSCMS.find(item => item.value === currentSCM) || supportedSCMS[0]
}

export const getDefaultSelected = (type?: SourceCodeTypes): AuthTypes | undefined => {
  switch (type) {
    case SourceCodeTypes.GITHUB:
      return AuthTypes.USERNAME_TOKEN
    case SourceCodeTypes.BITBUCKET:
    case SourceCodeTypes.GITLAB:
    case SourceCodeTypes.AZURE_REPO:
      return AuthTypes.USERNAME_PASSWORD
    case SourceCodeTypes.AWS_CODE_COMMIT:
      return AuthTypes.AWSCredentials
    default:
      return undefined
  }
}
