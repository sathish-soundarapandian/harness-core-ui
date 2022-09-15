/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import {
  DataTooltipInterface,
  errorCheck,
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  FormError,
  getMultiTypeFromValue,
  MultiSelectDropDown,
  MultiTypeInputType,
  MultiSelectDropDownProps,
  getFormFieldLabel
} from '@harness/uicore'
import { get } from 'lodash-es'
import cx from 'classnames'

import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'

import css from './MultiTypeMultiSelectDropDown.module.scss'

export interface FormMultiTypeMultiSelectDropDownProps extends Omit<IFormGroupProps, 'label'> {
  label: string
  name: string
  dropdownProps: Omit<MultiSelectDropDownProps, 'onChange' | 'value'>
  multiTypeProps?: Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps' | 'name'>
  tooltipProps?: DataTooltipInterface
  enableConfigureOptions?: boolean
  configureOptionsProps?: Omit<ConfigureOptionsProps, 'name' | 'type' | 'value' | 'onChange'>
}

export function FormMultiTypeMultiSelectDropDown(props: FormMultiTypeMultiSelectDropDownProps): React.ReactElement {
  const {
    label,
    dropdownProps,
    multiTypeProps,
    name,
    className = '',
    tooltipProps,
    enableConfigureOptions,
    configureOptionsProps,
    ...restProps
  } = props
  const { getString } = useStrings()
  const formik = useFormikContext()
  const hasError = errorCheck(name, formik)
  const value = get(formik.values, name)
  const [type, setType] = React.useState(getMultiTypeFromValue(value))

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    disabled,
    ...rest
  } = restProps

  const handleChange: ExpressionAndRuntimeTypeProps['onChange'] = (val, _, valueType) => {
    formik.setFieldValue(name, valueType === MultiTypeInputType.EXPRESSION ? '' : val)
    setType(valueType)
  }

  return (
    <FormGroup
      {...rest}
      label={getFormFieldLabel(label, name, { tooltipProps })}
      labelFor={name}
      className={cx(css.main, className)}
      helperText={helperText}
      intent={intent}
      disabled={disabled}
    >
      <ExpressionAndRuntimeType<MultiSelectDropDownProps>
        {...multiTypeProps}
        name={name}
        value={value}
        onChange={handleChange}
        multitypeInputValue={type}
        className={cx(css.multitype, multiTypeProps?.className, { [css.hasError]: hasError })}
        fixedTypeComponent={MultiSelectDropDown}
        fixedTypeComponentProps={{ ...dropdownProps, value, className: cx(css.dropdown, dropdownProps.className) }}
      />
      {enableConfigureOptions && getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME ? (
        <ConfigureOptions value={value} variableName={name} type={getString('service')} {...configureOptionsProps} />
      ) : null}
    </FormGroup>
  )
}
