/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  AllowedTypes,
  Button,
  Container,
  FormikTooltipContext,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  Layout,
  MultiTextInput,
  MultiTypeInputType
} from '@harness/uicore'
import {
  FormGroup,
  HTMLInputProps,
  IFormGroupProps,
  IInputGroupProps,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Position
} from '@blueprintjs/core'
import { connect } from 'formik'
import { get, isNil } from 'lodash-es'
import * as Yup from 'yup'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { errorCheck } from '@common/utils/formikHelpers'

import {
  ALLOWED_VALUES_TYPE,
  ConfigureOptions,
  ConfigureOptionsProps
} from '@common/components/ConfigureOptions/ConfigureOptions'
import css from './InstanceDropdownField.module.scss'

export enum InstanceTypes {
  Percentage = 'Percentage',
  Count = 'Count'
}
export interface InstanceFieldValue {
  type: InstanceTypes
  spec: {
    value?: number | string
  }
}
export interface GetDurationValidationSchemaProps {
  maximum?: number
  required?: boolean
  requiredErrorMessage?: string
  minimumErrorMessage?: string
  maximumErrorMessage?: string
}

export function getInstanceDropdownSchema(
  props: GetDurationValidationSchemaProps = {},
  getString: UseStringsReturn['getString']
): Yup.ObjectSchema {
  const { maximum } = props
  if (maximum && typeof maximum !== 'number') {
    throw new Error(`Invalid format "${maximum}" provided for maximum value`)
  }
  return Yup.object({
    type: Yup.string().test({
      test(type: InstanceTypes): boolean | Yup.ValidationError {
        const { required = false } = props
        if (type === InstanceTypes.Count) {
          const value = this.parent?.spec?.value
          if (getMultiTypeFromValue(value as unknown as string) !== MultiTypeInputType.FIXED) {
            return true
          }
          if (required && isNil(value)) {
            return this.createError({
              message: getString('fieldRequired', { field: getString('cd.steps.tas.totalInstances') })
            })
          } else if (value < 0) {
            return this.createError({
              message: getString('common.instanceValidation.minimumCountInstance')
            })
          }
        } else if (type === InstanceTypes.Percentage) {
          const value = this.parent?.spec?.value
          if (required && isNil(value)) {
            return this.createError({
              message: getString('fieldRequired', { field: getString('cd.steps.tas.totalInstances') })
            })
          } else if (value < 0) {
            return this.createError({
              message: getString('cd.steps.tas.minimumCountPercentage')
            })
          } else if (value > 100) {
            return this.createError({
              message: getString('common.instanceValidation.maximumCountPercentage')
            })
          }
        }
        return true
      }
    })
  })
}
interface InstanceDropdownFieldProps extends Omit<IFormGroupProps, 'label' | 'placeholder'> {
  onChange?: (value: InstanceFieldValue) => void
  value: InstanceFieldValue
  label: string | JSX.Element
  expressions: string[]
  allowableTypes?: AllowedTypes
  disabledType?: boolean
  readonly?: boolean
  name: string
  textProps?: Omit<IInputGroupProps & HTMLInputProps, 'onChange' | 'value' | 'type' | 'placeholder'>
}

export const InstanceDropdownField: React.FC<InstanceDropdownFieldProps> = ({
  value,
  label,
  name,
  onChange,
  allowableTypes,
  expressions,
  disabledType = false,
  textProps,
  readonly,
  ...restProps
}): JSX.Element => {
  const { getString } = useStrings()
  const isPercentageType = value.type === InstanceTypes.Percentage
  const selectedText = isPercentageType
    ? getString('instanceFieldOptions.percentageText')
    : getString('instanceFieldOptions.instanceText')
  return (
    <FormGroup labelFor={name} label={label} className={css.formGroup} {...restProps}>
      <MultiTextInput
        name={`${name}.spec.value`}
        textProps={{
          type: 'number',
          placeholder: isPercentageType
            ? getString('instanceFieldOptions.percentagePlaceHolder')
            : getString('instanceFieldOptions.instanceHolder'),
          ...textProps,
          min: 1
        }}
        onChange={(val, _valType, typeInput) => {
          let finalValue: string | number | undefined
          if (typeInput === MultiTypeInputType.FIXED) {
            finalValue = val && typeof val === 'string' ? parseFloat(val) : undefined
          } else if (val) {
            finalValue = val as string
          }
          onChange?.({ ...value, spec: { value: finalValue } })
        }}
        expressions={expressions}
        allowableTypes={allowableTypes}
        disabled={readonly}
        key={isPercentageType ? 'percent' : 'count'}
        value={value.spec.value as unknown as string}
      />

      <Popover
        disabled={disabledType}
        content={
          <Menu className={css.popMenu}>
            <MenuItem
              text={getString('instanceFieldOptions.percentageText')}
              onClick={() => {
                onChange?.({ spec: { value: 100 }, type: InstanceTypes.Percentage })
              }}
              data-name="percentage"
              disabled={readonly}
            />
            <MenuItem
              text={getString('instanceFieldOptions.instanceText')}
              onClick={() => {
                onChange?.({ spec: { value: 1 }, type: InstanceTypes.Count })
              }}
              data-name="instances"
              disabled={readonly}
            />
          </Menu>
        }
        position={Position.BOTTOM}
        className={css.instancePopover}
      >
        <Button rightIcon="caret-down" disabled={disabledType} text={selectedText} minimal />
      </Popover>
    </FormGroup>
  )
}

export interface FormInstanceDropdownFieldProps extends Omit<InstanceDropdownFieldProps, 'value' | 'disabled'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: any
  readonly?: boolean
  enableConfigureOptions?: boolean
  configureOptionsProps?: Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'>
  defaultValue?: InstanceFieldValue
}

const defaultInitialValue = {
  type: InstanceTypes.Count,
  spec: { value: 0 }
}

const FormInstanceDropdownField: React.FC<FormInstanceDropdownFieldProps> = (props): JSX.Element => {
  const {
    label,
    textProps,
    formik,
    name,
    onChange = valueObj => {
      /* istanbul ignore next */
      props.formik.setFieldValue(props.name, { ...valueObj })
    },
    readonly,
    enableConfigureOptions = false,
    configureOptionsProps,
    defaultValue,
    ...restProps
  } = props
  const hasError = errorCheck(`${name}.type`, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? get(formik?.errors, `${name}.type`) : null,
    ...rest
  } = restProps

  const value: InstanceFieldValue = get(formik?.values, name, defaultValue || defaultInitialValue)
  const valueForConfigureOptions = value?.spec?.value as string

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId = tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : ''

  return (
    <Container>
      <Layout.Horizontal spacing={'medium'}>
        <InstanceDropdownField
          label={<HarnessDocTooltip tooltipId={dataTooltipId} labelText={label} />}
          name={name}
          textProps={{ ...textProps }}
          value={value}
          intent={intent}
          helperText={helperText}
          readonly={readonly}
          onChange={onChange}
          style={{ flexGrow: 1 }}
          {...rest}
        />
        {enableConfigureOptions && getMultiTypeFromValue(valueForConfigureOptions) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={valueForConfigureOptions}
            type="String"
            variableName={name}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={val => {
              formik?.setFieldValue(name, { ...value, spec: { value: val } })
            }}
            style={{ marginTop: 'var(--spacing-6)' }}
            allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
            {...configureOptionsProps}
            isReadonly={readonly}
          />
        )}
      </Layout.Horizontal>
    </Container>
  )
}

export const FormInstanceDropdown = connect(FormInstanceDropdownField)
