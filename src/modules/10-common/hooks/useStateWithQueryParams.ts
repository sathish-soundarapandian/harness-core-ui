/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState } from 'react'
import type { IParseOptions } from 'qs'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'

export interface UseSyncQueryParamsOptions extends IParseOptions {
  key: string
  defaultVal?: string
}

export function useStateWithQueryParams(options: UseSyncQueryParamsOptions): [string, (v: string) => void] {
  const { key, defaultVal = '' } = options
  const qp = useQueryParams<Record<string, string>>()
  const valueFromQP = qp[key]
  // In a race between queryParams and "defaultVal", queryParams (i.e. what is visible to the user) take precedence
  const [stateVal, setStateVal] = useState<string>(valueFromQP || defaultVal)
  const { updateQueryParams } = useUpdateQueryParams()

  useEffect(() => {
    if (valueFromQP) {
      setStateVal(valueFromQP)
    }
  }, [valueFromQP])

  useEffect(() => {
    if (!valueFromQP && stateVal && valueFromQP !== stateVal) {
      updateQueryParams({ [key]: stateVal }, { skipNulls: true })
    }
  }, [valueFromQP, stateVal, setStateVal, updateQueryParams, key])

  const setVal = (newVal: string): void => {
    updateQueryParams({ [key]: newVal }, { skipNulls: true })
    setStateVal(newVal)
  }

  return [stateVal, setVal]
}
