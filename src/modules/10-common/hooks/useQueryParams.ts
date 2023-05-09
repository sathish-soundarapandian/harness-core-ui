/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import qs from 'qs'
import type { IParseOptions } from 'qs'
import { assignWith, get, isNil, set } from 'lodash-es'

export interface UseQueryParamsOptions<T> extends IParseOptions {
  processQueryParams?(data: any): T
}

export function useQueryParams<T = unknown>(options?: UseQueryParamsOptions<T>): T {
  const { search } = useLocation()

  const queryParams = React.useMemo(() => {
    const params = qs.parse(search, { ignoreQueryPrefix: true, ...options })

    if (typeof options?.processQueryParams === 'function') {
      return options.processQueryParams(params)
    }

    return params
  }, [search, options, options?.processQueryParams])

  return queryParams as unknown as T
}

/**
 * By default, all values are parsed as strings by qs, except for arrays and objects
 * This is optional decoder that automatically transforms to numbers, booleans and null
 */
type CustomQsDecoder = (customQsDecoderOptions?: {
  parseNumbers?: boolean
  parseBoolean?: boolean
  ignoreNull?: boolean
  ignoreEmptyString?: boolean
}) => IParseOptions['decoder']

export const queryParamDecodeAll: CustomQsDecoder =
  ({ parseNumbers = true, parseBoolean = true, ignoreNull = true, ignoreEmptyString = true } = {}) =>
  (value, decoder) => {
    if (parseNumbers && /^(\d+|\d*\.\d+)$/.test(value)) {
      return parseFloat(value)
    }

    if (ignoreEmptyString && value.length === 0) {
      return
    }

    const keywords: Record<string, null | undefined> = {
      null: ignoreNull ? undefined : null,
      undefined: undefined
    }

    if (value in keywords) {
      return keywords[value]
    }

    const booleanKeywords: Record<string, boolean> = {
      true: true,
      false: false
    }

    if (parseBoolean && value in booleanKeywords) {
      return booleanKeywords[value]
    }

    return decoder(value)
  }

export const useQueryParamsOptions = <Q extends object, DKey extends keyof Q>(
  defaultParams: { [K in DKey]: NonNullable<Q[K]> }
): UseQueryParamsOptions<RequiredPick<Q, DKey>> => {
  const defaultParamsRef = useRef(defaultParams)
  useEffect(() => {
    defaultParamsRef.current = defaultParams
  }, [defaultParams])

  const options = useMemo(
    () => ({
      decoder: queryParamDecodeAll(),
      processQueryParams: (params: Q) => {
        const processedParams = { ...params }

        // if searchTerm is '123', queryParamDecodeAll converts it to the number 123
        // but searchTerm should remain a string
        if (!isNil(get(processedParams, 'searchTerm'))) {
          set(processedParams, 'searchTerm', get(processedParams, 'searchTerm').toString())
        }

        return assignWith(processedParams, defaultParamsRef.current, (objValue, srcValue) =>
          isNil(objValue) ? srcValue : objValue
        ) as RequiredPick<Q, DKey>
      }
    }),
    []
  )
  return options
}
