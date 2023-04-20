/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Callout } from '@blueprintjs/core'
import { Page } from '@common/exports'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { useGetAuthenticationSettings } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import AccountAndOAuth from '@auth-settings/pages/Configuration/AccountAndOAuth/AccountAndOAuth'
import SAMLProvider from '@auth-settings/pages/Configuration/SAMLProvider/SAMLProvider'
import RestrictEmailDomains from '@auth-settings/pages/Configuration/RestrictEmailDomains/RestrictEmailDomains'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import SAMLProviderV2 from '@auth-settings/pages/Configuration/SAMLProvider/SAMLProviderV2'
import LDAPProvider from './LDAPProvider/LDAPProvider'
import SessionTimeOut from './SessionTimeOut/SessionTimeOut'
import css from './Configuration.module.scss'

export interface PermissionRequest {
  resourceScope: {
    accountIdentifier: string
  }
  resource: {
    resourceType: ResourceType
  }
}

const Configuration: React.FC = () => {
  const params = useParams<AccountPathProps>()
  const { accountId } = params
  const { getString } = useStrings()
  const { PL_ENABLE_MULTIPLE_IDP_SUPPORT } = useFeatureFlags()
  const [updating, setUpdating] = React.useState(false)

  const permissionRequest = {
    resourceScope: {
      accountIdentifier: accountId
    },
    resource: {
      resourceType: ResourceType.AUTHSETTING
    }
  }

  const [canEdit] = usePermission(
    {
      ...permissionRequest,
      permissions: [PermissionIdentifier.EDIT_AUTHSETTING]
    },
    []
  )

  const {
    data: apiResponse,
    loading: fetchingAuthSettings,
    error: errorWhileFetchingAuthSettings,
    refetch: refetchAuthSettings
  } = useGetAuthenticationSettings({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const data = {
    metaData: {},
    resource: {
      ngAuthSettings: [
        {
          origin: 'dev-274703.oktapreview.com',
          identifier: 'UOPlyeTeSYaFk7gb0I54Vw',
          logoutUrl: null,
          groupMembershipAttr: null,
          displayName: 'okta_saml_01',
          authorizationEnabled: false,
          entityIdentifier: null,
          samlProviderType: 'OKTA',
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
            connectTimeout: 50000,
            responseTimeout: 50000,
            useRecursiveGroupMembershipSearch: true,
            settingType: 'LDAP',
            accountId: null
          },
          identifier: 'm3pw7MbcRQ6JYg1xAWANcw',
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
          groupSettingsList: null,
          displayName: 'test_ldap',
          cronExpression: '0 0/15 * 1/1 * ? *',
          nextIterations: [1681888500000, 1681889400000, 1681890300000, 1681891200000, 1681892100000],
          disabled: false,
          settingsType: 'LDAP'
        },
        {
          loginSettings: {
            uuid: 'KM3A-8vETmCI7nV7j5jzDg',
            accountId: 'mGS7wFvWQ3mVLkTxCyYtVQ',
            lastUpdatedBy: null,
            lastUpdatedAt: 1676022397755,
            userLockoutPolicy: {
              enableLockoutPolicy: false,
              numberOfFailedAttemptsBeforeLockout: 5,
              lockOutPeriod: 24,
              notifyUser: true,
              userGroupsToNotify: null
            },
            passwordExpirationPolicy: {
              enabled: false,
              daysBeforePasswordExpires: 5,
              daysBeforeUserNotifiedOfPasswordExpiration: 10
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
      authenticationMechanism: 'SAML',
      twoFactorEnabled: false,
      sessionTimeoutInMinutes: 30
    },
    responseMessages: []
  }
  return (
    <React.Fragment>
      <Page.Body
        loading={fetchingAuthSettings || updating}
        loadingMessage={updating ? getString('authSettings.updating') : undefined}
        error={
          (errorWhileFetchingAuthSettings?.data as Error)?.message ||
          errorWhileFetchingAuthSettings?.message ||
          (data?.resource ? undefined : getString('somethingWentWrong'))
        }
        retryOnError={() => refetchAuthSettings()}
      >
        {data?.resource && (
          <React.Fragment>
            {!canEdit && (
              <Callout icon={null} className={css.callout}>
                <RBACTooltip
                  permission={PermissionIdentifier.EDIT_AUTHSETTING}
                  resourceType={permissionRequest.resource.resourceType}
                  resourceScope={permissionRequest.resourceScope}
                />
              </Callout>
            )}
            <AccountAndOAuth
              authSettings={data.resource}
              refetchAuthSettings={refetchAuthSettings}
              canEdit={canEdit}
              setUpdating={setUpdating}
            />
            {PL_ENABLE_MULTIPLE_IDP_SUPPORT ? (
              <SAMLProviderV2
                authSettings={data.resource}
                refetchAuthSettings={refetchAuthSettings}
                permissionRequest={permissionRequest}
                canEdit={canEdit}
                setUpdating={setUpdating}
              />
            ) : (
              <SAMLProvider
                authSettings={data.resource}
                refetchAuthSettings={refetchAuthSettings}
                permissionRequest={permissionRequest}
                canEdit={canEdit}
                setUpdating={setUpdating}
              />
            )}
            <LDAPProvider
              authSettings={data.resource}
              refetchAuthSettings={refetchAuthSettings}
              permissionRequest={permissionRequest}
              canEdit={canEdit}
              setUpdating={setUpdating}
            />
            <RestrictEmailDomains
              whitelistedDomains={data.resource.whitelistedDomains || []}
              refetchAuthSettings={refetchAuthSettings}
              canEdit={canEdit}
              setUpdating={setUpdating}
            />
            <SessionTimeOut timeout={data.resource.sessionTimeoutInMinutes} />
          </React.Fragment>
        )}
      </Page.Body>
    </React.Fragment>
  )
}

export default Configuration
