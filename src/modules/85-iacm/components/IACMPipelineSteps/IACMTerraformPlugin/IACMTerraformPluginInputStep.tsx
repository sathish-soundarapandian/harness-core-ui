/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { FormikForm, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { CommandTypes, IACMTerraformPluginData, IACMTerraformPluginProps } from './StepTypes.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function IACMTerraformPluginInputStepRef<T extends IACMTerraformPluginData = IACMTerraformPluginData>({
  inputSetData,
  readonly,
  allowableTypes,
  stepViewType
}: IACMTerraformPluginProps<T> & { formik?: FormikContextType<any> }): React.ReactElement {
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
              className={cx(stepCss.formGroup, stepCss.md)}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        getMultiTypeFromValue(inputSetData?.template?.spec?.command) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.MultiTypeInput
              useValue
              name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.command`}
              label={getString('commandLabel')}
              disabled={readonly}
              selectItems={(Object.keys(CommandTypes) as Array<keyof typeof CommandTypes>).map(keyValue => ({
                label: CommandTypes[keyValue],
                value: CommandTypes[keyValue]
              }))}
              multiTypeInputProps={{
                expressions,
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                selectProps: {
                  defaultSelectedItem: {
                    label: CommandTypes.INIT,
                    value: CommandTypes.INIT
                  },
                  items: (Object.keys(CommandTypes) as Array<keyof typeof CommandTypes>).map(keyValue => ({
                    label: CommandTypes[keyValue],
                    value: CommandTypes[keyValue]
                  })),
                  allowCreatingNewItems: false
                }
              }}
            />
          </div>
        )
      }
    </FormikForm>
  )
}

const IACMTerraformPluginInputStep = connect(IACMTerraformPluginInputStepRef)
export default IACMTerraformPluginInputStep
