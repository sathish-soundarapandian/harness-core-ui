/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IFormGroupProps } from '@blueprintjs/core'
import { connect, FormikContextType } from 'formik'
import {
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  MultiTextInputProps,
  DataTooltipInterface,
  HarnessDocTooltip
} from '@wings-software/uicore'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'

// TODO: Need to import from uikit but right now it is not being exported from there
// Also, we need to make field label to be a type of string | ReactElement because sometimes we need to pass an element
interface MultiTextTypeInputProps extends Omit<IFormGroupProps, 'label' | 'labelFor'> {
  name: string
  label: string
  placeholder?: string
  onChange?: MultiTextInputProps['onChange']
  multiTextInputProps?: Omit<MultiTextInputProps, 'name'>
  textProps?: { type?: string }
}

interface MultiTypeTextConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeTextProps {
  className?: string
  name: string
  label: string | React.ReactElement
  formik?: FormikContextType<any>
  multiTextInputProps?: Omit<MultiTextTypeInputProps, 'name' | 'label'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeTextConfigureOptionsProps
  style?: React.CSSProperties
  tooltipProps?: DataTooltipInterface
}

export function MultiTypeText(props: MultiTypeTextProps): React.ReactElement {
  const {
    className,
    label,
    name,
    formik,
    multiTextInputProps,
    enableConfigureOptions = true,
    configureOptionsProps,
    style,
    tooltipProps
  } = props

  const value = get(formik?.values, name, '')

  const { getString } = useStrings()

  return (
    <div className={className} style={style}>
      {label ? <HarnessDocTooltip tooltipId={tooltipProps?.dataTooltipId} labelText={label} /> : label}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FormInput.MultiTextInput
          name={name}
          label=""
          style={{ marginBottom: 0, flexGrow: 1 }}
          {...multiTextInputProps}
        />
        {enableConfigureOptions && getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={value}
            type={getString('string')}
            variableName={name}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={val => formik?.setFieldValue(name, val)}
            style={{ marginLeft: 'var(--spacing-medium)', marginBottom: 12 }}
            {...configureOptionsProps}
            isReadonly={multiTextInputProps?.disabled}
          />
        )}
      </div>
    </div>
  )
}

export const MultiTypeTextField = connect(MultiTypeText)
