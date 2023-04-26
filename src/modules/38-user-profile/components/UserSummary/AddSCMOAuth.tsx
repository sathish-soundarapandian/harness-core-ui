/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Text, Layout, DropDown } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { ConnectorInfoDTO, useSaveUserSourceCodeManager } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ConnectViaOAuth } from '@connectors/common/ConnectViaOAuth/ConnectViaOAuth'
import { Connectors } from '@connectors/constants'
import { Status } from '@common/utils/Constants'
import {
  OAuthEventProcessingResponse,
  handleOAuthEventProcessing
} from '@connectors/components/CreateConnector/CreateConnectorUtils'
import css from './UserSummary.module.scss'

const supportedSCMs = [
  { label: 'Github', value: Connectors.GITHUB },
  { label: 'Gitlab', value: Connectors.GITLAB },
  { label: 'BitBucket', value: Connectors.BITBUCKET },
  { label: 'Azure repository', value: Connectors.AZURE_REPO }
]

const AddSCMOAuth: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo } = useAppStore()
  const [oAuthStatus, setOAuthStatus] = useState<Status>(Status.TO_DO)
  const [isAccessRevoked, setIsAccessRevoked] = useState<boolean>(false)
  const oAuthSecretIntercepted = useRef<boolean>(false)
  const [forceFailOAuthTimeoutId, setForceFailOAuthTimeoutId] = useState<NodeJS.Timeout>()
  const [oAuthResponse, setOAuthResponse] = useState<OAuthEventProcessingResponse>()
  const [gitProviderType, setGitProviderType] = useState<ConnectorInfoDTO['type']>()

  const { data, loading, mutate: createUserSCM } = useSaveUserSourceCodeManager({})

  const handleOAuthServerEvent = useCallback(
    (event: MessageEvent): void => {
      handleOAuthEventProcessing({
        event,
        oAuthStatus,
        setOAuthStatus,
        oAuthSecretIntercepted,
        onSuccessCallback: ({ accessTokenRef }: OAuthEventProcessingResponse) => {
          setOAuthResponse({ accessTokenRef })
          if (forceFailOAuthTimeoutId) {
            clearTimeout(forceFailOAuthTimeoutId)
            // createUserSCM({ accountIdentifier: accountId, type: 'GITHUB', userIdentifier: currentUserInfo?.uuid, spec: {} })
          }
        }
      })
    },
    [oAuthStatus, forceFailOAuthTimeoutId]
  )

  useEffect(() => {
    window.addEventListener('message', handleOAuthServerEvent)

    return () => {
      window.removeEventListener('message', handleOAuthServerEvent)
    }
  }, [handleOAuthServerEvent])

  return (
    <Layout.Vertical spacing="large">
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {'Connect to Git Provider'}
      </Text>
      <Layout.Horizontal spacing="medium">
        <DropDown
          className={css.oauthDropDown}
          value={gitProviderType}
          onChange={item => {
            console.log(item)
            setGitProviderType(item?.value as ConnectorInfoDTO['type'])
          }}
          items={supportedSCMs}
          placeholder={'Select a Git Provider'}
          usePortal={true}
          addClearBtn={true}
        />
        {gitProviderType && (
          <ConnectViaOAuth
            label={'Connect'}
            gitProviderType={gitProviderType}
            accountId={accountId}
            status={oAuthStatus}
            setOAuthStatus={setOAuthStatus}
            isOAuthAccessRevoked={isAccessRevoked}
            isExistingConnectionHealthy={false}
            oAuthSecretIntercepted={oAuthSecretIntercepted}
            forceFailOAuthTimeoutId={forceFailOAuthTimeoutId}
            setForceFailOAuthTimeoutId={setForceFailOAuthTimeoutId}
          />
        )}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default AddSCMOAuth
