/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getSamlEndpoint = (accountId: string): string => {
  let url = window.location.href.split('/#')[0]?.replace('/ng', '')

  if (window.apiUrl) {
    if (window.apiUrl.startsWith('/')) {
      url = `${url}${window.apiUrl}`
    } else {
      url = window.apiUrl
    }
  }

  return `${url}/api/users/saml-login?accountId=${accountId}`
}
