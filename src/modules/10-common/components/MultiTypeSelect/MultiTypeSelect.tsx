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
  MultiTypeInputProps,
  SelectOption
} from '@wings-software/uicore'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'

interface FormMultiTypeInputProps extends Omit<IFormGroupProps, 'labelFor'> {
  name: string
  label: string
  placeholder?: string
  selectItems: SelectOption[]
  multiTypeInputProps?: Omit<MultiTypeInputProps, 'name'>
}

interface MultiTypeSelectConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeSelectProps {
  className?: string
  name: string
  label: string | React.ReactElement
  formik?: FormikContextType<any>
  multiTypeInputProps: Omit<FormMultiTypeInputProps, 'name' | 'label'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeSelectConfigureOptionsProps
  style?: React.CSSProperties
  disabled?: boolean
  useValue?: boolean
}

export function MultiTypeSelect(props: MultiTypeSelectProps): React.ReactElement {
  const {
    className,
    label,
    name,
    formik,
    multiTypeInputProps,
    enableConfigureOptions = true,
    configureOptionsProps,
    style,
    disabled = false,
    useValue
  } = props

  const value = get(formik?.values, name, '')

  const { getString } = useStrings()

  return (
    <div className={className} style={style}>
      {label}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FormInput.MultiTypeInput
          name={name}
          label=""
          style={{ marginBottom: 0, flexGrow: 1 }}
          {...multiTypeInputProps}
          {...(useValue && { useValue: true })}
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
            isReadonly={disabled}
          />
        )}
      </div>
    </div>
  )
}

export const MultiTypeSelectField = connect(MultiTypeSelect)
