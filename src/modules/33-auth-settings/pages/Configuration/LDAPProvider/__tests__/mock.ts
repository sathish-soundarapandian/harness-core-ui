/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ResourceType } from '@rbac/interfaces/ResourceType'
import { AuthenticationMechanisms } from '@rbac/utils/utils'

export const mockAuthSettingsResponse = {
  ngAuthSettings: [
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
    }
  ],
  authenticationMechanism: AuthenticationMechanisms.LDAP
}

export const mockAuthSettingsResponseWithoutLdap = {
  ngAuthSettings: [],
  authenticationMechanism: AuthenticationMechanisms.LDAP
}

export const permissionRequest = {
  resourceScope: {
    accountIdentifier: 'accountId'
  },
  resource: {
    resourceType: ResourceType.AUTHSETTING
  }
}

export const successTestConnectionSettingsResponse = {
  metaData: {},
  resource: { status: 'SUCCESS', message: 'Connection successful.' },
  responseMessages: []
}

export const errorTestConnectionSettingsResponse = {
  status: 'ERROR',
  code: 'GENERAL_ERROR',
  message: 'Failed to fetch',
  correlationId: '7bed084a-5916-4ed5-8480-654d3cab284e',
  detailedMessage: null,
  responseMessages: [
    { code: 'GENERAL_ERROR', level: 'ERROR', message: '${message}', exception: null, failureTypes: [] }
  ],
  metadata: null
}

export const testQuerySuccessResponse = {
  metaData: {},
  resource: { status: 'SUCCESS', message: 'Query successful.' },
  responseMessages: []
}

export const testQuerySuccessFailure = {
  metaData: {},
  resource: { status: 'FAILURE', message: 'Query failed.' },
  responseMessages: []
}
