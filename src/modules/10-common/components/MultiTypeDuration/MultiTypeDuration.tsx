/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormGroup, IFormGroupProps, Intent, InputGroup, IInputGroupProps, HTMLInputProps } from '@blueprintjs/core'
import { connect, FormikContextType } from 'formik'
import {
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  MultiTypeInputValue,
  FixedTypeComponentProps,
  DurationInputHelpers,
  parseStringToTime,
  timeToDisplayText,
  getMultiTypeFromValue,
  MultiTypeInputType,
  DataTooltipInterface,
  HarnessDocTooltip,
  FormError,
  FormikTooltipContext
} from '@wings-software/uicore'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import { errorCheck } from '@common/utils/formikHelpers'
import { getDurationValidationSchema, isValidTimeString } from './helper'
import css from './MultiTypeDuration.module.scss'

function MultiTypeDurationFixedTypeComponent(
  props: FixedTypeComponentProps & MultiTypeDurationProps['inputGroupProps']
): React.ReactElement {
  const { onChange, value, disabled, ...inputGroupProps } = props

  return (
    <InputGroup
      fill
      {...inputGroupProps}
      disabled={disabled}
      value={value as string}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event.target.value, MultiTypeInputValue.STRING, MultiTypeInputType.FIXED)
      }}
    />
  )
}

interface MultiTypeDurationConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeDurationProps
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  inputGroupProps?: Omit<IInputGroupProps & HTMLInputProps, 'onChange' | 'value'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeDurationConfigureOptionsProps
}

export function MultiTypeDuration(props: MultiTypeDurationProps): React.ReactElement {
  const {
    name,
    value,
    onChange,
    enableConfigureOptions = true,
    configureOptionsProps,
    inputGroupProps,
    ...rest
  } = props

  const { getString } = useStrings()

  const expressionAndRuntimeTypeComponent = (
    <ExpressionAndRuntimeType
      name={name}
      value={value}
      onChange={onChange}
      style={{ flexGrow: 1 }}
      {...rest}
      fixedTypeComponentProps={inputGroupProps}
      fixedTypeComponent={MultiTypeDurationFixedTypeComponent}
    />
  )

  return (
    <>
      {enableConfigureOptions ? (
        <div className={css.container}>
          {expressionAndRuntimeTypeComponent}
          {getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={value as string}
              type={getString('string')}
              variableName={name}
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={val => onChange?.(val, MultiTypeInputValue.STRING, MultiTypeInputType.RUNTIME)}
              style={{ marginLeft: 'var(--spacing-medium)' }}
              {...configureOptionsProps}
              isReadonly={props.disabled}
            />
          )}
        </div>
      ) : (
        expressionAndRuntimeTypeComponent
      )}
    </>
  )
}

export interface FormMultiTypeDurationProps extends Omit<IFormGroupProps, 'label' | 'placeholder'> {
  label: string | React.ReactElement
  name: string
  placeholder?: string
  formik?: FormikContextType<unknown>
  skipErrorsIf?(formik?: FormikContextType<unknown>): boolean
  multiTypeDurationProps?: Omit<MultiTypeDurationProps, 'name' | 'onChange' | 'value'>
  onChange?: MultiTypeDurationProps['onChange']
  tooltipProps?: DataTooltipInterface
  isOptional?: boolean
}

export function FormMultiTypeDuration(props: FormMultiTypeDurationProps): React.ReactElement {
  const {
    label,
    multiTypeDurationProps,
    formik,
    name,
    onChange,
    skipErrorsIf,
    isOptional = false,
    ...restProps
  } = props
  const { getString } = useStrings()
  const optionalLabel = getString('common.optionalLabel')
  const labelText = !isOptional ? label : `${label} ${optionalLabel}`
  const hideErrors = typeof skipErrorsIf === 'function' ? skipErrorsIf(formik) : false
  const hasError = !hideErrors && errorCheck(name, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    disabled,
    tooltipProps,
    ...rest
  } = restProps

  const value: string = get(formik?.values, name, '')
  const handleChange: MultiTypeDurationProps['onChange'] = React.useCallback(
    (val, valueType, type) => {
      const correctVal =
        type === MultiTypeInputType.FIXED && typeof val === 'string'
          ? val.replace(DurationInputHelpers.TEXT_LIMIT_REGEX, '')
          : val
      formik?.setFieldValue(name, correctVal)
      formik?.setFieldTouched(name, true, false)
      onChange?.(correctVal, valueType, type)
    },
    [formik?.setFieldTouched, formik?.setFieldValue, name, onChange]
  )

  const handleBlur = (): void => {
    formik?.setFieldTouched(name, true, false)

    if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED || !isValidTimeString(value)) {
      return
    }

    const time = parseStringToTime(value)
    const strVal = timeToDisplayText(time)

    formik?.setFieldValue(name, strVal)
  }

  const customProps: MultiTypeDurationProps = {
    ...multiTypeDurationProps,
    name,
    inputGroupProps: {
      placeholder: 'Enter w/d/h/m/s/ms',
      ...multiTypeDurationProps?.inputGroupProps,
      name,
      onBlur: handleBlur
    }
  }
  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')
  return (
    <FormGroup
      {...rest}
      labelFor={name}
      helperText={helperText}
      intent={intent}
      disabled={disabled}
      label={labelText ? <HarnessDocTooltip tooltipId={dataTooltipId} labelText={labelText} /> : labelText}
    >
      <MultiTypeDuration {...customProps} value={value} onChange={handleChange} disabled={disabled} />
    </FormGroup>
  )
}

export const FormMultiTypeDurationField = connect(FormMultiTypeDuration)

export { getDurationValidationSchema, isValidTimeString }

export interface DurationInputForInputSetProps extends Omit<IFormGroupProps, 'label' | 'placeholder'> {
  onChange?(str: string): void
  name: string
  label?: React.ReactNode
  inputProps?: Omit<IInputGroupProps & HTMLInputProps, 'onChange' | 'value'>
}

export interface ConnectedDurationInputForInputSetProps extends DurationInputForInputSetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikContextType<any>
}

export function DurationInputForInputSet(props: ConnectedDurationInputForInputSetProps): React.ReactElement {
  const { formik, onChange, name, label, inputProps, ...restProps } = props

  const hasError = errorCheck(name, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    disabled,
    ...rest
  } = restProps

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const correctVal = e.currentTarget.value.replace(DurationInputHelpers.TEXT_LIMIT_REGEX, '')
    formik.setFieldValue(e.currentTarget.name, correctVal)
    onChange?.(correctVal)
  }

  return (
    <FormGroup {...rest} labelFor={name} helperText={helperText} intent={intent} disabled={disabled} label={label}>
      <InputGroup
        fill
        placeholder="Enter w/d/h/m/s/ms"
        {...inputProps}
        disabled={disabled}
        name={name}
        intent={intent}
        value={get(formik.values, name)}
        onChange={handleChange}
        onBlur={formik.handleBlur}
      />
    </FormGroup>
  )
}

export const DurationInputFieldForInputSet = connect<DurationInputForInputSetProps>(DurationInputForInputSet)
