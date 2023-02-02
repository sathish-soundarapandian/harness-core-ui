/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import type { AllowedTypes } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { isValueRuntimeInput } from '@common/utils/utils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { CloudFunctionExecutionStepInitialValues } from '@pipeline/utils/types'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface NoTrafficShiftExecutionStepInputSetProps {
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: CloudFunctionExecutionStepInitialValues
    path?: string
    readonly?: boolean
  }
  stepViewType: StepViewType
}

export const NoTrafficShiftExecutionStepInputSet: React.FC<NoTrafficShiftExecutionStepInputSetProps> = ({
  inputSetData,
  allowableTypes,
  stepViewType
}) => {
  const { template, path, readonly } = inputSetData
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const pathPrefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {isValueRuntimeInput(template?.timeout) && (
        <TimeoutFieldInputSetView
          name={`${pathPrefix}timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          disabled={readonly}
          fieldPath={'timeout'}
          template={inputSetData.template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}

      {isValueRuntimeInput(template?.spec?.updateFieldMask) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${pathPrefix}spec.updateFieldMask`}
            label={getString('cd.steps.googleCloudFunctionCommon.fieldMask')}
            placeholder={getString('cd.steps.googleCloudFunctionCommon.fieldMaskPlaceholder')}
            multiTextInputProps={{
              disabled: readonly,
              expressions,
              allowableTypes
            }}
            disabled={readonly}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            fieldPath="spec.updateFieldMask"
            template={template}
          />
        </div>
      )}
    </>
  )
}
