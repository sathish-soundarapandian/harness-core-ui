/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import SessionToken from 'framework/utils/SessionToken'
import { mapKeys } from 'lodash-es'
import qs from 'qs'

export const getConfig = (str: string): string => {
  if (window.browserRouterEnabled) {
    return `${window.apiUrl || ''}/${str}`
  } else {
    // repeating location.pathname since  every test case is failing giving error saying window.getHarnessLocationPathname
    // not defined and need to write window.getharnesslocationpathname in every test case to correct it
    const pathName = window.getHarnessLocationPathname ? window.getHarnessLocationPathname() : window.location.pathname
    return window.apiUrl ? `${window.apiUrl}/${str}` : pathName.replace('ng/', '') + str
  }
}
export interface GetUsingFetchProps<
  _TData = any,
  _TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TPathParams = {
    [key: string]: any
  }
> {
  queryParams?: TQueryParams
  pathParams?: TPathParams
  requestOptions?: RequestInit
  mock?: _TData
}

export const getUsingFetch = <
  TData = any,
  _TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TPathParams = {
    [key: string]: any
  }
>(
  base: string,
  path: string,
  props: { queryParams?: TQueryParams; pathParams?: TPathParams; requestOptions?: RequestInit; mock?: TData },
  signal?: RequestInit['signal']
): Promise<TData> => {
  if (props.mock) return Promise.resolve(props.mock)
  let url = base + path
  if (props.queryParams && Object.keys(props.queryParams).length) {
    url += `?${qs.stringify(props.queryParams)}`
  }
  return fetch(url, {
    signal,
    ...(props.requestOptions || {}),
    headers: getHeaders(props.requestOptions?.headers)
  }).then(res => {
    // custom event to allow the app framework to handle api responses
    const responseEvent = new CustomEvent('PROMISE_API_RESPONSE', { detail: { response: res } })
    window.dispatchEvent(responseEvent) // this will be captured in App.tsx to handle 401 and token refresh

    const contentType = res.headers.get('content-type') || ''
    if (contentType.toLowerCase().indexOf('application/json') > -1) {
      return res.json()
    }
    return res.text()
  })
}

export interface MutateUsingFetchProps<
  _TData = any,
  _TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TRequestBody = any,
  TPathParams = {
    [key: string]: any
  }
> {
  body: TRequestBody
  queryParams?: TQueryParams
  pathParams?: TPathParams
  requestOptions?: RequestInit
  mock?: _TData
}

export const mutateUsingFetch = <
  TData = any,
  _TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TRequestBody = any,
  TPathParams = {
    [key: string]: any
  }
>(
  method: string,
  base: string,
  path: string,
  props: {
    body: TRequestBody
    queryParams?: TQueryParams
    pathParams?: TPathParams
    requestOptions?: RequestInit
    mock?: TData
  },
  signal?: RequestInit['signal']
): Promise<TData> => {
  if (props.mock) return Promise.resolve(props.mock)
  let url = base + path
  if (method === 'DELETE' && typeof props.body === 'string') {
    url += `/${props.body}`
  }
  if (props.queryParams && Object.keys(props.queryParams).length) {
    url += `?${qs.stringify(props.queryParams)}`
  }

  let body: BodyInit | null = null

  if (props.body instanceof FormData) {
    body = props.body
  } else if (typeof props.body === 'object') {
    try {
      body = JSON.stringify(props.body)
    } catch {
      body = props.body as any
    }
  } else {
    body = props.body as any
  }

  return fetch(url, {
    method,
    body,
    signal,
    ...(props.requestOptions || {}),
    headers: getHeaders(props.requestOptions?.headers)
  }).then(res => {
    // custom event to allow the app framework to handle api responses
    const responseEvent = new CustomEvent('PROMISE_API_RESPONSE', { detail: { response: res } })
    window.dispatchEvent(responseEvent) // this will be captured in App.tsx to handle 401 and token refresh

    const contentType = res.headers.get('content-type') || ''
    if (contentType.toLowerCase().indexOf('application/json') > -1) {
      return res.json()
    }
    return res.text()
  })
}

const getHeaders = (headers: RequestInit['headers'] = {}): RequestInit['headers'] => {
  const retHeaders: RequestInit['headers'] = {
    'content-type': 'application/json'
  }

  const token = SessionToken.getToken()
  if (token && token.length > 0) {
    retHeaders.Authorization = `Bearer ${token}`
  }

  // add/overwrite passed headers
  Object.assign(
    retHeaders,
    mapKeys(headers, (_value, key) => key.toLowerCase())
  )

  return retHeaders
}
