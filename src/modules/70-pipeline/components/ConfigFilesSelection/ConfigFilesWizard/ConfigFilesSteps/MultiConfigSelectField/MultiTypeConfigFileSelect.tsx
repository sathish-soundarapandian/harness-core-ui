/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CSSProperties, ReactChild } from 'react';
import React from 'react'
import type {
  AllowedTypes,
  DataTooltipInterface} from '@harness/uicore';
import {
  Container,
  EXECUTION_TIME_INPUT_VALUE,
  FormikTooltipContext,
  FormInput,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import type { IFormGroupProps} from '@blueprintjs/core';
import { Intent, FormGroup } from '@blueprintjs/core'
import type { FormikContextType} from 'formik';
import { connect } from 'formik'
import cx from 'classnames'
import { get } from 'lodash-es'
import { errorCheck } from '@common/utils/formikHelpers'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { isMultiTypeRuntime, isValueRuntimeInput } from '@common/utils/utils'

import css from './MultiConfigSelectField.module.scss'

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
  useExecutionTimeInput?: boolean
  isOptional?: boolean
  optionalLabel?: string
  tooltipProps?: DataTooltipInterface
  disableMultiSelectBtn?: boolean
  onTypeChange?: (type: MultiTypeInputType) => void
  hideError?: boolean
  supportListOfExpressions?: boolean
  index?: number
  defaultType?: string
  value?: string
  localId?: string
  changed?: boolean
  isFieldInput?: boolean
  hasParentValidation?: boolean
}

export interface ConnectedMultiTypeFieldSelectorProps extends MultiTypeFieldSelectorProps {
  formik: FormikContextType<any>
}

export function MultiTypeConfigFileSelect(props: ConnectedMultiTypeFieldSelectorProps): React.ReactElement | null {
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
    useExecutionTimeInput,
    hasParentValidation = false,
    defaultType,
    changed,
    localId,
    isFieldInput = false,
    ...restProps
  } = props
  const error = get(formik?.errors, name)
  const hasError = errorCheck(name, formik) && typeof error === 'string'
  const showError = hasError && !hideError
  const labelText = !isOptional ? label : `${label} ${optionalLabel}`
  const { intent = showError && !hasParentValidation ? Intent.DANGER : Intent.NONE, disabled, ...rest } = restProps

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')

  const value: string | string[] = get(formik?.values, name, defaultValueToReset)
  const [type, setType] = React.useState(getMultiTypeFromValue(value, allowedTypes, supportListOfExpressions))

  React.useEffect(() => {
    setType(getMultiTypeFromValue(value, allowedTypes, supportListOfExpressions))
  }, [changed, setType])

  function handleChange(newType: MultiTypeInputType): void {
    setType(newType)
    onTypeChange?.(newType)

    if (newType === type) {
      return
    }

    const runtimeValue = useExecutionTimeInput ? EXECUTION_TIME_INPUT_VALUE : RUNTIME_INPUT_VALUE
    formik.setFieldValue(name, isMultiTypeRuntime(newType) ? runtimeValue : defaultValueToReset)
  }

  if (
    (isMultiTypeRuntime(type) &&
      !isMultiTypeRuntime(getMultiTypeFromValue(value, allowedTypes, supportListOfExpressions))) ||
    (isValueRuntimeInput(value) && !isMultiTypeRuntime(type))
  ) {
    setType(getMultiTypeFromValue(value, allowedTypes, supportListOfExpressions))
  }

  return isFieldInput ? (
    <FormGroup
      {...rest}
      labelFor={name}
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
        <FormInput.Text className={css.runtimeDisabled} name={name} disabled label="" />
      ) : null}
    </FormGroup>
  ) : (
    <FormGroup
      {...rest}
      className={cx({ [css.formGroup]: isMultiTypeRuntime(type) })}
      intent={intent}
      disabled={disabled}
      label={
        <Container flex>
          <HarnessDocTooltip tooltipId={dataTooltipId} labelText={labelText} />
        </Container>
      }
    >
      <Container flex className={css.selectFieldContainer}>
        {disableTypeSelection || type === MultiTypeInputType.FIXED ? (
          children
        ) : type === MultiTypeInputType.EXPRESSION && typeof expressionRender === 'function' ? (
          expressionRender()
        ) : isMultiTypeRuntime(type) && typeof value === 'string' ? (
          <FormInput.Text className={css.runtimeDisabled} name={name} disabled label="" />
        ) : null}
        {disableTypeSelection ? null : (
          <Container flex className={css.multiSelectContainerWrapper}>
            <MultiTypeSelectorButton
              allowedTypes={allowedTypes}
              type={type}
              onChange={handleChange}
              disabled={disableMultiSelectBtn}
            />
          </Container>
        )}
      </Container>
    </FormGroup>
  )
}

export default connect<MultiTypeFieldSelectorProps>(MultiTypeConfigFileSelect)
