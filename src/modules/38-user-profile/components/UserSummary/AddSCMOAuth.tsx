/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Text, Layout, DropDown, getErrorInfoFromErrorObject, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
//import { useStrings } from 'framework/strings'
import { ConnectorInfoDTO, useSaveUserSourceCodeManager, UserSourceCodeManagerRequestDTO } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ConnectViaOAuth } from '@connectors/common/ConnectViaOAuth/ConnectViaOAuth'
import { Status } from '@common/utils/Constants'
import {
  OAuthEventProcessingResponse,
  handleOAuthEventProcessing
} from '@connectors/components/CreateConnector/CreateConnectorUtils'
import { SourceCodeTypes } from '@user-profile/utils/utils'
import css from './UserSummary.module.scss'

const AddSCMOAuth: React.FC<{ refetch: any }> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo } = useAppStore()
  //const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [oAuthStatus, setOAuthStatus] = useState<Status>(Status.TO_DO)
  const oAuthSecretIntercepted = useRef<boolean>(false)
  const [forceFailOAuthTimeoutId, setForceFailOAuthTimeoutId] = useState<NodeJS.Timeout>()
  // const [setOAuthResponse] = useState<OAuthEventProcessingResponse>()
  const [gitProviderType, setGitProviderType] = useState<UserSourceCodeManagerRequestDTO['type']>()

  const supportedSCMs = [
    {
      label: 'Github',
      value: SourceCodeTypes.GITHUB
    },
    {
      label: 'Bitbucket',
      value: SourceCodeTypes.BITBUCKET
    },
    { label: 'Gitlab', value: SourceCodeTypes.GITLAB },
    { label: 'Azure repository', value: SourceCodeTypes.AZURE_REPO },
    { label: 'AWS code commit', value: SourceCodeTypes.AWS_CODE_COMMIT }
  ]

  const { loading, mutate: createUserSCM } = useSaveUserSourceCodeManager({})

  const handleOAuthServerEvent = useCallback(
    (event: MessageEvent): void => {
      handleOAuthEventProcessing({
        event,
        oAuthStatus,
        setOAuthStatus,
        oAuthSecretIntercepted,
        onSuccessCallback: ({ accessTokenRef, refreshTokenRef }: OAuthEventProcessingResponse) => {
          if (forceFailOAuthTimeoutId) {
            clearTimeout(forceFailOAuthTimeoutId)
          }
          createUserSCM({
            accountIdentifier: accountId,
            type: gitProviderType,
            userIdentifier: currentUserInfo?.uuid,
            authentication: {
              apiAccessDTO: {
                spec: { tokenRef: accessTokenRef, refreshTokenRef },
                type: 'OAuth'
              }
            }
          })
            .then(() => {
              showSuccess(`User SCM for {gitProviderType} created succesfully`)
              props.refetch()
            })
            .catch(error => {
              setOAuthStatus(Status.TO_DO)
              showError(getErrorInfoFromErrorObject(error))
            })
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
            setOAuthStatus(Status.TO_DO)
            //setOAuthResponse(undefined)
            setGitProviderType(item?.value as UserSourceCodeManagerRequestDTO['type'])
          }}
          items={supportedSCMs}
          placeholder={'Select a Git Provider'}
          usePortal={true}
          addClearBtn={true}
          disabled={loading}
        />
        {gitProviderType && (
          <ConnectViaOAuth
            labelText={'Connect'}
            isPrivateSecret={true}
            key={gitProviderType}
            gitProviderType={gitProviderType as ConnectorInfoDTO['type']}
            accountId={accountId}
            status={oAuthStatus}
            setOAuthStatus={setOAuthStatus}
            isOAuthAccessRevoked={false}
            isExistingConnectionHealthy={false}
            oAuthSecretIntercepted={oAuthSecretIntercepted}
            forceFailOAuthTimeoutId={forceFailOAuthTimeoutId}
            setForceFailOAuthTimeoutId={setForceFailOAuthTimeoutId}
            hideOauthLinkButton={oAuthStatus === Status.SUCCESS || oAuthStatus === Status.IN_PROGRESS}
          />
        )}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default AddSCMOAuth
