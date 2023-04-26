/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { apiFetch, getBaseUrl } from '../sto/fetcher'
import type { QueryOperation } from './cetComponents'
import type { CetContext } from './cetContext'

export type { ErrorWrapper } from '../sto/fetcher'

const baseUrl = process.env.ERROR_TRACKING_URL || getBaseUrl('et')

export type CetFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string
  method: string
  body?: TBody
  headers?: THeaders
  queryParams?: TQueryParams
  pathParams?: TPathParams
} & CetContext<QueryOperation>['fetcherOptions']

export async function cetFetch<
  TData,
  TError,
  TBody extends {} | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {}
>(options: CetFetcherOptions<TBody, THeaders, TQueryParams, TPathParams>): Promise<TData> {
  return apiFetch<TData, TError, TBody, THeaders, TQueryParams, TPathParams>({ ...options, baseUrl })
}
