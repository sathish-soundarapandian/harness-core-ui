/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { FormikContextType, yupToFormErrors } from 'formik'
import { Button, ButtonVariation, FormInput, Layout, MultiSelectOption, SelectOption } from '@harness/uicore'
import { Position } from '@blueprintjs/core'
import { useStrings, String } from 'framework/strings'
import type { StringKeys } from 'framework/strings/StringsContext'
import { ALLOWED_VALUES_TYPE } from './constants'
import { VALIDATORS } from './validators'
import type { FormValues } from './ConfigureOptionsUtils'

import css from './ConfigureOptions.module.scss'

export interface AllowedValuesFieldsProps {
  showAdvanced: boolean
  formik: FormikContextType<FormValues>
  isReadonly: boolean
  fetchValues?: (done: (response: SelectOption[] | MultiSelectOption[]) => void) => void
  options: SelectOption[] | MultiSelectOption[]
  allowedValuesType?: ALLOWED_VALUES_TYPE
  allowedValuesValidator?: Yup.Schema<unknown>
}

interface RenderFieldProps {
  getString(key: StringKeys, vars?: Record<string, any>): string
  formik: FormikContextType<FormValues>
  isReadonly: boolean
  fetchValues?: (done: (response: SelectOption[] | MultiSelectOption[]) => void) => void
  options: SelectOption[] | MultiSelectOption[]
  allowedValuesType?: ALLOWED_VALUES_TYPE
  allowedValuesValidator?: Yup.Schema<unknown>
}

const renderField = ({
  fetchValues,
  getString,
  options,
  allowedValuesType,
  allowedValuesValidator,
  isReadonly,
  formik
}: RenderFieldProps) => {
  const { setErrors, errors, setFieldTouched, setFieldValue } = formik
  if (fetchValues) {
    return (
      <FormInput.MultiSelect
        items={options}
        label={getString('common.configureOptions.values')}
        name="allowedValues"
        disabled={isReadonly}
      />
    )
  }
  const extraProps = {
    tagsProps: {}
  }

  switch (allowedValuesType) {
    case ALLOWED_VALUES_TYPE.TIME: {
      extraProps.tagsProps = {
        onChange: (changed: unknown) => {
          const values: string[] = changed as string[]

          // There is only one value, and we are removing it
          if (!values.length) {
            setFieldTouched('allowedValues', true, false)
            setFieldValue('allowedValues', values)
            return
          }

          const validator = allowedValuesValidator || VALIDATORS[ALLOWED_VALUES_TYPE.TIME]({ minimum: '10s' })
          try {
            validator.validateSync({ timeout: values[values.length - 1] })
            setFieldTouched('allowedValues', true, false)
            setFieldValue('allowedValues', values)
          } catch (e) {
            /* istanbul ignore else */
            if (e instanceof Yup.ValidationError) {
              const err = yupToFormErrors<{ timeout: string }>(e)
              setErrors({ ...errors, allowedValues: err.timeout })
            }
          }
        }
      }
    }
  }

  return (
    <FormInput.KVTagInput
      label={getString('allowedValues')}
      name="allowedValues"
      isArray={true}
      disabled={isReadonly}
      {...extraProps}
    />
  )
}

export default function AllowedValuesFields(props: AllowedValuesFieldsProps): React.ReactElement {
  const { showAdvanced, isReadonly, fetchValues, options, allowedValuesType, allowedValuesValidator, formik } = props
  const values = formik.values
  const { getString } = useStrings()
  return (
    <div className={css.allowedOptions}>
      {showAdvanced ? (
        <span className={css.advancedBtn}>
          <Button
            variation={ButtonVariation.LINK}
            tooltip={
              values.isAdvanced ? undefined : (
                <Layout.Horizontal padding="medium">
                  <String stringID="common.configureOptions.advancedHelp" useRichText={true} />
                </Layout.Horizontal>
              )
            }
            tooltipProps={{ position: Position.RIGHT }}
            text={values.isAdvanced ? getString('common.configureOptions.returnToBasic') : getString('advancedTitle')}
            onClick={() => {
              formik.setFieldValue('isAdvanced', !values.isAdvanced)
            }}
            disabled={isReadonly}
          />
        </span>
      ) : /* istanbul ignore next */ null}
      {values.isAdvanced ? (
        <FormInput.TextArea
          name="advancedValue"
          label={getString('common.configureOptions.jexlLabel')}
          placeholder={getString('inputTypes.EXPRESSION')}
          disabled={isReadonly}
        />
      ) : (
        <>
          {renderField({
            fetchValues,
            getString,
            options,
            isReadonly,
            allowedValuesType,
            allowedValuesValidator,
            formik
          })}
        </>
      )}
    </div>
  )
}
