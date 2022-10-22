/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { noop } from 'lodash-es'
import { FormikContextType, yupToFormErrors } from 'formik'
import { Button, ButtonVariation, FormInput, Layout, MultiSelectOption } from '@harness/uicore'
import { Position } from '@blueprintjs/core'
import { useStrings, String } from 'framework/strings'
import type { StringKeys } from 'framework/strings/StringsContext'
import { ALLOWED_VALUES_TYPE } from './constants'
import { VALIDATORS } from './validators'
import type { AllowedValuesCustomComponentProps, FormValues } from './ConfigureOptionsUtils'

import css from './ConfigureOptions.module.scss'

export interface AllowedValuesFieldsProps {
  showAdvanced: boolean
  formik: FormikContextType<FormValues>
  isReadonly: boolean
  allowedValuesType?: ALLOWED_VALUES_TYPE
  allowedValuesValidator?: Yup.Schema<unknown>
  getAllowedValuesCustomComponent?: (
    allowedValuesCustomComponentProps: AllowedValuesCustomComponentProps
  ) => React.ReactElement
}

interface RenderFieldProps extends Omit<AllowedValuesFieldsProps, 'showAdvanced'> {
  getString(key: StringKeys, vars?: Record<string, any>): string
}

interface GetTagProps extends Omit<AllowedValuesFieldsProps, 'showAdvanced' | 'isReadonly'> {
  fieldKey: string
  inputValue: string
  setInputValue: any
}

const getTagProps = ({ formik, setInputValue, allowedValuesValidator, inputValue, fieldKey }: GetTagProps) => {
  const { setErrors, errors, setFieldTouched, setFieldValue } = formik
  return {
    onChange: (changed: unknown) => {
      const values: string[] = changed as string[]

      // There is only one value, and we are removing it
      /* istanbul ignore next */
      if (!values.length) {
        setFieldTouched('allowedValues', true, false)
        setFieldValue('allowedValues', values)
        return
      }

      try {
        allowedValuesValidator?.validateSync({ [fieldKey]: values[values.length - 1] })
        setFieldTouched('allowedValues', true, false)
        setFieldValue('allowedValues', values)
        setInputValue('')
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          setFieldTouched('allowedValues', true, false)
          // eslint-disable-next-line
          // @ts-ignore
          setErrors({ ...errors, allowedValues: err[fieldKey] as string })
          setInputValue(values[values.length - 1])
        }
      }
    },
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e?.target?.value || ''),
    inputValue
  }
}

export const RenderField = ({
  getString,
  allowedValuesType,
  allowedValuesValidator,
  isReadonly,
  formik,
  getAllowedValuesCustomComponent
}: RenderFieldProps) => {
  const [inputValue, setInputValue] = React.useState('')

  const extraProps = {
    tagsProps: {}
  }

  const onChange: (values: MultiSelectOption[]) => void = noop

  switch (allowedValuesType) {
    case ALLOWED_VALUES_TYPE.TIME: {
      extraProps.tagsProps = getTagProps({
        formik,
        inputValue,
        setInputValue,
        allowedValuesValidator: allowedValuesValidator || VALIDATORS[allowedValuesType]({ minimum: '10s' }),
        fieldKey: 'timeout'
      })
      break
    }

    case ALLOWED_VALUES_TYPE.URL: {
      extraProps.tagsProps = getTagProps({
        formik,
        inputValue,
        setInputValue,
        allowedValuesValidator: allowedValuesValidator || VALIDATORS[allowedValuesType](getString),
        fieldKey: 'url'
      })
      break
    }

    case ALLOWED_VALUES_TYPE.NUMBER: {
      extraProps.tagsProps = getTagProps({
        formik,
        inputValue,
        setInputValue,
        allowedValuesValidator: allowedValuesValidator || VALIDATORS[allowedValuesType](getString),
        fieldKey: 'numberTypeField'
      })
      break
    }
  }

  return (
    getAllowedValuesCustomComponent?.({ onChange }) ?? (
      <FormInput.KVTagInput
        label={getString('allowedValues')}
        name="allowedValues"
        isArray={true}
        disabled={isReadonly}
        {...extraProps}
      />
    )
  )
}

export default function AllowedValuesFields(props: AllowedValuesFieldsProps): React.ReactElement {
  const {
    showAdvanced,
    isReadonly,
    allowedValuesType,
    allowedValuesValidator,
    formik,
    getAllowedValuesCustomComponent
  } = props
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
        <RenderField
          getString={getString}
          isReadonly={isReadonly}
          allowedValuesType={allowedValuesType}
          allowedValuesValidator={allowedValuesValidator}
          getAllowedValuesCustomComponent={getAllowedValuesCustomComponent}
          formik={formik}
        />
      )}
    </div>
  )
}
