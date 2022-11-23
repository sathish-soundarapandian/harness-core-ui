/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { getScopeOptions, QueueProps } from './helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function QueueInputStep({ inputSetData, readonly, allowableTypes, stepViewType }: QueueProps): React.ReactElement {
  const { expressions } = useVariablesExpression()
  const path = inputSetData?.path || ''
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { getString } = useStrings()
  const scopeOptions = getScopeOptions(getString)

  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
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
            name={`${prefix}timeout`}
            disabled={readonly}
            fieldPath={'timeout'}
            template={inputSetData?.template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.key) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TextFieldInputSetView
            label={getString('pipeline.queueStep.resourceKey')}
            name={`${prefix}spec.key`}
            multiTextInputProps={{ expressions, allowableTypes }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            placeholder={getString('pipeline.queueStep.keyPlaceholder')}
            disabled={!!readonly}
            fieldPath={'spec.key'}
            template={inputSetData?.template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.scope) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormInput.MultiTypeInput
            label={getString('pipeline.queueStep.scope')}
            name={`${prefix}spec.scope`}
            useValue
            selectItems={scopeOptions}
            multiTypeInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            disabled={readonly}
            placeholder={getString('pipeline.queueStep.scopePlaceholder')}
          />
        </div>
      )}
    </>
  )
}

export default QueueInputStep
