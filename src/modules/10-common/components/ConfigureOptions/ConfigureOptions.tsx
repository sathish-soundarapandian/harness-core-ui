/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties } from 'react'
import { defaultTo } from 'lodash-es'
import {
  Button,
  Formik,
  Text,
  FormInput,
  SelectOption,
  MultiSelectOption,
  Layout,
  RUNTIME_INPUT_VALUE,
  ButtonVariation,
  useToaster,
  Popover,
  Container
} from '@wings-software/uicore'
import { Dialog, Classes, FormGroup, Position, PopoverInteractionKind } from '@blueprintjs/core'
import * as Yup from 'yup'
import cx from 'classnames'
import isEmpty from 'lodash/isEmpty'
import { useModalHook } from '@harness/use-modal'
import { useStrings, String } from 'framework/strings'
import css from './ConfigureOptions.module.scss'

export interface ConfigureOptionsProps {
  value: string
  isRequired?: boolean
  defaultValue?: string | number
  variableName: string
  type: string | JSX.Element
  onChange?: (value: string, defaultValue?: string | number, isRequired?: boolean) => void
  showDefaultField?: boolean
  showRequiredField?: boolean
  showAdvanced?: boolean
  className?: string
  fetchValues?: (done: (response: SelectOption[] | MultiSelectOption[]) => void) => void
  style?: CSSProperties
  isReadonly?: boolean
}

export interface ConfigureOptionsDialogProps {
  value: string
  isRequired?: boolean
  defaultValue?: string | number
  variableName: string
  type: string | JSX.Element
  showDefaultField?: boolean
  showRequiredField?: boolean
  showAdvanced: boolean
  fetchValues?: (done: (response: SelectOption[] | MultiSelectOption[]) => void) => void
  isReadonly: boolean
  closeModal: (
    str?: string | undefined,
    defaultStr?: string | number | undefined,
    required?: boolean | undefined
  ) => void
}

export enum Validation {
  None = 'None',
  AllowedValues = 'AllowedValues',
  Regex = 'Regex'
}

export interface FormValues {
  isRequired?: boolean
  defaultValue?: string | number
  allowedValues: string[]
  regExValues: string
  validation: Validation
  isAdvanced: boolean
  advancedValue: string
}

export const AllowedExpression = 'allowedValues'
export const RegexExpression = 'regex'
// eslint-disable-next-line no-useless-escape
export const RegExInputExpression = /^\<\+input\>\.?(?:allowedValues\((.*?)\)|regex\((.*?)\))?$/
const RegExpression = /jexl\((.*?)\)/
const JEXL = 'jexl'

const getInputStr = (data: FormValues): string => {
  let inputStr = RUNTIME_INPUT_VALUE
  if (
    data.validation === Validation.AllowedValues &&
    (data.allowedValues?.length > 0 || data.advancedValue.length > 0)
  ) {
    if (data.isAdvanced) {
      inputStr += `.${AllowedExpression}(${JEXL}(${data.advancedValue}))`
    } else {
      inputStr += `.${AllowedExpression}(${data.allowedValues.join(',')})`
    }
  } /* istanbul ignore else */ else if (data.validation === Validation.Regex && data.regExValues?.length > 0) {
    inputStr += `.${RegexExpression}(${data.regExValues})`
  }
  return inputStr
}

interface ValidationSchemaReturnType {
  validation: Yup.StringSchema<string>
  regExValues: Yup.StringSchema<string | undefined>
  defaultValue: Yup.StringSchema<string | undefined>
  isAdvanced: Yup.BooleanSchema<boolean | undefined>
  advancedValue: Yup.StringSchema<string | undefined>
  allowedValues: Yup.NotRequiredArraySchema<string | undefined>
}

