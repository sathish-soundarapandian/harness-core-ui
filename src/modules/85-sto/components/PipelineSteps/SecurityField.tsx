/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { MultiTypeInputProps, Container, SelectOption, AllowedTypes, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { MultiTypeTextField, MultiTypeTextProps } from '@common/components/MultiTypeText/MultiTypeText'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { StringsMap } from 'stringTypes'
import { renderOptionalWrapper } from '@ci/components/PipelineSteps/CIStep/StepUtils'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface SelectItems extends SelectOption {
  disabled?: boolean
}
interface SecurityFieldProps<T> {
  enableFields: {
    [key: string]: {
      [key: string]: any
      label: keyof StringsMap
      optional?: boolean
      inputProps?: MultiTypeTextProps['multiTextInputProps']
      multiTypeInputProps?: Omit<MultiTypeInputProps, 'name'>
      selectItems?: SelectItems[]
      hide?: boolean
      tooltipId?: string
      readonly?: boolean
      fieldType?: 'input' | 'checkbox' | 'dropdown'
    }
  }
  formik?: FormikProps<T>
  stepViewType: StepViewType
  isInputSetView?: boolean
  allowableTypes?: AllowedTypes
  template?: Record<string, any>
  expressions?: string[]
}

type LabelProps = {
  label: keyof StringsMap
  optional?: boolean
  tooltipId?: string
  getString: UseStringsReturn['getString']
}

const renderLabel = (props: LabelProps) => {
  const { label, optional, tooltipId, getString } = props

  return renderOptionalWrapper({
    label: (
      <Text
        className={stepCss.inpLabel}
        color={Color.GREY_600}
        font={{ size: 'small', weight: 'semi-bold' }}
        {...(optional
          ? {}
          : {
              tooltipProps: {
                dataTooltipId: tooltipId
              }
            })}
      >
        {getString(label)}
      </Text>
    ),
    optional,
    getString,
    tooltipId
  })
}

function SecurityField<T>(props: SecurityFieldProps<T>) {
  const { enableFields, stepViewType, formik, allowableTypes } = props
  const fields = Object.entries(enableFields)
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      {stepViewType !== StepViewType.Template &&
        fields.map(([fieldName, fieldProps]) => {
          const {
            label,
            optional = false,
            selectItems = [],
            hide,
            multiTypeInputProps,
            tooltipId = '',
            inputProps,
            fieldType,
            readonly
          } = fieldProps

          if (hide) return null

          if (fieldType === 'dropdown') {
            return (
              <Container key={fieldName} className={cx(stepCss.formGroup, stepCss.lg, stepCss.bottomMargin5)}>
                <MultiTypeSelectField
                  label={renderLabel({ label, optional, tooltipId, getString })}
                  name={fieldName}
                  useValue
                  formik={formik}
                  multiTypeInputProps={{
                    selectItems: selectItems,
                    placeholder: getString('select'),
                    multiTypeInputProps: {
                      expressions,
                      allowableTypes,
                      selectProps: { addClearBtn: true, items: selectItems }
                    },
                    width: 384,
                    disabled: readonly || selectItems?.length === 1,
                    ...multiTypeInputProps
                  }}
                />
              </Container>
            )
          }

          if (fieldType === 'checkbox') {
            return (
              <Container key={fieldName} className={cx(stepCss.formGroup, stepCss.lg, stepCss.bottomMargin3)}>
                <FormMultiTypeCheckboxField
                  disabled={readonly}
                  name={fieldName}
                  formik={formik}
                  tooltipProps={{ dataTooltipId: tooltipId }}
                  label={getString(label)}
                  setToFalseWhenEmpty={true}
                  multiTypeTextbox={{
                    expressions,
                    allowableTypes
                  }}
                />
              </Container>
            )
          }

          return (
            <Container key={fieldName} className={cx(stepCss.formGroup, stepCss.lg, stepCss.bottomMargin5)}>
              <MultiTypeTextField
                name={fieldName}
                formik={formik}
                label={renderLabel({ label, optional, tooltipId, getString })}
                multiTextInputProps={{
                  ...inputProps,
                  multiTextInputProps: {
                    allowableTypes,
                    expressions
                  }
                }}
              />
            </Container>
          )
        })}
    </>
  )
}

export default SecurityField
