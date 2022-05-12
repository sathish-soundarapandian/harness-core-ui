/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { connect, FormikContextType } from 'formik'
import { filter, get } from 'lodash-es'
import { Container, ExpressionAndRuntimeType, MultiTypeInputType } from '@wings-software/uicore'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import multiBtnCss from '@common/components/MultiTypeTextArea/MultiTypeTextArea.module.scss'
import css from './MultiTypeExecutionCondition.module.scss'

interface MultiTypeExecutionConditionProps {
  path: string
  allowableTypes?: MultiTypeInputType[]
  formik?: FormikContextType<any>
  isInputDisabled?: boolean
  readonly?: boolean
  multiType?: MultiTypeInputType
  setMultiType?: (multiType: MultiTypeInputType) => void
  expressions: string[]
}

function MultiTypeMonacoTextFieldFixedTypeComponent(props: {
  readonly: boolean
  name: string
  expressions: string[]
}): React.ReactElement {
  const { readonly, name, expressions } = props

  return (
    <Container style={{ flexGrow: 1 }}>
      <MonacoTextField name={name} expressions={expressions} disabled={readonly} />
    </Container>
  )
}

function MultiTypeExecutionConditionInternal(props: MultiTypeExecutionConditionProps) {
  const { path, formik, allowableTypes, isInputDisabled, readonly, multiType, setMultiType, expressions } = props

  const conditionValue = get(formik?.values, path)
  const allowableTypesExceptExpression = filter(allowableTypes, type => type !== MultiTypeInputType.EXPRESSION)

  return (
    <Container className={cx(css.conditionInputContainer)}>
      <ExpressionAndRuntimeType
        name={path}
        value={conditionValue}
        fixedTypeComponentProps={{
          readonly: !!isInputDisabled,
          name: path,
          expressions: expressions
        }}
        fixedTypeComponent={MultiTypeMonacoTextFieldFixedTypeComponent}
        style={{ flexGrow: 1 }}
        allowableTypes={allowableTypesExceptExpression}
        onChange={val => formik?.setFieldValue(path, val)}
        onTypeChange={setMultiType}
        btnClassName={multiType === MultiTypeInputType.FIXED ? multiBtnCss.multiButtonForFixedType : ''}
        multitypeInputValue={multiType}
        disabled={readonly}
      />
    </Container>
  )
}

export const MultiTypeExecutionCondition = connect(MultiTypeExecutionConditionInternal)
