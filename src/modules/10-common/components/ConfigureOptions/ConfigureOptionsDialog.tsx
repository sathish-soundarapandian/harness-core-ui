/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import * as Yup from 'yup'
import {
  Button,
  Formik,
  Text,
  FormInput,
  Layout,
  ButtonVariation,
  useToaster,
  MultiSelectOption
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
  AllowedValuesCustomComponentProps
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
  showAdvanced?: boolean
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
    showRequiredField = false,
    showAdvanced = false,
    isReadonly = false,
    allowedValuesType,
    allowedValuesValidator,
    getAllowedValuesCustomComponent,
    closeModal
  } = props
  const [input, setInput] = React.useState(value)
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { NG_EXECUTION_INPUT } = useFeatureFlags()
  const parsedValues = parseInput(input)

  // is not a valid input
  if (!parsedValues) {
    showError(getString('common.configureOptions.notValidExpression'))
    return null
  }
  const allowedValues = defaultTo(parsedValues.allowedValues?.values, [])
  const regExValues = defaultTo(parsedValues.regex, '')
  const isAdvanced = !!parsedValues.allowedValues?.jexlExpression
  const advancedValue = defaultTo(parsedValues.allowedValues?.jexlExpression, '')

  const getInitialAllowedValues = () => {
    switch (allowedValuesType) {
      case ALLOWED_VALUES_TYPE.MULTI_SELECT:
        return allowedValues.map(currValue => ({ label: currValue, value: currValue }))
      default:
        return allowedValues
    }
  }

  const inputValues: FormValues = {
    isRequired,
    defaultValue: parsedValues?.default ?? defaultValue,
    allowedValues: getInitialAllowedValues(),
    regExValues,
    isAdvanced,
    advancedValue,
    isExecutionInput: !!parsedValues?.executionInput,
    validation:
      allowedValues.length > 0 || isAdvanced
        ? Validation.AllowedValues
        : regExValues.length > 0
        ? Validation.Regex
        : Validation.None
  }

  const getAllowedValuesToSubmit = (formAllowedValues: unknown): string[] => {
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
    <Formik
      initialValues={inputValues}
      formName="configureOptionsForm"
      validationSchema={Yup.object().shape(ValidationSchema(getString))}
      onSubmit={data => {
        data.allowedValues = getAllowedValuesToSubmit(data.allowedValues)
        const inputStr = getInputStr(data, !!NG_EXECUTION_INPUT)
        setInput(inputStr)
        closeModal(inputStr, data.defaultValue, data.isRequired)
      }}
    >
      {formik => {
        const { submitForm, values } = formik
        return (
          <>
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
                  disabled={isReadonly}
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
                    showAdvanced={showAdvanced}
                    formik={formik}
                    isReadonly={isReadonly}
                    allowedValuesType={allowedValuesType}
                    allowedValuesValidator={allowedValuesValidator}
                    getAllowedValuesCustomComponent={getAllowedValuesCustomComponent}
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
                variation={ButtonVariation.SECONDARY}
                text={<String stringID="cancel" />}
                onClick={() => closeModal()}
              />
            </Layout.Horizontal>
          </>
        )
      }}
    </Formik>
  )
}
