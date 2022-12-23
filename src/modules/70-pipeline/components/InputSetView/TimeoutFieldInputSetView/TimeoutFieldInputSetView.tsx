/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import classNames from 'classnames'
import {
  FormMultiTypeDurationField,
  FormMultiTypeDurationProps
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { shouldRenderRunTimeInputViewWithAllowedValues } from '@pipeline/utils/CIUtils'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useRenderMultiTypeInputWithAllowedValues } from '../utils/utils'
import css from '../InputSetView.module.scss'

interface TimeoutFieldInputSetViewProps extends Omit<FormMultiTypeDurationProps, 'label'> {
  label: string
  fieldPath: string
  template: any
}

export function TimeoutFieldInputSetView(props: TimeoutFieldInputSetViewProps): JSX.Element {
  const { template, fieldPath, ...rest } = props
  const { formik, name, label, placeholder, tooltipProps, multiTypeDurationProps, className, disabled } = rest
  const { enableConfigureOptions = true, configureOptionsProps } = multiTypeDurationProps || {}
  const value = get(formik?.values, name, '')

  const { getMultiTypeInputWithAllowedValues } = useRenderMultiTypeInputWithAllowedValues({
    name: name,
    labelKey: label,
    placeholderKey: placeholder,
    fieldPath: fieldPath,
    allowedTypes: defaultTo(multiTypeDurationProps?.allowableTypes, [MultiTypeInputType.FIXED]),
    template: template,
    readonly: disabled,
    tooltipProps: tooltipProps
  })

  if (shouldRenderRunTimeInputViewWithAllowedValues(fieldPath, template)) {
    return (
      <div className={classNames(css.fieldAndOptions, className)}>
        {getMultiTypeInputWithAllowedValues()}
        {enableConfigureOptions && getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={value}
            type={'String'}
            variableName={name}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={val => formik?.setFieldValue(name, val)}
            allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
            style={label ? { marginTop: 'var(--spacing-6)' } : undefined}
            {...configureOptionsProps}
            isExecutionTimeFieldDisabled
            isReadonly={disabled}
          />
        )}
      </div>
    )
  }

  return <FormMultiTypeDurationField {...rest} style={{ ...rest.style, width: '320px' }} />
}
