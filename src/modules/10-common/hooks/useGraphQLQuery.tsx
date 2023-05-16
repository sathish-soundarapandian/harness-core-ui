/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseMutateProps } from 'restful-react';
import { useMutate } from 'restful-react'
// eslint-disable-next-line no-restricted-imports
import type { DebounceSettings } from 'lodash'
import { omit } from 'lodash-es'

import type { UseMutateAsGetReturn } from './useMutateAsGet';
import { useMutateAsGet } from './useMutateAsGet'

type UseGraphQLQueryProps<TData, TError, TQueryParams, TRequestBody, TPathParams> = Omit<
  UseMutateProps<TData, TError, TQueryParams, TRequestBody, TPathParams>,
  'verb'
> & {
  lazy?: boolean
  body: TRequestBody
  debounce?:
    | {
        wait?: number
        options: DebounceSettings
      }
    | boolean
    | number
}

export function useGraphQLQuery<
  TData = any,
  TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TRequestBody = any,
  TPathParams = unknown
>(
  props: UseGraphQLQueryProps<TData, TError, TQueryParams, TRequestBody, TPathParams>
): UseMutateAsGetReturn<TData, TError, TRequestBody, TQueryParams, TPathParams> {
  const useGraphqlMutate = () => {
    return useMutate<TData, TError, TQueryParams, TRequestBody, TPathParams>({
      verb: 'POST',
      ...props
    })
  }

  const { data, initLoading, loading, error, cancel, refetch } = useMutateAsGet<
    TData,
    TError,
    TRequestBody,
    TQueryParams,
    TPathParams
  >(useGraphqlMutate, omit(props, 'path'))

  return { data, initLoading, loading, error, cancel, refetch }
}
