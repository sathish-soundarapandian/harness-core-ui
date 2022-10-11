/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  AllowedTypes,
  FormInput,
  Text
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'

import { isArray, isEmpty, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { FieldArray } from 'formik'

import { useStrings } from 'framework/strings'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import ShellScriptProvisionConfig from './ShellScriptProvisionConfig'

import {
  scriptInputType,
  ShellScriptProvisionData,
  ShellScriptProvisionFileStore,
  ShellScriptProvisionFormData,
  ShellScriptProvisionInline
} from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ShellScriptProvision.module.scss'

export interface ShellScriptProvisionInputSetStepProps {
  initialValues: ShellScriptProvisionFormData
  onUpdate?: (data: ShellScriptProvisionFormData) => void
  onChange?: (data: ShellScriptProvisionFormData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: ShellScriptProvisionData
  path?: string
  formikRef?: any
}

export default function ShellScriptProvisionInputSetStep(
  props: ShellScriptProvisionInputSetStepProps
): React.ReactElement {
  const { template, path, readonly, allowableTypes, initialValues, formikRef } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const scriptType = 'Bash'
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <FormikForm>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            disabled={readonly}
            fieldPath={'timeout'}
            template={template}
          />
        </div>
      )}

      {getMultiTypeFromValue((template?.spec?.source?.spec as ShellScriptProvisionInline)?.script) ===
      MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.alignStart, stepCss.md)}>
          <MultiTypeFieldSelector
            name={`${prefix}spec.source.spec.script`}
            label={getString('common.script')}
            defaultValueToReset=""
            disabled={readonly}
            allowedTypes={allowableTypes}
            disableTypeSelection={readonly}
            skipRenderValueInExpressionLabel
            expressionRender={() => {
              return (
                <ShellScriptMonacoField
                  name={`${prefix}spec.source.spec.script`}
                  scriptType={scriptType}
                  disabled={readonly}
                  expressions={expressions}
                />
              )
            }}
          >
            <ShellScriptMonacoField
              name={`${prefix}spec.source.spec.script`}
              scriptType={scriptType}
              disabled={readonly}
              expressions={expressions}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}

      {getMultiTypeFromValue((template?.spec?.source?.spec as ShellScriptProvisionFileStore)?.file) ===
      MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.alignStart, stepCss.md)}>
          <ShellScriptProvisionConfig
            name={`${prefix}spec.source.spec.file`}
            fileType={'fileStore'}
            formik={formikRef}
            expressions={expressions}
            values={defaultTo((initialValues.spec.source?.spec as ShellScriptProvisionFileStore)?.file, '')}
            multiTypeFieldSelectorProps={{
              disableTypeSelection: false,
              label: (
                <Text color={Color.GREY_600} padding={{ bottom: 4 }}>
                  {getString('fileFolderPathText')}
                </Text>
              ),
              allowedTypes: allowableTypes
            }}
          />
        </div>
      ) : null}

      {isArray(template?.spec?.environmentVariables) && template?.spec?.environmentVariables ? (
        <div className={stepCss.formGroup}>
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
                    </div>
                    {template.spec.environmentVariables?.map((type, i: number) => {
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
    </FormikForm>
  )
}
