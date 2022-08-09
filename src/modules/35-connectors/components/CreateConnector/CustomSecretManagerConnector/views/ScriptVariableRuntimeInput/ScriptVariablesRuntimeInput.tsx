/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FieldArray } from 'formik'
import { isArray, isEmpty } from 'lodash-es'
import { AllowedTypes, FormInput, SelectOption } from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import css from './ScriptVariablesRuntimeInput.module.scss'

interface InputOutputVariablesInputSetProps {
  allowableTypes: AllowedTypes
  template?: any
  path?: string
  readonly?: boolean
}

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export function ScriptVariablesRuntimeInput(props: InputOutputVariablesInputSetProps): React.ReactElement {
  const { allowableTypes, readonly, template, path } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      {isArray(template?.spec?.environmentVariables) && template?.spec?.environmentVariables ? (
        <div className={css.formGroup}>
          <MultiTypeFieldSelector
            name="spec.environmentVariables"
            label={getString('pipeline.scriptInputVariables')}
            defaultValueToReset={[]}
            disableTypeSelection
          >
            <FieldArray
              name="spec.environmentVariables"
              render={() => {
                return (
                  <div className={css.panel}>
                    <div className={css.environmentVarHeader}>
                      <span className={css.label}>Name</span>
                      <span className={css.label}>Type</span>
                      <span className={css.label}>Value</span>
                      <span className={css.label}>Use as Default</span>
                    </div>
                    {template.spec?.environmentVariables?.map((type: any, i: number) => {
                      return (
                        <div className={css.environmentVarHeader} key={type.value}>
                          <FormInput.Text
                            name={`${prefix}spec.environmentVariables[${i}].name`}
                            placeholder={getString('name')}
                            disabled={true}
                          />
                          <FormInput.Select
                            items={scriptInputType}
                            name={`${prefix}spec.environmentVariables[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={true}
                          />
                          <FormInput.MultiTextInput
                            name={`${prefix}spec.environmentVariables[${i}].value`}
                            multiTextInputProps={{
                              allowableTypes,
                              expressions,
                              disabled: readonly
                            }}
                            label=""
                            disabled={readonly}
                            placeholder={getString('valueLabel')}
                          />
                          <FormInput.CheckBox
                            label=""
                            name={`${prefix}spec.environmentVariables[${i}].useAsDefault`}
                            placeholder={getString('typeLabel')}
                            disabled={true}
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
    </>
  )
}
