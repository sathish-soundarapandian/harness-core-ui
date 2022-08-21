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
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import css from './ScriptVariablesRuntimeInput.module.scss'

export interface InputSetSchema {
  name: string
  type: 'String' | 'Number'
  value: string
  useAsDefault?: boolean
}

interface InputOutputVariablesInputSetProps {
  allowableTypes: AllowedTypes
  // todo: to change with type in BE
  template?: any
  path?: string
  readonly?: boolean
  enableFixed?: boolean
  className?: string
}

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export function ScriptVariablesRuntimeInput(props: InputOutputVariablesInputSetProps): React.ReactElement {
  const { allowableTypes, readonly, template, path, enableFixed = false, className } = props

  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      {template?.environmentVariables && isArray(template.environmentVariables) ? (
        <div className={css.formGroup}>
          <MultiTypeFieldSelector
            name="templateInputs.environmentVariables"
            label={getString('common.inputVariables')}
            defaultValueToReset={[]}
            disableTypeSelection
          >
            <FieldArray
              key="secretmanager-inputs"
              name="templateInputs.environmentVariables"
              render={() => {
                return (
                  <div className={cx(css.panel, className)}>
                    <div
                      className={cx(css.environmentVarHeader, {
                        [css.gridFourColumn]: enableFixed,
                        [css.gridThreeColumn]: !enableFixed
                      })}
                    >
                      <span className={css.label}>Name</span>
                      <span className={css.label}>Type</span>
                      <span className={css.label}>Value</span>
                      {enableFixed ? <span className={css.label}>Fixed</span> : null}
                    </div>
                    {template.environmentVariables.map((type: any, i: number) => {
                      return (
                        <div
                          className={cx(css.environmentVarHeader, {
                            [css.gridFourColumn]: enableFixed,
                            [css.gridThreeColumn]: !enableFixed
                          })}
                          key={`${type.name}${type.type}${type.value}`}
                        >
                          <FormInput.Text
                            name={`${prefix}templateInputs.environmentVariables[${i}].name`}
                            placeholder={getString('name')}
                            disabled={true}
                          />
                          <FormInput.Select
                            items={scriptInputType}
                            name={`${prefix}templateInputs.environmentVariables[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={true}
                          />
                          <FormInput.MultiTextInput
                            name={`${prefix}templateInputs.environmentVariables[${i}].value`}
                            multiTextInputProps={{
                              allowableTypes,

                              disabled: readonly
                            }}
                            label=""
                            disabled={readonly}
                          />
                          {enableFixed ? (
                            <FormInput.CheckBox
                              label=""
                              name={`${prefix}templateInputs.environmentVariables[${i}].useAsDefault`}
                              disabled={false}
                              className={css.fixed}
                            />
                          ) : null}
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
