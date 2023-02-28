/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect } from 'react'
import type { FormikContextType } from 'formik'
import { usePrevious } from '@common/hooks/usePrevious'

//
// Global onChange utility for Formik
// @see https://github.com/formium/formik/issues/1633#issuecomment-520121543
//

export interface FormikEffectOnChangeParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prevValues: Record<string, any>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextValues: Record<string, any>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikContextType<any>
}

export interface FormikEffectProps {
  onChange: ({ prevValues: prevValue, nextValues: nextValue, formik }: FormikEffectOnChangeParams) => void

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikContextType<any>
}

export const FormikEffect: React.FC<FormikEffectProps> = ({ onChange, formik }) => {
  const { values } = formik
  const prevValues = usePrevious(values)

  useEffect(() => {
    // Don't run effect on form init
    if (prevValues) {
      onChange({ prevValues, nextValues: values, formik })
    }
  }, [prevValues, values, formik, onChange])

  return null
}
