/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { ServerlessDeployCommandOptions } from './ServerlessDeployCommandOptions/ServerlessDeployCommandOptions'
import type { ServerlessLambdaDeployStepValues } from './ServerlessLambdaDeploy'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ServverlessLambdaDeployStepInputSetProps {
  initialValues: ServerlessLambdaDeployStepValues
  onUpdate?: (data: ServerlessLambdaDeployStepValues) => void
  stepViewType?: StepViewType
  onChange?: (data: ServerlessLambdaDeployStepValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: ServerlessLambdaDeployStepValues
    path?: string
    readonly?: boolean
  }
}

export const ServerlessLambdaDeployStepInputSet: React.FC<ServverlessLambdaDeployStepInputSetProps> = ({
  inputSetData,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {getMultiTypeFromValue(inputSetData.template?.timeout) === MultiTypeInputType.RUNTIME && (
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
          fieldPath="timeout"
          template={inputSetData.template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.commandOptions) === MultiTypeInputType.RUNTIME && (
        <ServerlessDeployCommandOptions
          isReadonly={inputSetData.readonly}
          inputSetData={inputSetData}
          stepViewType={stepViewType}
        />
      )}
    </>
  )
}
