/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties, ReactChild } from 'react'
import {
  MultiTypeInputType,
  getMultiTypeFromValue,
  RUNTIME_INPUT_VALUE,
  FormError,
  FormikTooltipContext,
  DataTooltipInterface,
  HarnessDocTooltip,
  FormInput,
  EXECUTION_TIME_INPUT_VALUE,
  AllowedTypes,
  AllowedTypesWithExecutionTime,
  Layout
} from '@harness/uicore'
import { IFormGroupProps, Intent, FormGroup } from '@blueprintjs/core'
import cx from 'classnames'
import { FormikContextType, connect } from 'formik'
import { get } from 'lodash-es'
import { errorCheck } from '@common/utils/formikHelpers'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeSelectorButton from '../MultiTypeSelectorButton/MultiTypeSelectorButton'

import css from './MultiTypeFieldSelctor.module.scss'

export interface MultiTypeFieldSelectorProps extends Omit<IFormGroupProps, 'label' | 'placeholder'> {
  children: Exclude<React.ReactNode, null | undefined>
  name: string
  label: string | ReactChild
  defaultValueToReset?: unknown
  style?: CSSProperties
  disableTypeSelection?: boolean
  skipRenderValueInExpressionLabel?: boolean
  expressionRender?(): React.ReactNode
  allowedTypes?: AllowedTypes
  isOptional?: boolean
  optionalLabel?: string
  tooltipProps?: DataTooltipInterface
  disableMultiSelectBtn?: boolean
  onTypeChange?: (type: MultiTypeInputType) => void
  hideError?: boolean
  supportListOfExpressions?: boolean
  enableConfigureOptions?: boolean
  configureOptionsProps?: Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'>
}

export interface ConnectedMultiTypeFieldSelectorProps extends MultiTypeFieldSelectorProps {
  formik: FormikContextType<any>
}

export function MultiTypeFieldSelector(props: ConnectedMultiTypeFieldSelectorProps): React.ReactElement | null {
  const {
    formik,
    label,
    name,
    children,
    defaultValueToReset,
    disableTypeSelection,
    allowedTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
    expressionRender,
    skipRenderValueInExpressionLabel,
    isOptional,
    disableMultiSelectBtn,
    hideError,
    optionalLabel = '(optional)',
    onTypeChange,
    supportListOfExpressions,
    enableConfigureOptions = false,
    configureOptionsProps,
    ...restProps
  } = props
  const error = get(formik?.errors, name)
  const hasError = errorCheck(name, formik) && typeof error === 'string'
  const showError = hasError && !hideError
  const labelText = !isOptional ? label : `${label} ${optionalLabel}`
  const {
    intent = showError ? Intent.DANGER : Intent.NONE,
    helperText = showError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    disabled,
    ...rest
  } = restProps

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')

  const value: string = get(formik?.values, name, '')

  const [type, setType] = React.useState(getMultiTypeFromValue(value, allowedTypes, supportListOfExpressions))

  function handleChange(newType: MultiTypeInputType): void {
    setType(newType)
    onTypeChange?.(newType)

    if (newType === type) {
      return
    }

    const runtimeValue =
      Array.isArray(allowedTypes) &&
      (allowedTypes as AllowedTypesWithExecutionTime[]).includes(MultiTypeInputType.EXECUTION_TIME)
        ? EXECUTION_TIME_INPUT_VALUE
        : RUNTIME_INPUT_VALUE
    formik.setFieldValue(name, isMultiTypeRuntime(newType) ? runtimeValue : defaultValueToReset)
  }

  if (
    isMultiTypeRuntime(type) &&
    !isMultiTypeRuntime(getMultiTypeFromValue(value, allowedTypes, supportListOfExpressions))
  ) {
    return null
  }

  return (
    <FormGroup
      {...rest}
      className={cx({ [css.formGroup]: isMultiTypeRuntime(type) })}
      labelFor={name}
      helperText={helperText}
      intent={intent}
      disabled={disabled}
      label={
        <div className={css.formLabel}>
          <HarnessDocTooltip tooltipId={dataTooltipId} labelText={labelText} />
          {disableTypeSelection ? null : (
            <MultiTypeSelectorButton
              allowedTypes={allowedTypes}
              type={type}
              onChange={handleChange}
              disabled={disableMultiSelectBtn}
            />
          )}
        </div>
      }
    >
      {disableTypeSelection || type === MultiTypeInputType.FIXED ? (
        children
      ) : type === MultiTypeInputType.EXPRESSION && typeof expressionRender === 'function' ? (
        expressionRender()
      ) : isMultiTypeRuntime(type) && typeof value === 'string' ? (
        <Layout.Horizontal spacing={'medium'}>
          <FormInput.Text style={{ flexGrow: 1 }} className={css.runtimeDisabled} name={name} disabled label="" />
          {enableConfigureOptions && (
            <ConfigureOptions
              value={value}
              type={'String'}
              variableName={name}
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={val => formik?.setFieldValue(name, val)}
              style={{ marginTop: 'var(--spacing-2)' }}
              {...configureOptionsProps}
              isReadonly={disabled}
            />
          )}
        </Layout.Horizontal>
      ) : null}
    </FormGroup>
  )
}

export default connect<MultiTypeFieldSelectorProps>(MultiTypeFieldSelector)
