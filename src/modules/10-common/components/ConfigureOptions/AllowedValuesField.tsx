/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, FormInput, Layout, MultiSelectOption, SelectOption } from '@harness/uicore'
import { Position } from '@blueprintjs/core'
import { useStrings, String } from 'framework/strings'
import type { StringKeys } from 'framework/strings/StringsContext'
import type { FormValues } from './ConfigureOptionsUtils'
import type { FormikContextType } from 'formik'

import css from './ConfigureOptions.module.scss'
import { isValidTimeString } from '@common/components/MultiTypeDuration/MultiTypeDuration'

export enum OPTIONS_TYPE {
  TIME = 'TIME'
}

export interface AllowedValuesFieldsProps {
  showAdvanced: boolean
  formik: FormikContextType<FormValues>
  isReadonly: boolean
  fetchValues?: (done: (response: SelectOption[] | MultiSelectOption[]) => void) => void
  options: SelectOption[] | MultiSelectOption[]
  optionsType?: OPTIONS_TYPE
}

// const PickProps = 'fetchValues' | 'options' | 'isReadonly'

// type RenderFieldProps = Pick<AllowedValuesFieldsProps, PickProps>
// extends Omit<AllowedValuesFieldsProps, 'values' | 'showAdvanced' | 'setFieldValue'>
interface RenderFieldProps {
  getString(key: StringKeys, vars?: Record<string, any>): string
  formik: FormikContextType<FormValues>
  isReadonly: boolean
  fetchValues?: (done: (response: SelectOption[] | MultiSelectOption[]) => void) => void
  options: SelectOption[] | MultiSelectOption[]
  optionsType?: string
}

const renderField = ({ fetchValues, getString, options, optionsType, isReadonly, formik }: RenderFieldProps) => {
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
  {
    /** todo */
  }
  console.log('optionsType', optionsType)

  const extraProps = {}

  switch (optionsType) {
    case OPTIONS_TYPE.TIME: {
      extraProps.tagsProps = {
        onChange: (changed: unknown) => {
          const values: string[] = changed as string[]
          console.log('values on Change', values)
          const isInvalid = values.some(val => !isValidTimeString(val))
          if (isInvalid) {
            // error
            setErrors({ ...errors, allowedValues: 'Invalid format' })
          } else {
            setFieldTouched('allowedValues', true, false)
            setFieldValue('allowedValues', values)
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
  const { showAdvanced, isReadonly, fetchValues, options, optionsType, formik } = props
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
            optionsType,
            formik
          })}
        </>
      )}
    </div>
  )
}
