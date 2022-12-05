/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'
import { get } from 'lodash-es'
import { FormGroup, IFormGroupProps, Intent, ITagInputProps, TagInput } from '@blueprintjs/core'
import cx from 'classnames'

import {
  Container,
  DataTooltipInterface,
  errorCheck,
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  FixedTypeComponentProps,
  FormError,
  getFormFieldLabel,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  MultiTypeInputValue
} from '@harness/uicore'
import type { KVTagInputProps } from '@harness/uicore/dist/components/FormikForm/FormikForm'

import { useStrings } from 'framework/strings'

import { ConfigureOptions, ConfigureOptionsProps } from '../ConfigureOptions/ConfigureOptions'

import css from './MultiTypeKVTagInput.module.scss'

interface KVTagInputFixedProps extends Omit<FixedTypeComponentProps, 'onChange'>, KVTagInputProps {
  isArray?: boolean
  onChange?(value: any, valueType?: MultiTypeInputValue, type?: MultiTypeInputType): void
}

type KVAccumulator = { [key: string]: string }

export function KVTagInputFixed(props: KVTagInputFixedProps): React.ReactElement {
  const formik = useFormikContext()
  const { name, isArray, tagsProps } = props

  const fieldValue = get(formik?.values, name)
  const [mentionsType] = React.useState(`kv-tag-input-${name}`)

  return (
    <TagInput
      values={
        isArray
          ? fieldValue || []
          : Object.keys(fieldValue || {}).map(key => {
              const value = fieldValue[key]
              return value ? `${key}:${value}` : key
            })
      }
      onChange={(changed: unknown) => {
        const values: string[] = changed as string[]
        formik?.setFieldTouched(name, true, false)
        formik?.setFieldValue(
          name,
          isArray
            ? values
            : values?.reduce((acc, tag) => {
                const parts = tag.split(':')
                acc[parts[0]] = parts[1]?.trim() || ''
                return acc
              }, {} as KVAccumulator) || {}
        )
      }}
      inputRef={input => {
        input?.setAttribute('data-mentions', mentionsType)
      }}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.keyCode === 13) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
      placeholder="Type and press enter to create a tag"
      {...tagsProps}
    />
  )
}

export interface FormMultiTypeKVTagInputProps extends Omit<IFormGroupProps, 'label'> {
  name: string
  label?: string
  tagsProps: Omit<ITagInputProps, 'onChange' | 'values'>
  multiTypeProps?: Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps' | 'name'>
  tooltipProps?: DataTooltipInterface
  enableConfigureOptions?: boolean
  configureOptionsProps?: Omit<ConfigureOptionsProps, 'name' | 'type' | 'value' | 'onChange'>
  onChange?: (value: string[]) => void
}

export function FormMultiTypeKVTagInput(props: FormMultiTypeKVTagInputProps): React.ReactElement {
  const {
    label,
    multiTypeProps,
    name,
    className = '',
    tooltipProps,
    enableConfigureOptions,
    configureOptionsProps,
    onChange,
    ...restProps
  } = props
  const { getString } = useStrings()
  const formik = useFormikContext()
  const hasError = errorCheck(name, formik)
  const value = get(formik.values, name)
  const [type, setType] = React.useState(getMultiTypeFromValue(value))

  useEffect(() => {
    setType(getMultiTypeFromValue(value))
  }, [value])

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    disabled,
    ...rest
  } = restProps

  const handleChange: ExpressionAndRuntimeTypeProps['onChange'] = val => {
    formik.setFieldValue(name, val)
  }

  function handleConfigChange(cvalue: string): void {
    formik.setFieldValue(name, cvalue)
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
      <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        <Container width={'100%'}>
          <ExpressionAndRuntimeType<KVTagInputProps>
            {...multiTypeProps}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            multitypeInputValue={type}
            className={cx(css.multitype, multiTypeProps?.className, { [css.hasError]: hasError })}
            fixedTypeComponent={KVTagInputFixed}
            fixedTypeComponentProps={{ ...props }}
          />
        </Container>
        {enableConfigureOptions && getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME ? (
          <ConfigureOptions
            value={value}
            variableName={name}
            type={getString('service')}
            onChange={handleConfigChange}
            {...configureOptionsProps}
          />
        ) : null}
      </Layout.Horizontal>
    </FormGroup>
  )
}
