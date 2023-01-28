/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import qs from 'qs'
import type { IStringifyOptions } from 'qs'

import { useQueryParams } from './useQueryParams'

export interface UseUpdateQueryParamsReturn<T> {
  updateQueryParams(values: T, options?: IStringifyOptions, replaceHistory?: boolean): void
  replaceQueryParams(values: T, options?: IStringifyOptions, replaceHistory?: boolean): void
}

export function useUpdateQueryParams<T = Record<string, string>>(): UseUpdateQueryParamsReturn<T> {
  const { pathname } = useLocation()
  const { push, replace } = useHistory()
  const queryParams = useQueryParams<T>()

  // queryParams, pathname are stored in refs so that
  // updateQueryParams/replaceQueryParams can be memoized without changing too often
  const ref = useRef({ queryParams, pathname })
  useEffect(() => {
    ref.current = {
      queryParams,
      pathname
    }
  }, [queryParams, pathname])

  return {
    updateQueryParams: useCallback(
      (values: T, options?: IStringifyOptions, replaceHistory?: boolean): void => {
        const path = `${ref.current.pathname}?${qs.stringify({ ...ref.current.queryParams, ...values }, options)}`
        replaceHistory ? replace(path) : push(path)
      },
      [push, replace]
    ),
    replaceQueryParams: useCallback(
      (values: T, options?: IStringifyOptions, replaceHistory?: boolean): void => {
        const path = `${ref.current.pathname}?${qs.stringify(values, options)}`
        replaceHistory ? replace(path) : push(path)
      },
      [push, replace]
    )
  }
}
