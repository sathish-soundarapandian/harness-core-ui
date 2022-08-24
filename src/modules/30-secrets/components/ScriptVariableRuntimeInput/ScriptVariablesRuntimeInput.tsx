/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FieldArray } from 'formik'
import { isArray, isEmpty } from 'lodash-es'
import { AllowedTypes, FormInput, Layout, SelectOption } from '@harness/uicore'
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

export interface ExecutionTarget {
  host: string
  connectorRef: string
  workingDirectory: string
}

export interface SceretManagerTemplateInputs {
  environmentVariables?: Array<InputSetSchema>
  outputVariables?: Array<InputSetSchema>
  executionTarget?: ExecutionTarget
}

export interface SecretManagerTemplateInputSet {
  templateInputs: SceretManagerTemplateInputs
}

interface InputOutputVariablesInputSetProps {
  allowableTypes: AllowedTypes
  template?: any
  path?: string
  readonly?: boolean
  enableFixed?: boolean
  enabledExecutionDetails?: boolean
  className?: string
}

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export function ScriptVariablesRuntimeInput(props: InputOutputVariablesInputSetProps): React.ReactElement {
  const {
    allowableTypes,
    readonly,
    template,
    path,
    enableFixed = false,
    className,
    enabledExecutionDetails = false
  } = props

  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}`

  return (
    <>
      {template?.environmentVariables && isArray(template.environmentVariables) ? (
        <div className={css.formGroup}>
          <MultiTypeFieldSelector
            name={`${prefix}.environmentVariables`}
            label={getString('common.inputVariables')}
            defaultValueToReset={[]}
            disableTypeSelection
          >
            <FieldArray
              key="secretmanager-inputs"
              name={`${prefix}.environmentVariables`}
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
                            name={`${prefix}.environmentVariables[${i}].name`}
                            placeholder={getString('name')}
                            disabled={true}
                          />
                          <FormInput.Select
                            items={scriptInputType}
                            name={`${prefix}.environmentVariables[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={true}
                          />
                          <FormInput.MultiTextInput
                            name={`${prefix}.environmentVariables[${i}].value`}
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
                              name={`${prefix}.environmentVariables[${i}].useAsDefault`}
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
          {enabledExecutionDetails ? (
            <Layout.Vertical width={'400px'}>
              {template.executionTarget?.host ? (
                <FormInput.Text
                  name={`${prefix}.executionTarget.host`}
                  placeholder={getString('pipelineSteps.hostLabel')}
                  label={getString('targetHost')}
                  style={{ marginTop: 'var(--spacing-small)' }}
                  disabled={readonly}
                />
              ) : null}
              {/* {skipping showing connector Ref as runtime input - for now. - does not impact functionality} */}
              {/* {template.executionTarget.connectorRef ? (
                <MultiTypeSecretInput
                  type="SSHKey"
                  name={`${prefix}.executionTarget.connectorRef`}
                  label={getString('sshConnector')}
                  disabled={readonly}
                  allowableTypes={[]}
                />
              ) : null} */}
              {template.executionTarget?.workingDirectory ? (
                <FormInput.Text
                  name={`${prefix}.executionTarget.workingDirectory`}
                  placeholder={getString('workingDirectory')}
                  label={getString('workingDirectory')}
                  style={{ marginTop: 'var(--spacing-medium)' }}
                  disabled={readonly}
                />
              ) : null}
            </Layout.Vertical>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
