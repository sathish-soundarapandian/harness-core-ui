/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { FormikForm } from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { isRuntime } from '../CloudFormationHelper'
import type { RollbackStackData, RollbackStackProps } from '../CloudFormationInterfaces.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export function RollbackStackInputStepRef<T extends RollbackStackData = RollbackStackData>(
  props: RollbackStackProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { inputSetData, readonly, path, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <FormikForm>
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.timeout as string) && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
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
              template={inputSetData?.template}
              fieldPath={'timeout'}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.spec?.configuration?.provisionerIdentifier as string) && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <TextFieldInputSetView
              name={`${path}.spec.configuration.provisionerIdentifier`}
              label={getString('pipelineSteps.provisionerIdentifier')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
              template={inputSetData?.template}
              fieldPath={'spec.configuration.provisionerIdentifier'}
            />
          </div>
        )
      }
    </FormikForm>
  )
}

const RollbackStackInputStep = connect(RollbackStackInputStepRef)
export default RollbackStackInputStep
