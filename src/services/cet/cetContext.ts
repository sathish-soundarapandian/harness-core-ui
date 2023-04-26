/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { QueryKey, UseQueryOptions } from '@tanstack/react-query'
import SessionToken from 'framework/utils/SessionToken'
import { hasPathParams, resolvePathParam, hasQueryParams, hasBody } from '../sto/context'
import type { QueryOperation } from './cetComponents'

export type CetContext<TQueryOperation extends QueryOperation> = {
  fetcherOptions: {
    /**
     * Headers to inject in the fetcher
     */
    headers?: {
      authorization: string
      accountId: string
    }
    /**
     * Query params to inject in the fetcher
     */
    queryParams?: {}
  }
  queryOptions: {
    /**
     * Set this to `false` to disable automatic refetching when the query mounts or changes query keys.
     * Defaults to `true`.
     */
    enabled?: boolean
  }
  /**
   * Query key manager.
   */
  queryKeyFn: (operation: TQueryOperation) => QueryKey
}
/**
 * Context injected into every react-query hook wrappers
 *
 * @param queryOptions options from the useQuery wrapper
 */
export function useCetContext<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TQueryOperation extends QueryOperation = QueryOperation
>(
  _queryOptions?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
): CetContext<TQueryOperation> {
  const token = SessionToken.getToken()
  const actId = SessionToken.accountId()

  return {
    fetcherOptions: {
      headers: {
        authorization: `Bearer ${token}`,
        accountId: actId
      }
    },
    queryOptions: {},
    queryKeyFn: operation => {
      const queryKey: unknown[] = hasPathParams(operation)
        ? operation.path
            .split('/')
            .filter(Boolean)
            .map(i => resolvePathParam(i, operation.variables.pathParams))
        : operation.path.split('/').filter(Boolean)

      if (hasQueryParams(operation)) {
        queryKey.push(operation.variables.queryParams)
      }

      if (hasBody(operation)) {
        queryKey.push(operation.variables.body)
      }

      return queryKey
    }
  }
}
