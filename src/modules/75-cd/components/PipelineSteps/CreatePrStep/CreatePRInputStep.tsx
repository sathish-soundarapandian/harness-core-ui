/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, AllowedTypes } from '@harness/uicore'
import { get, defaultTo } from 'lodash-es'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ShellScriptMonacoField, ScriptType } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { CreatePRStepData } from './CreatePrStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface CreatePrInputStepProps {
  initialValues: CreatePRStepData
  onUpdate?: (data: CreatePRStepData) => void
  onChange?: (data: CreatePRStepData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: CreatePRStepData
  path?: string
}

export default function CreatePRInputStep(props: CreatePrInputStepProps): React.ReactElement {
  const { template, path, readonly, initialValues, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const scriptType: ScriptType = get(initialValues, 'spec.shell') || 'Bash'
  const prefix = defaultTo(path, '')

  return (
    <FormikForm>
      {getMultiTypeFromValue(get(template, 'timeout', '')) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}.timeout`}
          disabled={readonly}
          fieldPath={'timeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}

      {getMultiTypeFromValue(get(template, 'spec.source.spec.updateConfigScript', '')) ===
      MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.alignStart, stepCss.md)}>
          <MultiTypeFieldSelector
            name={`${prefix}spec.source.spec.updateConfigScript`}
            label={getString('common.script')}
            defaultValueToReset=""
            disabled={readonly}
            allowedTypes={allowableTypes}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            disableTypeSelection={readonly}
            skipRenderValueInExpressionLabel
            expressionRender={
              // istanbul ignore next
              () => {
                // istanbul ignore next
                return (
                  <ShellScriptMonacoField
                    name={`${prefix}spec.source.spec.updateConfigScript`}
                    scriptType={scriptType}
                    disabled={readonly}
                    expressions={expressions}
                  />
                )
              }
            }
          >
            <ShellScriptMonacoField
              name={`${prefix}spec.source.spec.updateConfigScript`}
              scriptType={scriptType}
              disabled={readonly}
              expressions={expressions}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : // istanbul ignore next
      null}
    </FormikForm>
  )
}
