/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { FormGroup, IFormGroupProps, Intent, ITextAreaProps, TextArea } from '@blueprintjs/core'
import {
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  MultiTypeInputValue,
  FixedTypeComponentProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  DataTooltipInterface,
  HarnessDocTooltip,
  FormError,
  FormikTooltipContext,
  Container
} from '@wings-software/uicore'
import { connect } from 'formik'
import { get } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'

import { errorCheck } from '@common/utils/formikHelpers'

import css from './MultiTypeTextArea.module.scss'

function MultiTypeTextAreaFixedTypeComponent(
  props: FixedTypeComponentProps & MultiTypeTextAreaProps['textAreaProps']
): React.ReactElement {
  const { onChange, value, ...restProps } = props
  return (
    <TextArea
      growVertically={false}
      {...restProps}
      className={cx(css.input, restProps.className)}
      value={value as string}
      onInput={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event.target.value, MultiTypeInputValue.STRING, MultiTypeInputType.FIXED)
      }}
    />
  )
}

interface MultiTypeTextAreaConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeTextAreaProps
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  textAreaProps?: Omit<ITextAreaProps, 'onChange' | 'value'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeTextAreaConfigureOptionsProps
}

export const MultiTypeTextArea: React.FC<MultiTypeTextAreaProps> = props => {
  const { name, value, onChange, enableConfigureOptions = true, textAreaProps, configureOptionsProps, ...rest } = props
  const { getString } = useStrings()
  const [multiType, setMultiType] = useState<MultiTypeInputType>(getMultiTypeFromValue(value))

  const expressionAndRuntimeTypeComponent = (
    <ExpressionAndRuntimeType
      name={name}
      value={value}
      onChange={onChange}
      {...rest}
      fixedTypeComponentProps={textAreaProps}
      fixedTypeComponent={MultiTypeTextAreaFixedTypeComponent}
      style={{ flexGrow: 1 }}
      onTypeChange={setMultiType}
      btnClassName={multiType === MultiTypeInputType.FIXED ? css.multiButtonForFixedType : ''}
    />
  )
  return (
    <Container>
      {enableConfigureOptions ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {expressionAndRuntimeTypeComponent}
          {multiType === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={value as string}
              type={getString('string')}
              variableName={name}
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={val => onChange?.(val, MultiTypeInputValue.STRING, MultiTypeInputType.RUNTIME)}
              style={{ marginLeft: 'var(--spacing-medium)', marginBottom: 12 }}
              {...configureOptionsProps}
              isReadonly={props.disabled}
            />
          )}
        </div>
      ) : (
        expressionAndRuntimeTypeComponent
      )}
    </Container>
  )
}

export interface FormMultiTypeTextAreaProps extends Omit<IFormGroupProps, 'label' | 'placeholder'> {
  label: string | React.ReactElement
  name: string
  placeholder?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: any // TODO: Remove this but not sure why FormikContextType<any> was not working
  multiTypeTextArea?: Omit<MultiTypeTextAreaProps, 'name' | 'onChange'>
  onChange?: MultiTypeTextAreaProps['onChange']
  isOptional?: boolean
  tooltipProps?: DataTooltipInterface
}

export const FormMultiTypeTextArea: React.FC<FormMultiTypeTextAreaProps> = props => {
  const {
    label,
    multiTypeTextArea,
    placeholder,
    formik,
    name,
    onChange,
    isOptional = false,
    tooltipProps,
    ...restProps
  } = props
  const hasError = errorCheck(name, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    disabled,
    ...rest
  } = restProps

  const value: string = get(formik?.values, name, '')
  const customProps: MultiTypeTextAreaProps = {
    ...multiTypeTextArea,
    name,
    textAreaProps: {
      ...multiTypeTextArea?.textAreaProps,
      name,
      placeholder,
      onBlur: () => formik?.setFieldTouched(name)
    }
  }
  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')

  const labelToPass = isOptional ? `${label} (Optional)` : label
  return (
    <FormGroup
      {...rest}
      labelFor={name}
      helperText={helperText}
      intent={intent}
      disabled={disabled}
      label={labelToPass ? <HarnessDocTooltip tooltipId={dataTooltipId} labelText={labelToPass} /> : labelToPass}
    >
      <MultiTypeTextArea
        value={value}
        disabled={disabled}
        {...customProps}
        onChange={(val, valueType, type) => {
          formik?.setFieldValue(name, val)
          onChange?.(val, valueType, type)
        }}
      />
    </FormGroup>
  )
}

export const FormMultiTypeTextAreaField = connect(FormMultiTypeTextArea)
