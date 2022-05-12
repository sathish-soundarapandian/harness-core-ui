/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormGroup, ICheckboxProps, IFormGroupProps, Intent } from '@blueprintjs/core'
import {
  Checkbox,
  DataTooltipInterface,
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  FormError,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  MultiTypeInputType,
  MultiTypeInputValue,
  FormikTooltipContext
} from '@wings-software/uicore'
import cx from 'classnames'
import { get, isNil } from 'lodash-es'
import { connect } from 'formik'

import { errorCheck } from '@common/utils/formikHelpers'

import css from './MultiTypeCheckbox.module.scss'

export interface MultiTypeCheckboxProps
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  textboxProps?: Omit<ICheckboxProps, 'onChange'>
}

export const MultiTypeCheckbox: React.FC<MultiTypeCheckboxProps> = ({
  textboxProps,
  value = false,
  children,
  disabled,
  ...rest
}) => {
  const { className = '', ...restProps } = textboxProps || {}
  const fixedTypeComponent = React.useCallback(
    props => {
      const { onChange } = props
      return (
        <Checkbox
          className={cx(css.input, className)}
          disabled={disabled}
          {...restProps}
          checked={value as boolean}
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            onChange?.(event.currentTarget.checked, MultiTypeInputValue.STRING)
          }}
        >
          {children}
        </Checkbox>
      )
    },
    [value]
  )
  return (
    <ExpressionAndRuntimeType
      value={value as string}
      disabled={disabled}
      {...rest}
      fixedTypeComponent={fixedTypeComponent}
    />
  )
}

export interface FormMultiTypeTextboxProps extends Omit<IFormGroupProps, 'label'> {
  label: string
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: any // TODO: Remove this but not sure why FormikContextType<any> was not working
  multiTypeTextbox?: Omit<MultiTypeCheckboxProps, 'onChange' | 'name'>
  onChange?: MultiTypeCheckboxProps['onChange']
  setToFalseWhenEmpty?: boolean
  tooltipProps?: DataTooltipInterface
  defaultTrue?: boolean
}

export const FormMultiTypeCheckbox: React.FC<FormMultiTypeTextboxProps> = props => {
  const {
    label,
    multiTypeTextbox,
    formik,
    name,
    onChange,
    setToFalseWhenEmpty = false,
    defaultTrue = false,
    className = '',
    ...restProps
  } = props
  const hasError = errorCheck(name, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    disabled,
    tooltipProps,
    ...rest
  } = restProps

  const { textboxProps, ...restMultiProps } = multiTypeTextbox || {}
  const value: boolean = get(formik?.values, name, false)
  const [type, setType] = React.useState<MultiTypeInputType>(getMultiTypeFromValue(value))

  React.useEffect(() => {
    if (setToFalseWhenEmpty && get(formik?.values, name) === '') {
      formik?.setFieldValue(name, false)
    }
  }, [setToFalseWhenEmpty])

  React.useEffect(() => {
    if (defaultTrue) {
      formik?.setFieldValue(name, true)
    }
  }, [defaultTrue])

  const isFixedValue = type === MultiTypeInputType.FIXED
  const labelToBePassed = !isFixedValue ? label : undefined
  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')
  return (
    <FormGroup
      {...rest}
      label={
        labelToBePassed ? <HarnessDocTooltip tooltipId={dataTooltipId} labelText={labelToBePassed} /> : labelToBePassed
      }
      labelFor={name}
      className={cx(css.multiTypeCheckbox, className)}
      helperText={helperText}
      intent={intent}
      disabled={disabled}
    >
      <MultiTypeCheckbox
        name={name}
        textboxProps={{ name, label, disabled, ...textboxProps }}
        value={value}
        disabled={disabled}
        {...restMultiProps}
        onChange={(val, valueType, typeVal) => {
          if (typeVal === MultiTypeInputType.EXPRESSION && isNil(val)) {
            formik?.setFieldValue(name, '')
          } else {
            formik?.setFieldValue(name, val)
          }
          setType(typeVal)
          onChange?.(val, valueType, type)
        }}
      />
      {!labelToBePassed ? (
        <HarnessDocTooltip className={css.tooltip} tooltipId={dataTooltipId} labelText={labelToBePassed} />
      ) : null}
    </FormGroup>
  )
}
export const FormMultiTypeCheckboxField = connect(FormMultiTypeCheckbox)
