/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { get, isEmpty } from 'lodash-es'

import { getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import type { TerragruntData, TerragruntProps } from './TerragruntInterface'

export default function TerragruntInputStep<T extends TerragruntData = TerragruntData>(
  props: TerragruntProps<T>
): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, path, allowableTypes, stepViewType } = props
  const { expressions } = useVariablesExpression()

  return (
    <FormikForm>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            fieldPath={'timeout'}
            template={inputSetData?.template}
          />
        </div>
      )}
      {getMultiTypeFromValue((inputSetData?.template as TerragruntData)?.spec?.provisionerIdentifier) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${path}.spec.provisionerIdentifier`}
            placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
            label={getString('pipelineSteps.provisionerIdentifier')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            fieldPath={'spec.provisionerIdentifier'}
            template={inputSetData?.template}
          />
        </div>
      )}
      {getMultiTypeFromValue(get(inputSetData?.template, 'spec.configuration.spec.moduleConfig.path')) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            placeholder={'Enter path'}
            label={'Path'}
            name={`${path}.spec.configuration.spec.moduleConfig.path`}
            disabled={readonly}
            template={inputSetData?.template}
            fieldPath={'spec.configuration.spec.moduleConfig.path'}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
    </FormikForm>
  )
}