const ValidationSchema = (): ValidationSchemaReturnType => {
  const { getString } = useStrings()
  return {
    validation: Yup.string().required(),
    regExValues: Yup.string().when('validation', {
      is: Validation.Regex,
      then: Yup.string()
        .trim()
        .test({
          test(val: string): boolean | Yup.ValidationError {
            if (isEmpty(val)) {
              return this.createError({
                message: getString('common.configureOptions.validationErrors.regExIsRequired')
              })
            }
            let isValid = true
            try {
              val?.length > 0 && new RegExp(val)
            } catch (_e) {
              isValid = false
            }
            if (!isValid) {
              return this.createError({
                message: getString('common.configureOptions.validationErrors.regExNotValid')
              })
            }
            return true
          }
        })
    }),
    defaultValue: Yup.string()
      .trim()
      .when('validation', {
        is: Validation.Regex,
        then: Yup.string()
          .trim()
          .test({
            test(val: string): boolean | Yup.ValidationError {
              if (!isEmpty(this.parent.regExValues) && val?.length > 0 && !this.parent.isAdvanced) {
                try {
                  const reg = new RegExp(this.parent.regExValues)
                  if (!reg.test(val)) {
                    return this.createError({
                      message: getString('common.configureOptions.validationErrors.defaultRegExValid')
                    })
                  }
                } catch (_e) {
                  // Do nothing
                }
              }
              return true
            }
          })
      })
      .when('validation', {
        is: Validation.AllowedValues,
        then: Yup.string()
          .trim()
          .test({
            test(val: string): boolean | Yup.ValidationError {
              if (
                this.parent.allowedValues?.length > 0 &&
                !isEmpty(val) &&
                this.parent.allowedValues.indexOf(val) === -1
              ) {
                return this.createError({
                  message: getString('common.configureOptions.validationErrors.defaultAllowedValid')
                })
              }
              return true
            }
          })
      }),
    isAdvanced: Yup.boolean(),
    advancedValue: Yup.string().when(['validation', 'isAdvanced'], {
      is: (validation: Validation, isAdv: boolean) => validation === Validation.AllowedValues && isAdv,
      then: Yup.string().required(getString('common.configureOptions.validationErrors.jexlExpressionRequired'))
    }),
    allowedValues: Yup.array(Yup.string()).when(['validation', 'isAdvanced'], {
      is: (validation: Validation, isAdv: boolean) => validation === Validation.AllowedValues && !isAdv,
      then: Yup.array(Yup.string()).min(1, getString('common.configureOptions.validationErrors.minOneAllowedValue'))
    })
  }
}

interface AllowedValuesFieldsProps {
  values: FormValues
  showAdvanced: boolean
  setFieldValue: (field: string, value: any) => void
  isReadonly: boolean
  fetchValues?: (done: (response: SelectOption[] | MultiSelectOption[]) => void) => void
  options: SelectOption[] | MultiSelectOption[]
}

const AllowedValuesFields = (props: AllowedValuesFieldsProps): JSX.Element => {
  const { values, showAdvanced, setFieldValue, isReadonly, fetchValues, options } = props
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
              setFieldValue('isAdvanced', !values.isAdvanced)
            }}
            disabled={isReadonly}
          />
        </span>
      ) : /* istanbul ignore next */ null}
      {values.isAdvanced ? (
        <FormInput.TextArea
          name="advancedValue"
          className={css.secondColumn}
          label={getString('common.configureOptions.jexlLabel')}
          placeholder={getString('inputTypes.EXPRESSION')}
          disabled={isReadonly}
        />
      ) : (
        <>
          {!fetchValues ? (
            <FormInput.KVTagInput
              className={css.secondColumn}
              label={getString('allowedValues')}
              name="allowedValues"
              isArray={true}
              disabled={isReadonly}
            />
          ) : (
            <FormInput.MultiSelect
              className={css.secondColumn}
              items={options}
              label={getString('common.configureOptions.values')}
              name="allowedValues"
              disabled={isReadonly}
            />
          )}
        </>
      )}
    </div>
  )
}
function ConfigureOptionsDialog(props: ConfigureOptionsDialogProps): JSX.Element | null {
  const {
    value,
    isRequired,
    defaultValue,
    showDefaultField = true,
    variableName,
    type,
    showRequiredField = false,
    showAdvanced = false,
    fetchValues,
    isReadonly = false,
    closeModal
  } = props
  const [input, setInput] = React.useState(value)
  const { showError } = useToaster()
  const [options, setOptions] = React.useState<SelectOption[] | MultiSelectOption[]>([])
  const { getString } = useStrings()

  if (!RegExInputExpression.test(input)) {
    showError(getString('common.configureOptions.notValidExpression'))
    return null
  }
  const response = input.match(RegExInputExpression)
  const allowedValueStr = defaultTo(response?.[1], '')
  let allowedValues: string[] = []
  const regExValues = defaultTo(response?.[2], '')
  const isAdvanced = RegExpression.test(input)
  let advancedValue = ''
  if (isAdvanced) {
    advancedValue = defaultTo(allowedValueStr.match(RegExpression)?.[1], /* istanbul ignore next */ '')
  } else if (allowedValueStr.length > 0) {
    allowedValues = allowedValueStr.split(',')
  }
  fetchValues?.(data => {
    setOptions(data)
  })

  const inputValues: FormValues = {
    isRequired,
    defaultValue,
    allowedValues,
    regExValues,
    isAdvanced,
    advancedValue,
    validation:
      allowedValues.length > 0 || isAdvanced
        ? Validation.AllowedValues
        : regExValues.length > 0
        ? Validation.Regex
        : Validation.None
  }

  return (
    <Dialog
      isOpen={true}
      title={getString('common.configureOptions.configureOptions')}
      enforceFocus={false}
      className={cx(css.dialog, Classes.DIALOG, 'padded-dialog')}
      onClose={() => closeModal()}
    >
      <Formik
        initialValues={inputValues}
        formName="configureOptionsForm"
        validationSchema={Yup.object().shape(ValidationSchema())}
        onSubmit={data => {
          const inputStr = getInputStr(data)
          setInput(inputStr)
          closeModal(inputStr, data.defaultValue, data.isRequired)
        }}
      >
        {({ submitForm, values, setFieldValue }) => (
          <>
            <div>
              <FormGroup className={css.label} label={getString('variableLabel')} inline>
                <Text lineClamp={1}>{variableName}</Text>
              </FormGroup>
              <FormGroup className={css.label} label={getString('typeLabel')} inline>
                {typeof type === 'string' ? <Text>{type}</Text> : type}
              </FormGroup>
              {showDefaultField &&
                (fetchValues ? (
                  <FormInput.Select
                    items={options}
                    label={getString('common.configureOptions.defaultValue')}
                    name="defaultValue"
                    disabled={isReadonly}
                  />
                ) : (
                  <FormInput.Text
                    inputGroup={{ type: type === 'Number' ? 'number' : 'text' }}
                    label={getString('common.configureOptions.defaultValue')}
                    name="defaultValue"
                    disabled={isReadonly}
                  />
                ))}
              {showRequiredField && (
                <FormInput.CheckBox
                  className={css.checkbox}
                  label={getString('common.configureOptions.requiredDuringExecution')}
                  name="isRequired"
                  disabled={isReadonly}
                />
              )}
              <div className={css.split}>
                <FormInput.RadioGroup
                  disabled={isReadonly}
                  name="validation"
                  label={getString('common.configureOptions.validation')}
                  items={[
                    { label: getString('none'), value: Validation.None },
                    { label: getString('allowedValues'), value: Validation.AllowedValues },
                    { label: getString('common.configureOptions.regex'), value: Validation.Regex }
                  ]}
                />
                {values.validation !== Validation.None && <div className={css.line} />}
                {values.validation === Validation.AllowedValues && (
                  <AllowedValuesFields
                    values={values}
                    showAdvanced={showAdvanced}
                    setFieldValue={setFieldValue}
                    fetchValues={fetchValues}
                    isReadonly={isReadonly}
                    options={options}
                  />
                )}
                {values.validation === Validation.Regex && (
                  <FormInput.TextArea
                    className={css.secondColumn}
                    label={getString('common.configureOptions.regex')}
                    name="regExValues"
                    disabled={isReadonly}
                  />
                )}
              </div>
            </div>
            <Layout.Horizontal spacing="xxlarge" margin={{ top: 'medium' }}>
              <Button
                variation={ButtonVariation.SECONDARY}
                text={<String stringID="cancel" />}
                onClick={() => closeModal()}
              />
              <Button
                variation={ButtonVariation.PRIMARY}
                text={<String stringID="submit" />}
                onClick={submitForm}
                disabled={isReadonly}
              />{' '}
            </Layout.Horizontal>
          </>
        )}
      </Formik>
    </Dialog>
  )
}

