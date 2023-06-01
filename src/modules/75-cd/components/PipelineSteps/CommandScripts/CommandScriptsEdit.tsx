/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { Accordion, AllowedTypes, Formik, FormInput, Text } from '@harness/uicore'

import { Color } from '@harness/design-system'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import type { CommandScriptsData, CommandScriptsFormData } from './CommandScriptsTypes'
import { CommandList } from './CommandList'
import { VariableList } from './VariableList'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ShellScriptWidgetProps {
  initialValues: CommandScriptsFormData
  onUpdate?: (data: CommandScriptsFormData) => void
  onChange?: (data: CommandScriptsFormData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
}

function CommandScriptsEditWidget(
  {
    initialValues,
    onUpdate,
    onChange,
    allowableTypes,
    isNewStep = true,
    readonly,
    stepViewType
  }: ShellScriptWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    ...getNameAndIdentifierSchema(getString, stepViewType),
    spec: Yup.object().shape({
      commandUnits: Yup.lazy(() => {
        return Yup.array().required(getString('common.validation.fieldIsRequired', { name: getString('commandLabel') }))
      })
    })
  })

  const values: CommandScriptsFormData = {
    ...initialValues,
    spec: {
      ...initialValues.spec
    }
  }
  const { expressions } = useVariablesExpression()

  return (
    <Formik<CommandScriptsFormData>
      onSubmit={submit => {
        onUpdate?.(submit)
      }}
      validate={formValues => {
        onChange?.(formValues)
      }}
      formName="shellScriptForm"
      initialValues={values}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<CommandScriptsData>) => {
        // this is required
        setFormikRef(formikRef, formik)

        return (
          <React.Fragment>
            {stepViewType !== StepViewType.Template && (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('pipelineSteps.stepNameLabel')}
                  isIdentifierEditable={isNewStep && !readonly}
                  inputGroupProps={{
                    placeholder: getString('pipeline.stepNamePlaceholder'),
                    disabled: readonly
                  }}
                />
              </div>
            )}
            <div className={cx(stepCss.formGroup, stepCss.sm)}>
              <FormMultiTypeDurationField
                name="timeout"
                label={getString('pipelineSteps.timeoutLabel')}
                multiTypeDurationProps={{
                  enableConfigureOptions: true,
                  expressions,
                  disabled: readonly,
                  allowableTypes
                }}
                className={stepCss.duration}
                disabled={readonly}
              />
            </div>
            <div className={stepCss.divider} />
            <CommandList allowableTypes={allowableTypes} readonly={readonly} />
            {formik.errors.spec?.commandUnits && formik.submitCount !== 0 && (
              <Text icon="circle-cross" iconProps={{ size: 10, color: Color.RED_600 }} color={Color.RED_600}>
                {formik.errors.spec.commandUnits}
              </Text>
            )}
            <Accordion className={stepCss.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <div className={stepCss.stepPanel}>
                    <VariableList
                      varType={'Input'}
                      formik={formik}
                      fieldName={'spec.environmentVariables'}
                      fieldLabel={getString('pipeline.scriptInputVariables')}
                      allowableTypes={allowableTypes}
                      readonly={readonly}
                    />
                    <VariableList
                      varType={'Output'}
                      formik={formik}
                      fieldName={'spec.outputVariables'}
                      fieldLabel={getString('pipeline.scriptOutputVariables')}
                      allowableTypes={allowableTypes}
                      readonly={readonly}
                    />
                    <div className={stepCss.formGroup}>
                      <FormMultiTypeCheckboxField
                        name={'spec.onDelegate'}
                        label={getString('cd.steps.commands.runOnDelegate')}
                        style={{ flex: 1, width: '300px' }}
                        disabled={readonly}
                        multiTypeTextbox={{
                          expressions,
                          allowableTypes
                        }}
                      />
                    </div>
                  </div>
                }
              />
            </Accordion>
          </React.Fragment>
        )
      }}
    </Formik>
  )
}

export const CommandScriptsEdit = React.forwardRef(CommandScriptsEditWidget)
