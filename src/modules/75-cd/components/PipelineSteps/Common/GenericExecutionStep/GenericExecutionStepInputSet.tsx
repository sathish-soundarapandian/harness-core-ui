/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { StepElementConfig } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface GenericExecutionStepInputSetProps {
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: StepElementConfig
    path?: string
    readonly?: boolean
  }
  stepViewType: StepViewType
}

export const GenericExecutionStepInputSet: React.FC<GenericExecutionStepInputSetProps> = ({
  inputSetData,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {getMultiTypeFromValue(inputSetData.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            name={`${isEmpty(inputSetData.path) ? '' : `${inputSetData.path}.`}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: inputSetData.readonly
            }}
            disabled={inputSetData.readonly}
            fieldPath={'timeout'}
            template={inputSetData.template}
          />
        </div>
      )}
    </>
  )
}
