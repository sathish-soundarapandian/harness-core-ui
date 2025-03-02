/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import {
  Button,
  Formik,
  Text,
  FormInput,
  Layout,
  ButtonVariation,
  useToaster,
  MultiSelectOption,
  FormikForm
} from '@harness/uicore'
import { FormGroup } from '@blueprintjs/core'

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings, String } from 'framework/strings'
import AllowedValuesFields from './AllowedValuesField'
import { ALLOWED_VALUES_TYPE } from './constants'
import {
  Validation,
  ValidationSchema,
  FormValues,
  parseInput,
  getInputStr,
  AllowedValuesCustomComponentProps,
  getStringValueWithComma,
  parseInputStringWithCommas
} from './ConfigureOptionsUtils'

import css from './ConfigureOptions.module.scss'

export interface ConfigureOptionsDialogProps {
  value: string
  isRequired?: boolean
  isOpen?: boolean
  defaultValue?: string | number
  variableName: string
  type: string | JSX.Element
  showDefaultField?: boolean
  showRequiredField?: boolean
  hideExecutionTimeField?: boolean
  isExecutionTimeFieldDisabled?: boolean
  isReadonly?: boolean
  allowedValuesType?: ALLOWED_VALUES_TYPE
  allowedValuesValidator?: Yup.Schema<unknown>
  getAllowedValuesCustomComponent?: (
    allowedValuesCustomComponentProps: AllowedValuesCustomComponentProps
  ) => React.ReactElement
  closeModal: (
    str?: string | undefined,
    defaultStr?: string | number | undefined,
    required?: boolean | undefined
  ) => void
  tagsInputSeparator?: string | RegExp | false
}