export function ConfigureOptions(props: ConfigureOptionsProps): JSX.Element {
  const {
    value,
    isRequired,
    defaultValue,
    onChange,
    showDefaultField = true,
    variableName,
    type,
    showRequiredField = false,
    showAdvanced = false,
    fetchValues,
    className,
    isReadonly = false
  } = props
  const [input, setInput] = React.useState(value)
  const [isHover, setIsHover] = React.useState<boolean>()
  const [showModal, hideModal] = useModalHook(() => {
    return (
      <ConfigureOptionsDialog
        closeModal={closeModal}
        isRequired={isRequired}
        isReadonly={isReadonly}
        value={value}
        variableName={variableName}
        type={type}
        showDefaultField={showDefaultField}
        defaultValue={defaultValue}
        showRequiredField={showRequiredField}
        showAdvanced={showAdvanced}
        fetchValues={fetchValues}
      />
    )
  }, [value, showDefaultField, variableName, type, showRequiredField, showAdvanced, fetchValues, defaultValue, type])

  React.useEffect(() => {
    setInput(value)
  }, [value])

  const closeModal = React.useCallback(
    (str?: string, defaultStr?: string | number, required?: boolean) => {
      hideModal()
      onChange?.(str ?? input, defaultStr ?? defaultValue, required)
    },
    [hideModal, onChange, input, defaultValue]
  )

  return (
    <Popover interactionKind={PopoverInteractionKind.HOVER} position={Position.TOP} className={Classes.DARK}>
      <Button
        style={{ color: isHover ? 'var(--primary-6)' : 'var(--grey-400)', ...props.style }}
        className={className}
        minimal
        rightIcon="cog"
        // To avoid non unique IDs in a single form
        id={`configureOptions_${variableName}`}
        onClick={showModal}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      />
      <Container className={css.cogBtnTooltipContainer} padding="medium">
        <Text color={'white'}>{'Configure runtime input options'}</Text>
      </Container>
    </Popover>
  )
}
