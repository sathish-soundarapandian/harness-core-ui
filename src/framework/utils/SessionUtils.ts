/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useHistory } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { returnUrlParams } from '@common/utils/routeUtils'
import SecureStorage from './SecureStorage'

interface GetLoginPageURL {
  returnUrl?: string
}

export const getLoginPageURL = ({ returnUrl }: GetLoginPageURL): string => {
  // for basepath, pick current path, but remove `/ng/` or `/ng`, to respect PR env namespaces
  const basePath = window.HARNESS_ENABLE_NG_AUTH_UI
    ? `${window.location.pathname.replace(/\/ng\/?/, '/')}auth/#/signin`
    : `${window.location.pathname.replace(/\/ng\/?/, '/')}#/login`

  return returnUrl
    ? `${basePath}?action=signout&returnUrl=${encodeURIComponent(returnUrl)}`
    : `${basePath}?action=signout`
}

export const getForgotPasswordURL = (): string => {
  // for basepath, pick current path, but remove `/ng/` or `/ng`, to respect PR env namespaces
  return window.HARNESS_ENABLE_NG_AUTH_UI
    ? `${window.location.pathname.replace(/\/ng\/?/, '/')}auth/#/forgot-password`
    : `${window.location.pathname.replace(/\/ng\//, '/')}#/forgot-password`
}

export interface UseLogoutReturn {
  forceLogout: () => void
}

export const useLogout = (): UseLogoutReturn => {
  const history = useHistory()
  let isTriggered = false

  const forceLogout = (): void => {
    if (!isTriggered) {
      isTriggered = true
      SecureStorage.clear()
      history.push({
        pathname: routes.toRedirect(),
        search: returnUrlParams(getLoginPageURL({ returnUrl: window.location.href }))
      })
    }
  }

  return { forceLogout }
}
