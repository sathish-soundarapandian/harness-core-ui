/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormikProps, FieldArray } from 'formik'
import {
  AllowedTypes,
  Button,
  ButtonVariation,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'
import { v4 as uuid } from 'uuid'

import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ReleaseRepoVariable, UpdateReleaseRepoFormData } from './UpdateReleaseRepo'
import css from './OptionalConfig.module.scss'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export default function OptionalConfiguration(props: {
  formik: FormikProps<UpdateReleaseRepoFormData>
  readonly?: boolean
  allowableTypes: AllowedTypes
  enableOutputVar?: boolean
}): React.ReactElement {
  const { formik, readonly, allowableTypes } = props
  const { values: formValues, setFieldValue } = formik
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <FormikForm>
      <div className={stepCss.stepPanel}>
        <div className={stepCss.formGroup}>
          <FormInput.MultiTextInput
            name="spec.prTitle"
            placeholder={getString('pipeline.prTitle')}
            label={getString('pipeline.prTitle')}
            isOptional
            optionalLabel={getString('common.optionalLabel')}
            disabled={readonly}
            multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
          />
          {getMultiTypeFromValue(formValues.spec.prTitle) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formValues.spec.prTitle || ''}
              type="String"
              variableName="spec.prTitle"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => setFieldValue('spec.prTitle', value)}
              isReadonly={readonly}
            />
          )}
        </div>
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.variables"
            label={getString('common.variables')}
            isOptional
            optionalLabel={getString('common.optionalLabel')}
            defaultValueToReset={[]}
            disableTypeSelection
          >
            <FieldArray
              name="spec.variables"
              render={({ push, remove }) => {
                return (
                  <div className={css.panel}>
                    <div className={css.environmentVarHeader}>
                      <span className={css.label}>Name</span>
                      <span className={css.label}>Type</span>
                      <span className={css.label}>Value</span>
                    </div>

                    {get(formValues, 'spec.variables', []).map(({ id }: ReleaseRepoVariable, i: number) => {
                      return (
                        <div className={css.environmentVarHeader} key={id}>
                          <FormInput.Text
                            name={`spec.variables[${i}].name`}
                            placeholder={getString('name')}
                            disabled={readonly}
                          />
                          <FormInput.Select
                            items={scriptInputType}
                            name={`spec.variables[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={readonly}
                          />
                          <FormInput.MultiTextInput
                            name={`spec.variables[${i}].value`}
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
                    })}
                    <Button
                      icon="plus"
                      variation={ButtonVariation.LINK}
                      data-testid="add-environmentVar"
                      disabled={readonly}
                      onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
                      className={css.addButton}
                    >
                      {getString('common.addVariable')}
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
