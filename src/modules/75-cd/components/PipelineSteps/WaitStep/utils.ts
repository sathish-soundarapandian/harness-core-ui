/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { compact, get, isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

export const getErrorMessage = (error: any): string =>
  get(error, 'data.error', get(error, 'data.message', /* istanbul ignore next */ error?.message))

export function getPolicySetValidationSchema({
  minimumErrorMessage,
  invalidErrorMessage
}: {
  minimumErrorMessage: string
  invalidErrorMessage: string
}) {
  return Yup.mixed().test({
    test(value: string | string[]): boolean | Yup.ValidationError {
      if (Array.isArray(value)) {
        if (value.length && !isEmpty(compact(value))) {
          return true
        } else {
          // if array length is 0 then create error
          return this.createError({ message: minimumErrorMessage })
        }
      } else {
        // if type is not array and value is not <+input>, then create error
        if (getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME) {
          return true
        } else {
          return this.createError({ message: invalidErrorMessage })
        }
      }
    }
  })
}
