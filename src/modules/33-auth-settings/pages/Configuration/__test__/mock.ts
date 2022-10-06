/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { RestResponseBoolean, LoginSettings } from 'services/cd-ng'
import { InputTypes } from '@common/utils/JestFormHelper'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { AuthenticationMechanisms } from '@rbac/utils/utils'

export const mockResponse: RestResponseBoolean = {
  metaData: {},
  resource: true,
  responseMessages: []
}

export const mockAuthSettingsResponse = {
  metaData: {},
  resource: {
    ngAuthSettings: [
      {
        origin: 'login.microsoftonline.com',
        identifier: '58_yNTnmRPCYWl0H-wnn8A',
        logoutUrl: null,
        groupMembershipAttr: null,
        displayName: 'SAML002',
        authorizationEnabled: false,
        entityIdentifier: null,
        samlProviderType: 'AZURE',
        clientId: null,
        clientSecret: null,
        settingsType: 'SAML'
      },
      {
        connectionSettings: {
          host: 'ldap.jumpcloud.com',
          port: 389,
          sslEnabled: false,
          referralsEnabled: true,
          maxReferralHops: 5,
          bindDN: 'uid=ldap_user1,ou=Users,o=611a119873e7186e37f75599,dc=jumpcloud,dc=com',
          bindPassword: '*****',
          passwordType: 'INLINE',
          bindSecret: null,
          connectTimeout: 80000,
          responseTimeout: 8000,
          useRecursiveGroupMembershipSearch: false,
          accountId: null,
          settingType: 'LDAP'
        },
        identifier: 'vBnRLowtTCKHdAFA-22_fg',
        userSettingsList: [
          {
            baseDN: 'ou=Users,o=611a119873e7186e37f75599,dc=jumpcloud,dc=com',
            searchFilter: '(objectClass=inetOrgPerson)',
            uidAttr: 'uid',
            samAccountNameAttr: 'sAMAccountName',
            emailAttr: 'mail',
            displayNameAttr: 'cn',
            groupMembershipAttr: 'memberOf'
          }
        ],
        groupSettingsList: [
          {
            baseDN: 'ou=Users,o=611a119873e7186e37f75599,dc=jumpcloud,dc=com',
            searchFilter: '(objectClass=groupOfNames)',
            nameAttr: 'cn',
            descriptionAttr: 'description',
            userMembershipAttr: 'member',
            referencedUserAttr: 'dn'
          }
        ],
        displayName: 'ldap11223355',
        cronExpression: '0 0/15 * 1/1 * ? *',
        nextIterations: [
          1661413500000, 1661414400000, 1661415300000, 1661416200000, 1661417100000, 1661418000000, 1661418900000,
          1661419800000
        ],
        settingsType: 'LDAP'
      },
      {
        filter: null,
        allowedProviders: ['LINKEDIN', 'GITHUB', 'AZURE', 'GOOGLE', 'GITLAB', 'BITBUCKET'],
        settingsType: 'OAUTH'
      },
      {
        loginSettings: {
          uuid: 'KM3A-8vETmCI7nV7j5jzDg',
          accountId: 'mGS7wFvWQ3mVLkTxCyYtVQ',
          lastUpdatedBy: null,
          lastUpdatedAt: 1632562527975,
          userLockoutPolicy: {
            enableLockoutPolicy: false,
            numberOfFailedAttemptsBeforeLockout: 5,
            lockOutPeriod: 24,
            notifyUser: true,
            userGroupsToNotify: null
          },
          passwordExpirationPolicy: {
            enabled: false,
            daysBeforePasswordExpires: 90,
            daysBeforeUserNotifiedOfPasswordExpiration: 5
          },
          passwordStrengthPolicy: {
            enabled: false,
            minNumberOfCharacters: 8,
            minNumberOfUppercaseCharacters: 0,
            minNumberOfLowercaseCharacters: 0,
            minNumberOfSpecialCharacters: 0,
            minNumberOfDigits: 0
          }
        },
        settingsType: 'USER_PASSWORD'
      }
    ],
    whitelistedDomains: [],
    authenticationMechanism: 'USER_PASSWORD',
    twoFactorEnabled: false
  },
  responseMessages: []
}

export const loginSettings: LoginSettings = {
  uuid: '123',
  accountId: '123',
  lastUpdatedAt: 1617864012452,
  userLockoutPolicy: {
    enableLockoutPolicy: true,
    numberOfFailedAttemptsBeforeLockout: 6,
    lockOutPeriod: 24,
    notifyUser: true
  },
  passwordExpirationPolicy: {
    enabled: true,
    daysBeforePasswordExpires: 30,
    daysBeforeUserNotifiedOfPasswordExpiration: 3
  },
  passwordStrengthPolicy: {
    enabled: true,
    minNumberOfCharacters: 12,
    minNumberOfUppercaseCharacters: 1,
    minNumberOfLowercaseCharacters: 1,
    minNumberOfSpecialCharacters: 1,
    minNumberOfDigits: 1
  }
}

export const authSettings = {
  ngAuthSettings: [
    {
      loginSettings,
      settingsType: AuthenticationMechanisms.USER_PASSWORD
    },
    {
      allowedProviders: ['GITHUB', 'AZURE', 'LINKEDIN', 'BITBUCKET', 'GOOGLE'],
      settingsType: AuthenticationMechanisms.OAUTH
    }
  ],
  whitelistedDomains: [],
  authenticationMechanism: AuthenticationMechanisms.USER_PASSWORD,
  twoFactorEnabled: false
}

export const permissionRequest = {
  resourceScope: {
    accountIdentifier: 'accountId'
  },
  resource: {
    resourceType: ResourceType.AUTHSETTING
  }
}

export const getConnectionFormFieldValues = (wizardDialog: HTMLElement) => [
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'host',
    value: 'test.ldap.com'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'port',
    value: '380'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'maxReferralHops',
    value: '2'
  },
  {
    container: wizardDialog,
    fieldId: 'referralsEnabled',
    type: InputTypes.CHECKBOX,
    value: true
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'connectTimeout',
    value: '5000'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'responseTimeout',
    value: '7000'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'bindDN',
    value: 'uid=testBindDN'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'bindPassword',
    value: 'testPwd'
  }
]

export const getUserQueryFormFieldValues = (wizardDialog: HTMLElement) => [
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'baseDN',
    value: 'ou=Users,o=611a119873e7186e37f75599,dc=jumpcloud,dc=com'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'searchFilter',
    value: '(objectClass=inetOrgPerson)'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'displayNameAttr',
    value: 'cn'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'emailAttr',
    value: 'mail'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'groupMembershipAttr',
    value: 'memberOf'
  }
]

export const getGroupQueryFormFieldValues = (wizardDialog: HTMLElement) => [
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'baseDN',
    value: 'ou=Users,o=611a119873e7186e37f75599,dc=jumpcloud,dc=com'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'searchFilter',
    value: '(objectClass=inetOrgPerson)'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'nameAttr',
    value: 'mail'
  },
  {
    container: wizardDialog,
    type: InputTypes.TEXTFIELD,
    fieldId: 'descriptionAttr',
    value: 'description'
  }
]
