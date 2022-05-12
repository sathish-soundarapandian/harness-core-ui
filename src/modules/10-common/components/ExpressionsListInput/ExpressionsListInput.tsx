/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { connect, FormikContextType } from 'formik'
import { isEmpty } from 'lodash-es'
import { FormGroup } from '@blueprintjs/core'
import { ExpressionInput, EXPRESSION_INPUT_PLACEHOLDER } from '@wings-software/uicore'
import { ListInput } from '@common/components/ListInput/ListInput'

import css from './ExpressionsListInput.module.scss'

export interface ExpressionsListInputProps {
  name: string
  value: string[]
  readOnly?: boolean
  expressions?: string[]
  inputClassName?: string
  formik?: FormikContextType<any>
}

function ExpressionsListInputInternal(props: ExpressionsListInputProps) {
  const { name, value, readOnly, expressions = [], formik, inputClassName } = props

  // To initialize minimum one input row
  useEffect(() => {
    if (isEmpty(value)) {
      formik?.setFieldValue(name, [''])
    }
  }, [])

  return (
    <ListInput
      name={name}
      elementList={value}
      readOnly={readOnly}
      listItemRenderer={(str: string, index: number) => {
        const fieldName = `${name}.${index}`
        return (
          <FormGroup className={css.expressionsInputContainer}>
            <ExpressionInput
              name={fieldName}
              value={str}
              disabled={readOnly}
              inputProps={{ className: inputClassName, placeholder: EXPRESSION_INPUT_PLACEHOLDER }}
              items={expressions}
              onChange={val =>
                /* istanbul ignore next */
                formik?.setFieldValue(fieldName, val)
              }
            />
          </FormGroup>
        )
      }}
    />
  )
}

export const ExpressionsListInput = connect(ExpressionsListInputInternal)
