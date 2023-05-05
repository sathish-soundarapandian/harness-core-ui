/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Environment, Status } from '@common/utils/Constants'
import { getPREnvNameFromURL, isPR } from '@common/utils/utils'

export const getBackendServerUrl = (): string => {
  return `${location.protocol}//${location.hostname}`
}

export const isEnvironmentAllowedForOAuth = (): boolean => {
  return Object.values(Environment).some((env: Environment) =>
    location.hostname.toLowerCase().startsWith(env.toLowerCase())
  )
}

export const getGatewayUrlPrefix = (): string => {
  const urlPrefix = `${location.protocol}//${location.host}`
  return isPR() ? `${urlPrefix}/${getPREnvNameFromURL(location.href)}/gateway` : `${urlPrefix}/gateway`
}

export const OAUTH_REDIRECT_URL_PREFIX = `${getGatewayUrlPrefix()}/api/secrets/oauth2Redirect`

export const OAUTH_PLACEHOLDER_VALUE = 'placeholder'

export const MAX_TIMEOUT_OAUTH = 1000 * 60 * 5 // five minutes
export const POST_OAUTH_SUCCESS_ANIMATION_DELAY = 2 * 1000 // 2 seconds

export interface OAuthEventProcessingResponse {
  accessTokenRef: string
  refreshTokenRef?: string
}

export const handleOAuthEventProcessing = ({
  event,
  oAuthStatus,
  setOAuthStatus,
  oAuthSecretIntercepted,
  onSuccessCallback
}: {
  event: MessageEvent
  oAuthStatus: Status
  setOAuthStatus: React.Dispatch<React.SetStateAction<Status>>
  oAuthSecretIntercepted: React.MutableRefObject<boolean>
  onSuccessCallback: (response: OAuthEventProcessingResponse) => void
}): OAuthEventProcessingResponse | undefined => {
  if (oAuthStatus === Status.IN_PROGRESS) {
    // For local dev this condtion of same origin should be skipped
    if (event.origin !== getBackendServerUrl() && !isEnvironmentAllowedForOAuth()) {
      return
    }
    if (!event || !event.data) {
      return
    }
    const { accessTokenRef, refreshTokenRef, status, errorMessage } = event.data
    // valid oauth event from server will always have some value
    if (accessTokenRef && status && errorMessage) {
      // safeguard against backend server sending multiple oauth events
      if (!oAuthSecretIntercepted.current) {
        if (
          accessTokenRef !== OAUTH_PLACEHOLDER_VALUE &&
          (status as string).toLowerCase() === Status.SUCCESS.toLowerCase()
        ) {
          setTimeout(() => setOAuthStatus(Status.SUCCESS), POST_OAUTH_SUCCESS_ANIMATION_DELAY)
          oAuthSecretIntercepted.current = true
          onSuccessCallback({ accessTokenRef, refreshTokenRef })
        } else if (errorMessage !== OAUTH_PLACEHOLDER_VALUE) {
          setOAuthStatus(Status.FAILURE)
        }
      }
    }
  }
}
