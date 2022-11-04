/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { FormikForm, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { RollbackStackData, RollbackStackProps } from './AzureArmRollback.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export function AzureArmRollbackInputStepRef<T extends RollbackStackData = RollbackStackData>(
  props: RollbackStackProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { inputSetData, readonly, path, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <FormikForm>
      {
        /* istanbul ignore next */
        getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <TimeoutFieldInputSetView
              template={inputSetData?.template}
              fieldPath={'timeout'}
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
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        getMultiTypeFromValue(inputSetData?.template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <TextFieldInputSetView
              template={inputSetData?.template}
              fieldPath={'spec.provisionerIdentifier'}
              name={`${path}.spec.provisionerIdentifier`}
              label={getString('pipelineSteps.provisionerIdentifier')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
            />
          </div>
        )
      }
    </FormikForm>
  )
}

const AzureArmRollbackStackInputStep = connect(AzureArmRollbackInputStepRef)
export default AzureArmRollbackStackInputStep
