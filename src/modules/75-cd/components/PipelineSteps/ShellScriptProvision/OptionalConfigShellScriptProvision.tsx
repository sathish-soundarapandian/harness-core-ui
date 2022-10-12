/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormikProps, FieldArray } from 'formik'
import { AllowedTypes, Button, ButtonVariation, FormikForm, FormInput } from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'
import { isArray } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { scriptInputType, ShellScriptProvisionFormData, ShellScriptProvisionStepVariable } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ShellScriptProvision.module.scss'

export default function OptionalConfigShellScriptProvision(props: {
  formik: FormikProps<ShellScriptProvisionFormData>
  readonly?: boolean
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { formik, readonly, allowableTypes } = props
  const { values: formValues } = formik
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <FormikForm>
      <div className={stepCss.stepPanel}>
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.environmentVariables"
            label={getString('pipeline.scriptInputVariables')}
            isOptional
            optionalLabel={getString('common.optionalLabel')}
            defaultValueToReset={[]}
            disableTypeSelection
          >
            <FieldArray
              name="spec.environmentVariables"
              render={({ push, remove }) => {
                return (
                  <div className={css.panel}>
                    <div className={css.environmentVarHeader}>
                      <span className={css.label}>Name</span>
                      <span className={css.label}>Type</span>
                      <span className={css.label}>Value</span>
                    </div>
                    {isArray(formValues.spec.environmentVariables) &&
                      formValues.spec.environmentVariables.map(
                        ({ id }: ShellScriptProvisionStepVariable, i: number) => {
                          return (
                            <div className={css.environmentVarHeader} key={id}>
                              <FormInput.Text
                                name={`spec.environmentVariables[${i}].name`}
                                placeholder={getString('name')}
                                disabled={readonly}
                              />
                              <FormInput.Select
                                items={scriptInputType}
                                name={`spec.environmentVariables[${i}].type`}
                                placeholder={getString('typeLabel')}
                                disabled={readonly}
                              />
                              <FormInput.MultiTextInput
                                name={`spec.environmentVariables[${i}].value`}
                                placeholder={getString('valueLabel')}
                                multiTextInputProps={{
                                  allowableTypes,
                                  expressions,
                                  disabled: readonly
                                }}
                                label=""
                                disabled={readonly}
                              />
                              <Button
                                variation={ButtonVariation.ICON}
                                icon="main-trash"
                                data-testid={`remove-environmentVar-${i}`}
                                onClick={() => remove(i)}
                                disabled={readonly}
                              />
                            </div>
                          )
                        }
                      )}
                    <Button
                      icon="plus"
                      variation={ButtonVariation.LINK}
                      data-testid="add-environmentVar"
                      disabled={readonly}
                      onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
                      className={css.addButton}
                    >
                      {getString('addInputVar')}
                    </Button>
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      </div>
    </FormikForm>
  )
}
