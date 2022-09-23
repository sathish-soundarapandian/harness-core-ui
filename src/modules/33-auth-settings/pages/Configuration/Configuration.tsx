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
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import LDAPProvider from './LDAPProvider/LDAPProvider'
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
    data,
    loading: fetchingAuthSettings,
    error: errorWhileFetchingAuthSettings,
    refetch: refetchAuthSettings
  } = useGetAuthenticationSettings({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  return (
    <React.Fragment>
      <Page.Header breadcrumbs={<NGBreadcrumbs />} title={getString('authentication')} />
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
            <SAMLProvider
              authSettings={data.resource}
              refetchAuthSettings={refetchAuthSettings}
              permissionRequest={permissionRequest}
              canEdit={canEdit}
              setUpdating={setUpdating}
            />
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
          </React.Fragment>
        )}
      </Page.Body>
    </React.Fragment>
  )
}

export default Configuration
