/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'

export const EmailValidationSchema = (getString: UseStringsReturn['getString']): Yup.Schema<string | undefined> => {
  return Yup.lazy((value): Yup.Schema<string> => {
    /* istanbul ignore else */
    if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
      return Yup.string()
        .trim()
        .required(getString('common.validation.email.required'))
        .test(
          'email',
          getString('common.validation.email.format'),
          val =>
            val &&
            val.split(',').every((emailString: string) => {
              const emailStringTrim = emailString.trim()
              return emailStringTrim ? Yup.string().email().isValidSync(emailStringTrim) : false
            })
        )
    }
    /* istanbul ignore next */
    return Yup.string().required(getString('common.validation.email.required'))
  })
}

export const EmailValidationSchemaWithoutRequired = (
  getString: UseStringsReturn['getString']
): Yup.Schema<string | undefined> => {
  return Yup.lazy((value): Yup.Schema<string | undefined> => {
    /* istanbul ignore else */
    if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
      return Yup.string()
        .notRequired()
        .when('cc', {
          is: (emailValue: string) => emailValue?.length,
          then: (rule: any) =>
            rule
              .min(1)
              .trim()
              .test(
                'email',
                getString('common.validation.email.format'),
                (val: string) =>
                  val &&
                  val.split(',').every((emailString: string) => {
                    const emailStringTrim = emailString.trim()
                    return emailStringTrim ? Yup.string().email().isValidSync(emailStringTrim) : false
                  })
              )
        })
    }
    /* istanbul ignore next */
    return Yup.string().required(getString('common.validation.email.required'))
  })
}
