/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IStringifyOptions } from 'qs'
import { stringify } from 'qs'
import SecureStorage from 'framework/utils/SecureStorage'

const JSON_HEADERS = ['application/json']

export interface FetcherOptions<TQueryParams = never, TBody = never> extends Omit<RequestInit, 'body' | 'headers'> {
  url: string
  queryParams?: TQueryParams extends never ? undefined : TQueryParams
  body?: TBody extends never ? undefined : TBody
  stringifyQueryParamsOptions?: IStringifyOptions
  headers?: Record<string, string>
}

export async function fetcher<TResponse = unknown, TQueryParams = never, TBody = never>(
  options: FetcherOptions<TQueryParams, TBody>
): Promise<TResponse> {
  const { stringifyQueryParamsOptions, headers, body, url, queryParams, ...rest } = options

  const token = SecureStorage.get('token')
  const accountId = SecureStorage.get<string>('acctId')
  let finalUrl = window.getApiBaseUrl(url)
  const finalQueryParams: Record<string, string> = {}

  if (accountId) {
    finalQueryParams.routingId = accountId
  }

  if (queryParams) {
    Object.assign(finalQueryParams, queryParams)
  }

  finalUrl += stringify(finalQueryParams, { ...stringifyQueryParamsOptions, addQueryPrefix: true })

  const headersObj: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers ? headers : {})
  }
  if (!window.noAuthHeader) {
    headersObj['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(finalUrl, {
    headers: headersObj,
    body: body ? JSON.stringify(body) : undefined,
    ...rest
  })

  // custom event to allow the app framework to handle api responses
  const responseEvent = new CustomEvent('PROMISE_API_RESPONSE', { detail: { response } })
  window.dispatchEvent(responseEvent) // this will be captured in App.tsx to handle 401 and token refresh

  const contentType = response.headers.get('Content-Type')
  const asJson = contentType && JSON_HEADERS.some(h => contentType.startsWith(h))

  const data = await (asJson ? response.json() : response.text())

  if (response.ok) {
    return data
  }

  throw data
}
