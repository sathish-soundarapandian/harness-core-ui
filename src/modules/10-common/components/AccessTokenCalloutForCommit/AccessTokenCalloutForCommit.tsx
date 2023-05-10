/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Text, Layout, useToaster } from '@harness/uicore'
import { Callout } from '@blueprintjs/core'
import cx from 'classnames'
import {
  useGetConnector,
  useGetUserSourceCodeManagers,
  GetUserSourceCodeManagersQueryParams,
  UserSourceCodeManagerResponseDTO
} from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import AccessTokenOAuth from '@common/components/AccessTokenOAuth/AccessTokenOAuth'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import css from './AccessTokenCalloutForCommit.module.scss'

const AccessTokenCalloutForCommit: React.FC<{
  connectorIdWithScope: string
}> = props => {
  const { connectorIdWithScope = '' } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { currentUserInfo } = useAppStore()
  const { showError } = useToaster()
  const scopeFromSelected = getScopeFromValue(connectorIdWithScope || '')

  const { data: connectorData, loading } = useGetConnector({
    identifier: getIdentifierFromValue(connectorIdWithScope),
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: scopeFromSelected === Scope.ORG || scopeFromSelected === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: scopeFromSelected === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: false
  })

  const {
    data: OauthSCMs,
    loading: loadingOauthSCMs,
    refetch: refetchOauthSCMs
  } = useGetUserSourceCodeManagers({
    queryParams: { accountIdentifier: accountId, userIdentifier: currentUserInfo.uuid },
    lazy: true
  })

  React.useEffect(() => {
    if (!loading && currentUserInfo && connectorData?.data?.connector?.type) {
      refetchOauthSCMs({
        queryParams: {
          accountIdentifier: accountId,
          userIdentifier: currentUserInfo.uuid,
          type: connectorData?.data?.connector?.type?.toUpperCase() as GetUserSourceCodeManagersQueryParams['type']
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorData, currentUserInfo, loading])

  return (
    <Callout
      intent="none"
      className={cx(css.callout, {
        [css.calloutWarning]:
          loading || loadingOauthSCMs || OauthSCMs?.data?.userSourceCodeManagerResponseDTOList?.length === 0
      })}
    >
      <Layout.Horizontal flex={{ alignItems: 'center' }}>
        {loading || loadingOauthSCMs ? (
          <Text icon="loading">{getString('common.oAuth.fetchingUserAccessTokens')}</Text>
        ) : OauthSCMs?.data?.userSourceCodeManagerResponseDTOList?.[0]?.userName ? (
          <Text>
            {getString('common.oAuth.usingUserAccessTokens', {
              user: OauthSCMs?.data?.userSourceCodeManagerResponseDTOList?.[0]?.userName
            })}
          </Text>
        ) : (
          <>
            <Text>
              {getString('common.oAuth.setUpUserAccessTokenMessage', {
                type: connectorData?.data?.connector?.type
              })}
            </Text>
            <AccessTokenOAuth
              refetch={refetchOauthSCMs}
              selectedProvider={
                connectorData?.data?.connector?.type?.toUpperCase() as UserSourceCodeManagerResponseDTO['type']
              }
              errorHandler={() => showError(getString('common.OAuthTryAgain'))}
            />
          </>
        )}
      </Layout.Horizontal>
    </Callout>
  )
}

export default AccessTokenCalloutForCommit
