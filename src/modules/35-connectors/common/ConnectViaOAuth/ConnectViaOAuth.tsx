/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Layout, Text, Icon, Button, ButtonVariation, IconProps, TextProps, IconName } from '@wings-software/uicore'
import type { LayoutProps } from '@wings-software/uicore/dist/layouts/Layout'
import { Color, FontVariation, FontWeight } from '@harness/design-system'
import { getRequestOptions } from 'framework/app/App'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { Status } from '@common/utils/Constants'
import {
  MAX_TIMEOUT_OAUTH,
  OAUTH_REDIRECT_URL_PREFIX
} from '@connectors/components/CreateConnector/CreateConnectorUtils'
import { Connectors } from '@connectors/constants'

import css from './ConnectViaOAuth.module.scss'

export interface ConnectViaOAuthProps {
  gitProviderType: ConnectorInfoDTO['type']
  accountId: string
  status: Status
  setOAuthStatus: React.Dispatch<React.SetStateAction<Status>>
  isOAuthAccessRevoked: boolean
  isExistingConnectionHealthy: boolean
  oAuthSecretIntercepted?: React.MutableRefObject<boolean>
  forceFailOAuthTimeoutId?: NodeJS.Timeout
  setForceFailOAuthTimeoutId: React.Dispatch<React.SetStateAction<NodeJS.Timeout | undefined>>
}

export const ConnectViaOAuth: React.FC<ConnectViaOAuthProps> = props => {
  const {
    gitProviderType,
    accountId,
    status,
    isOAuthAccessRevoked,
    isExistingConnectionHealthy,
    oAuthSecretIntercepted,
    setOAuthStatus,
    forceFailOAuthTimeoutId,
    setForceFailOAuthTimeoutId
  } = props
  const { getString } = useStrings()

  const isOAuthGettingRelinked: boolean = isExistingConnectionHealthy && status === Status.SUCCESS

  const handleOAuthLinking = useCallback(async (): Promise<void> => {
    // This setTimeout is added to force fail oauth after a while, if no server event for oauth is received eventually
    const timeoutId = setTimeout(() => {
      if (status !== Status.SUCCESS) {
        setOAuthStatus(Status.FAILURE)
      }
    }, MAX_TIMEOUT_OAUTH)
    if (!forceFailOAuthTimeoutId) {
      setForceFailOAuthTimeoutId(timeoutId)
    } else if (forceFailOAuthTimeoutId !== timeoutId) {
      // clear previous timeout id if this method is invoked again
      clearTimeout(forceFailOAuthTimeoutId)
      setForceFailOAuthTimeoutId(timeoutId)
    }
    setOAuthStatus(Status.IN_PROGRESS)
    if (oAuthSecretIntercepted?.current) {
      oAuthSecretIntercepted.current = false
    }
    try {
      const { headers } = getRequestOptions()
      const oauthRedirectEndpoint = `${OAUTH_REDIRECT_URL_PREFIX}?provider=${gitProviderType.toLowerCase()}&accountId=${accountId}`
      const response = await fetch(oauthRedirectEndpoint, {
        headers
      })
      const oAuthURL = await response.text()
      if (typeof oAuthURL === 'string') {
        window.open(oAuthURL, '_blank')
      }
    } catch (e) {
      setOAuthStatus(Status.FAILURE)
    }
  }, [isExistingConnectionHealthy, accountId])

  const renderIconAndLabel = useCallback(
    ({
      iconProps,
      label,
      labelProps,
      layoutProps
    }: {
      iconProps: IconProps
      label: string
      labelProps: TextProps
      layoutProps?: LayoutProps
    }): JSX.Element => {
      return (
        <Layout.Horizontal spacing="xsmall" flex={{ justifyContent: 'flex-start' }} {...layoutProps}>
          <Icon {...iconProps} />
          <Text {...labelProps}>{label}</Text>
        </Layout.Horizontal>
      )
    },
    []
  )

  const renderView = useCallback((): JSX.Element => {
    const commonPropsForOAuthConfiguredProperly = {
      iconProps: { size: 24, name: 'success-tick' as IconName },
      label: getString(isOAuthGettingRelinked ? 'connectors.oAuth.reConfigured' : 'connectors.oAuth.configured'),
      labelProps: { font: { weight: 'semi-bold' as FontWeight }, color: Color.GREEN_800 },
      layoutProps: {
        className: css.oAuthSuccess,
        padding: { left: 'small', top: 'xsmall', right: 'small', bottom: 'xsmall' }
      }
    }
    switch (status) {
      case Status.TO_DO:
        if (isOAuthAccessRevoked) {
          return renderIconAndLabel({
            iconProps: { size: 20, name: 'danger-icon' },
            label: getString('connectors.oAuth.accessRevoked'),
            labelProps: { font: { variation: FontVariation.BODY } }
          })
        } else if (isExistingConnectionHealthy) {
          return renderIconAndLabel(commonPropsForOAuthConfiguredProperly)
        }
        return <></>
      case Status.SUCCESS:
        return renderIconAndLabel(commonPropsForOAuthConfiguredProperly)
      case Status.FAILURE:
        return renderIconAndLabel({
          iconProps: { size: 24, name: 'circle-cross', color: Color.RED_500 },
          label: getString('connectors.oAuth.failed'),
          labelProps: { font: { weight: 'semi-bold' }, color: Color.RED_500 },
          layoutProps: {
            className: css.oAuthFailure,
            padding: { left: 'small', top: 'xsmall', right: 'small', bottom: 'xsmall' }
          }
        })

      default:
        return <></>
    }
  }, [status, isOAuthAccessRevoked, isExistingConnectionHealthy, isOAuthGettingRelinked])

  const getRelinkLabel = useCallback((): string => {
    switch (gitProviderType) {
      case Connectors.GITHUB:
        return getString('common.repo_provider.githubLabel')
      case Connectors.GITLAB:
        return getString('common.repo_provider.gitlabLabel')
      default:
        return ''
    }
  }, [gitProviderType])

  return (
    <>
      <Layout.Vertical spacing="xlarge">
        {renderView()}
        <Button
          intent="primary"
          text={getString(
            isExistingConnectionHealthy ? 'connectors.relinkToGitProvider' : 'connectors.linkToGitProvider',
            {
              gitProvider: getRelinkLabel()
            }
          )}
          onClick={handleOAuthLinking}
          variation={ButtonVariation.PRIMARY}
          className={css.linkToGitBtn}
        />
      </Layout.Vertical>
    </>
  )
}
