/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'

export const minimumHealthyPercentageSchema = (
  getString: UseStringsReturn['getString']
): Yup.Schema<number | undefined> => {
  return Yup.lazy((value: number): any => {
    /* istanbul ignore else */
    if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
      return Yup.mixed().test({
        test(): boolean | Yup.ValidationError {
          if (!value) {
            return true
          }
          if (value > 100) {
            return this.createError({ message: getString('cd.minimumHealthyPercentageMaxLimit') })
          }
          if (value < 0) {
            return this.createError({ message: getString('cd.minimumHealthyPercentageMinLimit') })
          }
          return true
        }
      })
    }
    return Yup.number()
  })
}

export const instanceWarmupSchema = (getString: UseStringsReturn['getString']): Yup.Schema<number | undefined> => {
  return Yup.lazy((value: number): any => {
    /* istanbul ignore else */
    if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
      return Yup.mixed().test({
        test(): boolean | Yup.ValidationError {
          if (!value) {
            return true
          }
          if (value < 0) {
            return this.createError({ message: getString('cd.instanceWarmupError') })
          }
          return true
        }
      })
    }
    return Yup.number()
  })
}
