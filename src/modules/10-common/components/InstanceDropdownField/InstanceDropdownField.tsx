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
  FormikTooltipContext,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  MultiTextInput,
  MultiTypeInputType
} from '@wings-software/uicore'
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
// import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import css from './InstanceDropdownField.module.scss'

export enum InstanceTypes {
  Percentage = 'Percentage',
  Instances = 'Count'
}
export interface InstanceFieldValue {
  type: InstanceTypes
  spec: {
    percentage?: number | string
    count?: number | string
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
      test(val: InstanceTypes): boolean | Yup.ValidationError {
        const { maximumErrorMessage, minimumErrorMessage, required = false, requiredErrorMessage } = props
        let type: InstanceTypes | undefined = val
        if (isNil(val)) {
          if (!isNil(this.parent?.spec?.count)) {
            type = InstanceTypes.Instances
          } else if (!isNil(this.parent?.spec?.percentage)) {
            type = InstanceTypes.Percentage
          }
        }
        if (type === InstanceTypes.Instances) {
          const value = this.parent?.spec?.count
          if (getMultiTypeFromValue(value as unknown as string) !== MultiTypeInputType.FIXED) {
            return true
          }
          if (required && isNil(value)) {
            return this.createError({
              message: requiredErrorMessage || getString('common.instanceValidation.required')
            })
          } else if (value < 0) {
            return this.createError({
              message: minimumErrorMessage || getString('common.instanceValidation.minimumCountInstance')
            })
          } else if (maximum && value > maximum) {
            return this.createError({
              message: maximumErrorMessage || getString('common.instanceValidation.maximumCountInstance', { maximum })
            })
          }
        } else if (type === InstanceTypes.Percentage) {
          const value = this.parent?.spec?.percentage
          if (required && isNil(value)) {
            return this.createError({
              message: requiredErrorMessage || getString('common.instanceValidation.required')
            })
          } else if (value < 1) {
            return this.createError({
              message: minimumErrorMessage || getString('common.instanceValidation.minimumCountPercentage')
            })
          } else if (value > 100) {
            return this.createError({
              message: maximumErrorMessage || getString('common.instanceValidation.maximumCountPercentage')
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
  let isPercentageType = value.type === InstanceTypes.Percentage
  if (isNil(value.type)) {
    if (!isNil(value.spec.percentage)) {
      isPercentageType = true
    } else {
      isPercentageType = false
    }
  }
  const selectedText = isPercentageType
    ? getString('instanceFieldOptions.percentageText')
    : getString('instanceFieldOptions.instanceText')
  return (
    <FormGroup labelFor={name} label={label} className={css.formGroup} {...restProps}>
      <MultiTextInput
        name={`${name}.spec.${isPercentageType ? 'percentage' : 'count'}`}
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
          if (isPercentageType) {
            onChange?.({ ...value, spec: { percentage: finalValue } })
          } else {
            onChange?.({ ...value, spec: { count: finalValue } })
          }
        }}
        expressions={expressions}
        allowableTypes={allowableTypes}
        disabled={readonly}
        key={isPercentageType ? 'percent' : 'count'}
        value={(isPercentageType ? value.spec.percentage : value.spec.count) as unknown as string}
      />

      <Popover
        disabled={disabledType}
        content={
          <Menu className={css.popMenu}>
            <MenuItem
              text={getString('instanceFieldOptions.percentageText')}
              onClick={() => {
                onChange?.({ spec: { percentage: 100 }, type: InstanceTypes.Percentage })
              }}
              data-name="percentage"
              disabled={readonly}
            />
            <MenuItem
              text={getString('instanceFieldOptions.instanceText')}
              onClick={() => {
                onChange?.({ spec: { count: 1 }, type: InstanceTypes.Instances })
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
    ...restProps
  } = props
  const hasError = errorCheck(`${name}.type`, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? get(formik?.errors, `${name}.type`) : null,
    ...rest
  } = restProps

  const value: InstanceFieldValue = get(formik?.values, name, { type: InstanceTypes.Instances, spec: { count: 0 } })

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId = tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : ''

  return (
    <InstanceDropdownField
      label={<HarnessDocTooltip tooltipId={dataTooltipId} labelText={label} />}
      name={name}
      textProps={{ ...textProps }}
      value={value}
      intent={intent}
      helperText={helperText}
      readonly={readonly}
      onChange={onChange}
      {...rest}
    />
  )
}

export const FormInstanceDropdown = connect(FormInstanceDropdownField)
