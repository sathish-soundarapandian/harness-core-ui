/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useQueryParams } from '@common/hooks'
import type { OAuthRedirectParams } from '@common/interfaces/RouteInterfaces'

function OAuthRedirect() {
  const { code } = useQueryParams<OAuthRedirectParams>()

  useEffect(() => {
    setTimeout(() => {
      window.opener.location.href = `${window.opener.location.href}?code=${code}`
      window.close()
    }, 5000)
  }, [code])

  return <>Oauth Redirect, code is {code ?? 'empty'}</>
}

export default OAuthRedirect
