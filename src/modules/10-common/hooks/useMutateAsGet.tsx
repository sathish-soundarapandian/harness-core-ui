/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseMutateProps, UseMutateReturn, MutateMethod, GetDataError } from 'restful-react'
import { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react'
// eslint-disable-next-line no-restricted-imports
import type { Cancelable, DebounceSettings } from 'lodash' // only type imports
import { debounce, identity } from 'lodash-es'

import { shouldShowError } from '@harness/uicore'
import { unstable_batchedUpdates } from 'react-dom'
import { useDeepCompareEffect } from './useDeepCompareEffect'

const isCancellable = <T extends (...args: any[]) => any>(func: T): func is T & Cancelable => {
  return typeof (func as any).cancel === 'function' && typeof (func as any).flush === 'function'
}

export type WrappedUseMutateProps<TData, TError, TQueryParams, TRequestBody, TPathParams> = Omit<
  UseMutateProps<TData, TError, TQueryParams, TRequestBody, TPathParams>,
  'path' | 'verb'
> & {
  lazy?: boolean
  body: TRequestBody
  mock?: TData | TError
  debounce?:
    | {
        wait?: number
        options: DebounceSettings
      }
    | boolean
    | number
} & any // TODO: Add correct types here

type UseMutateWrapper<TData, TError, TQueryParams, TRequestBody, TPathParams> = (
  props: WrappedUseMutateProps<TData, TError, TQueryParams, TRequestBody, TPathParams>
) => UseMutateReturn<TData, TError, TRequestBody, TQueryParams, TPathParams>

export interface UseMutateAsGetReturn<
  TData = any,
  TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TRequestBody = any,
  TPathParams = unknown
> {
  data: TData | null
  initLoading: boolean
  loading: boolean
  error: GetDataError<TError> | null
  cancel(): void
  refetch(
    props?: WrappedUseMutateProps<TData, TError, TRequestBody, TQueryParams, TPathParams>
  ): Promise<void> | undefined
}

async function _fetchData<TData, TError, TQueryParams, TRequestBody, TPathParams>(
  mutate: MutateMethod<TData, TQueryParams, TRequestBody, TPathParams>,
  props: WrappedUseMutateProps<TData, TError, TRequestBody, TQueryParams, TPathParams>,
  setInitLoading: Dispatch<SetStateAction<boolean>>,
  setData: Dispatch<SetStateAction<TData | null>>,
  setError: Dispatch<SetStateAction<TError | null>>
): Promise<void> {
  try {
    const data = await mutate(props.body, {
      queryParams: props.queryParams,
      pathParams: props.pathParams
    })
    if (data) {
      unstable_batchedUpdates(() => {
        setInitLoading(false)
        setData(data)
        setError(null)
      })
    }
  } catch (e) {
    unstable_batchedUpdates(() => {
      setInitLoading(false)
      if (shouldShowError(e)) {
        setData(null)
        setError(e)
      }
    })
  }
}

export function useMutateAsGet<
  TData = any,
  TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TRequestBody = any,
  TPathParams = unknown
>(
  useMutateWrapper: UseMutateWrapper<TData, TError, TRequestBody, TQueryParams, TPathParams>,
  props: WrappedUseMutateProps<TData, TError, TRequestBody, TQueryParams, TPathParams>
): UseMutateAsGetReturn<TData, TError, TQueryParams, TRequestBody, TPathParams> {
  const [data, setData] = useState<TData | null>(null)
  const [initLoading, setInitLoading] = useState(!props.lazy)
  const [error, setError] = useState<GetDataError<TError> | null>(null)
  const { mutate, loading, cancel } = useMutateWrapper(props)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(
    typeof props.debounce === 'object'
      ? debounce(_fetchData, props.debounce.wait, props.debounce.options)
      : typeof props.debounce === 'number'
      ? debounce(_fetchData, props.debounce)
      : props.debounce
      ? debounce(_fetchData)
      : _fetchData,
    [props.debounce]
  )

  // Cancel fetchData on unmount (if debounce)
  useEffect(() => (isCancellable(fetchData) ? () => fetchData.cancel() : undefined), [fetchData])

  useDeepCompareEffect(() => {
    if (!props.lazy && !props.mock) {
      try {
        fetchData(mutate, props, setInitLoading, setData, setError)?.then(identity, e => {
          unstable_batchedUpdates(() => {
            setInitLoading(false)
            if (shouldShowError(e)) {
              setError(e)
            }
          })
        })
      } catch (e) {
        unstable_batchedUpdates(() => {
          setInitLoading(false)
          if (shouldShowError(e)) {
            setError(e)
          }
        })
      }
    }

    return () => {
      cancel?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.lazy, props.body, props.queryParams, props.pathParams, props.base, props.mock])

  return {
    data,
    ...props.mock,
    initLoading,
    loading,
    error,
    cancel,
    refetch: newProps => {
      try {
        return fetchData(mutate, newProps || props, setInitLoading, setData, setError)?.then(identity, e => {
          if (shouldShowError(e)) setError(e)
        })
      } catch (e) {
        if (shouldShowError(e)) {
          setError(e)
        }
      }
    }
  }
}
