/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getBugsnagCallback = (username: string, url: string, response: Response, accountId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (event: any) {
    event.severity = 'error'
    event.setUser(username)
    event.addMetadata('IP Address fetch failed', {
      url: url,
      status: response.status,
      accountId
    })
  }
}

export const fetchCurrentIp = async (username: string, accountId: string): Promise<string | undefined> => {
  const url = 'https://api.ipify.org/'
  let response: Response
  const currentIpPromise = await fetch(url)
    .then((res: Response) => {
      response = res.clone()
      return res.text()
    })
    .then(ip => {
      return ip
    })
    .catch(error => {
      const bugsnagCallback = getBugsnagCallback(username, url, response, accountId)
      window.bugsnagClient?.notify?.(new Error(error), bugsnagCallback)
      return undefined
    })
  return currentIpPromise
}
