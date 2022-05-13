/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikContextType } from 'formik'
import { get, isPlainObject } from 'lodash-es'

/* _formSubmitCount is custom state var used to track submitCount.
 * enableReinitialize prop resets the submitCount, so error checks fail.
 * So either remove the prop (which will cause input set issues)
 * Or use this custom var for error checks.
 */

export const errorCheck = (name: string, formik?: FormikContextType<any> | any): boolean => {
  if (formik) {
    const { touched, submitCount, errors, _formSubmitCount } = formik

    return (
      (get(touched, name) || (submitCount && submitCount > 0) || (_formSubmitCount && _formSubmitCount > 0)) &&
      get(errors, name) &&
      !isPlainObject(get(errors, name))
    )
  }

  return false
}