export default function ConfigureOptionsDialog(props: ConfigureOptionsDialogProps): JSX.Element | null {
  const {
    value,
    isRequired,
    defaultValue,
    showDefaultField = true,
    variableName,
    type,
    hideExecutionTimeField = false,
    isExecutionTimeFieldDisabled = false,
    showRequiredField = false,
    isReadonly = false,
    allowedValuesType,
    allowedValuesValidator,
    getAllowedValuesCustomComponent,
    closeModal,
    tagsInputSeparator
  } = props
  const [input, setInput] = React.useState(value)
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { NG_EXECUTION_INPUT } = useFeatureFlags()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsedValues = parseInput(input, { variableType: type as any })

  const formikRef = useRef<FormikProps<FormValues>>()

  // is not a valid input
  if (!parsedValues) {
    showError(getString('common.configureOptions.notValidExpression'))
    return null
  }
  const allowedValues = defaultTo(parsedValues.allowedValues?.values, [])
  const regExValues = defaultTo(parsedValues.regex, '')

  const getInitialAllowedValues = (): string[] | MultiSelectOption[] => {
    switch (allowedValuesType) {
      case ALLOWED_VALUES_TYPE.MULTI_SELECT:
        return allowedValues.map(currValue => ({ label: currValue, value: currValue }))
      default:
        return allowedValues
    }
  }

  const getInitialDefaultValue = (): string | number | undefined => {
    const defValue = parsedValues?.default ?? defaultValue

    if (typeof defValue === 'string') {
      return defaultTo(parseInputStringWithCommas(defValue), []).toString()
    }
    return defValue
  }

  const inputValues: FormValues = {
    isRequired,
    defaultValue: getInitialDefaultValue(),
    allowedValues: getInitialAllowedValues(),
    regExValues,
    isExecutionInput: !!parsedValues?.executionInput,
    validation:
      allowedValues.length > 0 ? Validation.AllowedValues : regExValues.length > 0 ? Validation.Regex : Validation.None
  }

  const getAllowedValuesToSubmit = (formAllowedValues: string[] | MultiSelectOption[]): string[] => {
    switch (allowedValuesType) {
      case ALLOWED_VALUES_TYPE.MULTI_SELECT:
        return (formAllowedValues as MultiSelectOption[]).map(
          (currValue: MultiSelectOption) => currValue.value as string
        )
      default:
        return formAllowedValues as string[]
    }
  }

  return (
    <Formik<FormValues>
      initialValues={inputValues}
      formName="configureOptionsForm"
      validationSchema={Yup.object().shape(ValidationSchema(getString))}
      onSubmit={data => {
        const formAllowedValues = getAllowedValuesToSubmit(data.allowedValues)
        // If default value is not one of given allowed values then show error and return from function
        // This is done because of allowed values custom component changes as ValidationSchema for defaultValue
        // in case of allowed values is not working properly
        // So, set error manually and do not close modal
        if (
          formAllowedValues?.length > 0 &&
          !isEmpty(data.defaultValue) &&
          !formAllowedValues.includes(data.defaultValue as string) &&
          data.validation === Validation.AllowedValues
        ) {
          formikRef.current?.setFieldError(
            'defaultValue',
            getString('common.configureOptions.validationErrors.defaultAllowedValid')
          )
          return
        }
        if (
          (type === 'Number' && isNaN(data.defaultValue as number)) ||
          (type !== 'Number' && isEmpty(data.defaultValue as string))
        ) {
          data.defaultValue = undefined
        }
        data.allowedValues = formAllowedValues
        const inputStr = getInputStr(data, !!NG_EXECUTION_INPUT)
        setInput(inputStr)
        closeModal(inputStr, getStringValueWithComma(data.defaultValue) as string | number | undefined, data.isRequired)
      }}
    >
      {formik => {
        formikRef.current = formik
        const { submitForm, values } = formik
        return (
          <FormikForm>
            <div>
              <FormGroup className={css.label} label={getString('variableLabel')} inline>
                <Text lineClamp={1}>{variableName}</Text>
              </FormGroup>
              <FormGroup className={css.label} label={getString('typeLabel')} inline>
                {typeof type === 'string' ? <Text>{type}</Text> : type}
              </FormGroup>
              <hr className={css.division} />
              {showRequiredField && (
                <FormInput.CheckBox
                  className={css.checkbox}
                  label={getString('common.configureOptions.requiredDuringExecution')}
                  name="isRequired"
                  disabled={isReadonly}
                />
              )}
              {NG_EXECUTION_INPUT && !hideExecutionTimeField ? (
                <FormInput.CheckBox
                  className={css.checkbox}
                  label={getString('common.configureOptions.askDuringExecution')}
                  name="isExecutionInput"
                  disabled={isReadonly || isExecutionTimeFieldDisabled}
                />
              ) : null}
              <div className={css.validationOptions}>
                <FormInput.RadioGroup
                  disabled={isReadonly}
                  name="validation"
                  // className={css.radioGroup}
                  radioGroup={{ inline: true }}
                  label={getString('common.configureOptions.validation')}
                  items={[
                    { label: getString('none'), value: Validation.None },
                    { label: getString('allowedValues'), value: Validation.AllowedValues },
                    { label: getString('common.configureOptions.regex'), value: Validation.Regex }
                  ]}
                />
                {values.validation === Validation.AllowedValues ? (
                  <AllowedValuesFields
                    formik={formik}
                    isReadonly={isReadonly}
                    allowedValuesType={allowedValuesType}
                    allowedValuesValidator={allowedValuesValidator}
                    getAllowedValuesCustomComponent={getAllowedValuesCustomComponent}
                    tagsInputSeparator={tagsInputSeparator}
                    variableType={type}
                  />
                ) : null}
                {values.validation === Validation.Regex ? (
                  <FormInput.TextArea
                    label={getString('common.configureOptions.regex')}
                    name="regExValues"
                    disabled={isReadonly}
                  />
                ) : null}
              </div>
              {showDefaultField || NG_EXECUTION_INPUT ? (
                <FormInput.Text
                  inputGroup={{ type: type === 'Number' ? 'number' : 'text' }}
                  label={getString('common.configureOptions.defaultValue')}
                  name="defaultValue"
                  isOptional
                  disabled={isReadonly}
                />
              ) : null}
            </div>
            <Layout.Horizontal spacing="small" margin={{ top: 'xxlarge' }}>
              <Button
                variation={ButtonVariation.PRIMARY}
                text={<String stringID="submit" />}
                onClick={submitForm}
                disabled={isReadonly}
              />
              <Button
                variation={ButtonVariation.TERTIARY}
                text={<String stringID="cancel" />}
                onClick={() => closeModal()}
              />
            </Layout.Horizontal>
          </FormikForm>
        )
      }}
    </Formik>
  )
}
